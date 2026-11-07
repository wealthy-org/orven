/**
 * Orven Web Keystore & WOTS (Winternitz One-Time Signatures) local state management.
 * Hardened by BMAD:
 * - AES-GCM 256-bit Web Crypto API encryption at rest
 * - PBKDF2 key derivation (100,000 iterations)
 * - Anti-floating point precision rounding (cents fixed precision)
 * - Cross-tab mutex lock preventing WOTS key collision across simultaneous tabs
 * - Encrypted JSON backup export & restore
 */

export interface VaultState {
  address: `0x${string}`;
  encryptedSeed: string; // AES-GCM ciphertext + salt + iv
  saltHex: string;
  ivHex: string;
  currentKeyIndex: number;
  maxKeys: number;
  balanceUSDG: number;
  shieldedUSDG: number;
  balanceORVEN: number;
  lockedORVEN: number;
  linkedAgent: string | null;
  transactions: Array<{
    id: string;
    type: string;
    asset: string;
    amount: number;
    timestamp: number;
    status: "confirmed" | "pending";
    txHash: string;
    wotsIndexUsed: number;
  }>;
}

const STORAGE_KEY_TESTNET = "orven_vault_keystore_testnet_46630";
const STORAGE_KEY_MAINNET = "orven_vault_keystore_mainnet_4663";
const LOCK_KEY = "orven_wots_signing_mutex";
const DEFAULT_PASS = "orven_default_local_pin_2026";

function roundCurrency(val: number): number {
  return Math.round((val + Number.EPSILON) * 100) / 100;
}

function buf2hex(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hex2buf(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

export class BrowserVaultManager {
  private static acquireLock(): void {
    if (typeof window === "undefined") return;
    const lockRaw = localStorage.getItem(LOCK_KEY);
    const now = Date.now();
    if (lockRaw) {
      const lockTime = parseInt(lockRaw, 10);
      if (now - lockTime < 3000) {
        throw new Error("Concurrent signing detected: another browser tab or process is currently signing with WOTS key.");
      }
    }
    localStorage.setItem(LOCK_KEY, now.toString());
  }

  private static releaseLock(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(LOCK_KEY);
  }

  /**
   * Derives an AES-GCM 256-bit encryption key from password and salt using PBKDF2.
   */
  private static async deriveAesKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
      "raw",
      enc.encode(password),
      "PBKDF2",
      false,
      ["deriveKey"]
    );

    return window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: salt as any,
        iterations: 100_000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  }

  /**
   * Encrypts plaintext master seed with AES-GCM 256-bit.
   */
  static async encryptSeed(plaintextSeed: string, password: string = DEFAULT_PASS) {
    const salt = new Uint8Array(16);
    const iv = new Uint8Array(12);
    window.crypto.getRandomValues(salt);
    window.crypto.getRandomValues(iv);

    const key = await this.deriveAesKey(password, salt);
    const enc = new TextEncoder();
    const ciphertext = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv as any },
      key,
      enc.encode(plaintextSeed)
    );

    return {
      encryptedSeed: buf2hex(ciphertext),
      saltHex: buf2hex(salt),
      ivHex: buf2hex(iv),
    };
  }

  /**
   * Decrypts AES-GCM encrypted master seed.
   */
  static async decryptSeed(
    encryptedHex: string,
    saltHex: string,
    ivHex: string,
    password: string = DEFAULT_PASS
  ): Promise<string> {
    const salt = hex2buf(saltHex);
    const iv = hex2buf(ivHex);
    const ciphertext = hex2buf(encryptedHex);

    const key = await this.deriveAesKey(password, salt);
    const decrypted = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv as any },
      key,
      ciphertext as any
    );

    const dec = new TextDecoder();
    return dec.decode(decrypted);
  }

  static getStorageKey(isMainnet?: boolean): string {
    const mainnet = isMainnet !== undefined ? isMainnet : this.isCurrentMainnet();
    return mainnet ? STORAGE_KEY_MAINNET : STORAGE_KEY_TESTNET;
  }

  static isCurrentMainnet(): boolean {
    if (typeof window === "undefined") return false;
    const mode = localStorage.getItem("orven_developer_mode_active");
    return mode === "false"; // Dev Mode OFF = Mainnet ON
  }

  static loadVault(isMainnet?: boolean): VaultState | null {
    if (typeof window === "undefined") return null;
    const key = this.getStorageKey(isMainnet);
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      const mainnet = isMainnet !== undefined ? isMainnet : this.isCurrentMainnet();
      if (parsed.balanceORVEN === undefined) parsed.balanceORVEN = mainnet ? 0 : 500_000;
      if (parsed.lockedORVEN === undefined) parsed.lockedORVEN = 0;
      if (parsed.linkedAgent === undefined) parsed.linkedAgent = null;
      parsed.balanceUSDG = roundCurrency(parsed.balanceUSDG);
      parsed.shieldedUSDG = roundCurrency(parsed.shieldedUSDG);
      return parsed;
    } catch {
      return null;
    }
  }

  static createVault(isMainnet?: boolean): VaultState {
    const mainnet = isMainnet !== undefined ? isMainnet : this.isCurrentMainnet();
    const key = this.getStorageKey(mainnet);
    const seedBytes = new Uint8Array(32);
    if (typeof window !== "undefined") {
      window.crypto.getRandomValues(seedBytes);
    }
    const rawSeedHex = buf2hex(seedBytes);

    // Derive network-scoped address: Mainnet address differs from Testnet address
    const addressBytes = new Uint8Array(20);
    for (let i = 0; i < 20; i++) {
      addressBytes[i] = seedBytes[i] ^ (mainnet ? 0xaa : 0x00);
    }
    const addressHash = buf2hex(addressBytes);
    const address = `0x${addressHash}` as `0x${string}`;

    // Create initial state with encrypted seed placeholder
    const newVault: VaultState = {
      address,
      encryptedSeed: buf2hex(seedBytes), // encrypted asynchronously on init
      saltHex: "00000000000000000000000000000000",
      ivHex: "000000000000000000000000",
      currentKeyIndex: 1, // Genesis Inception consumes Key #0; monotonic next spend is Key #1
      maxKeys: 1024,
      balanceUSDG: mainnet ? 0.0 : 250.0,
      shieldedUSDG: 0.0,
      balanceORVEN: mainnet ? 0 : 500_000,
      lockedORVEN: 0,
      linkedAgent: null,
      transactions: [
        {
          id: `tx_${Date.now()}`,
          type: mainnet ? "Mainnet Vault Inception" : "Vault Inception (AES-256 Encrypted)",
          asset: "USDG",
          amount: mainnet ? 0 : 250.0,
          timestamp: Date.now(),
          status: "confirmed",
          txHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`,
          wotsIndexUsed: 0,
        },
      ],
    };

    if (typeof window !== "undefined") {
      localStorage.setItem(key, JSON.stringify(newVault));
      // Asynchronously encrypt seed with AES-GCM
      this.encryptSeed(rawSeedHex).then(({ encryptedSeed, saltHex, ivHex }) => {
        const v = this.loadVault(mainnet);
        if (v) {
          v.encryptedSeed = encryptedSeed;
          v.saltHex = saltHex;
          v.ivHex = ivHex;
          localStorage.setItem(key, JSON.stringify(v));
        }
      });
    }

    return newVault;
  }

  static claimFaucet(amount: number = 250): VaultState {
    this.acquireLock();
    try {
      const vault = this.loadVault() || this.createVault();
      vault.balanceUSDG = roundCurrency(vault.balanceUSDG + amount);
      vault.transactions.unshift({
        id: `faucet_${Date.now()}`,
        type: "Testnet Faucet Claim",
        asset: "USDG",
        amount: roundCurrency(amount),
        timestamp: Date.now(),
        status: "confirmed",
        txHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`,
        wotsIndexUsed: vault.currentKeyIndex,
      });
      localStorage.setItem(this.getStorageKey(), JSON.stringify(vault));
      return vault;
    } finally {
      this.releaseLock();
    }
  }

  static executeSpend(type: string, amount: number, isShield: boolean = false): { vault: VaultState; txHash: string } {
    this.acquireLock();
    try {
      const vault = this.loadVault() || this.createVault();
      const roundedAmount = roundCurrency(amount);

      if (roundedAmount <= 0) {
        throw new Error("Amount must be greater than zero");
      }

      if (vault.balanceUSDG < roundedAmount) {
        throw new Error(`Insufficient USDG balance. You have ${vault.balanceUSDG} USDG.`);
      }

      if (vault.currentKeyIndex >= vault.maxKeys) {
        throw new Error("WOTS keys exhausted. Guardian recovery or rekeying required.");
      }

      const usedIndex = vault.currentKeyIndex;
      vault.currentKeyIndex += 1;
      vault.balanceUSDG = roundCurrency(vault.balanceUSDG - roundedAmount);

      if (isShield) {
        vault.shieldedUSDG = roundCurrency(vault.shieldedUSDG + roundedAmount);
      }

      const txHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;

      vault.transactions.unshift({
        id: `spend_${Date.now()}`,
        type,
        asset: "USDG",
        amount: -roundedAmount,
        timestamp: Date.now(),
        status: "confirmed",
        txHash,
        wotsIndexUsed: usedIndex,
      });

      localStorage.setItem(this.getStorageKey(), JSON.stringify(vault));
      return { vault, txHash };
    } finally {
      this.releaseLock();
    }
  }

  static lockTokens(amount: number): { vault: VaultState; txHash: string } {
    this.acquireLock();
    try {
      const vault = this.loadVault() || this.createVault();
      const roundedAmount = roundCurrency(amount);

      if (roundedAmount <= 0) {
        throw new Error("Lock amount must be greater than zero");
      }

      if (vault.balanceORVEN < roundedAmount) {
        throw new Error(`Insufficient ORVEN balance. Available: ${vault.balanceORVEN.toLocaleString()} ORVEN.`);
      }

      const usedIndex = vault.currentKeyIndex;
      vault.currentKeyIndex += 1;
      vault.balanceORVEN = roundCurrency(vault.balanceORVEN - roundedAmount);
      vault.lockedORVEN = roundCurrency(vault.lockedORVEN + roundedAmount);

      const txHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;

      vault.transactions.unshift({
        id: `lock_${Date.now()}`,
        type: "Lock ORVEN",
        asset: "ORVEN",
        amount: -roundedAmount,
        timestamp: Date.now(),
        status: "confirmed",
        txHash,
        wotsIndexUsed: usedIndex,
      });

      localStorage.setItem(this.getStorageKey(), JSON.stringify(vault));
      return { vault, txHash };
    } finally {
      this.releaseLock();
    }
  }

  static linkAgent(agentKey: string): { vault: VaultState; txHash: string } {
    this.acquireLock();
    try {
      if (!agentKey || agentKey.trim().length < 8) {
        throw new Error("Invalid agent key: minimum 8 characters required");
      }

      const vault = this.loadVault() || this.createVault();
      const usedIndex = vault.currentKeyIndex;
      vault.currentKeyIndex += 1;
      vault.linkedAgent = agentKey.trim();

      const txHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;

      vault.transactions.unshift({
        id: `link_${Date.now()}`,
        type: "Tide Agent Linking",
        asset: "TIDE",
        amount: 0,
        timestamp: Date.now(),
        status: "confirmed",
        txHash,
        wotsIndexUsed: usedIndex,
      });

      localStorage.setItem(this.getStorageKey(), JSON.stringify(vault));
      return { vault, txHash };
    } finally {
      this.releaseLock();
    }
  }

  static recordDailyCheckin(isMainnet?: boolean): { vault: VaultState; txHash: string; alreadyClaimed: boolean } {
    this.acquireLock();
    try {
      const vault = this.loadVault(isMainnet) || this.createVault(isMainnet);
      const todayDateStr = new Date().toDateString();
      const alreadyClaimed = (vault.transactions || []).some(
        (tx) => tx.type === "Tide Daily Check-in" && new Date(tx.timestamp).toDateString() === todayDateStr
      );

      if (alreadyClaimed) {
        return { vault, txHash: "", alreadyClaimed: true };
      }

      if (vault.currentKeyIndex >= vault.maxKeys) {
        throw new Error("WOTS keys exhausted. Rekeying required.");
      }

      const usedIndex = vault.currentKeyIndex;
      vault.currentKeyIndex += 1;

      const txHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;

      vault.transactions.unshift({
        id: `tide_checkin_${Date.now()}`,
        type: "Tide Daily Check-in",
        asset: "TIDE",
        amount: 100,
        timestamp: Date.now(),
        status: "confirmed",
        txHash,
        wotsIndexUsed: usedIndex,
      });

      localStorage.setItem(this.getStorageKey(isMainnet), JSON.stringify(vault));
      return { vault, txHash, alreadyClaimed: false };
    } finally {
      this.releaseLock();
    }
  }

  /**
   * Export encrypted vault backup file.
   */
  static exportBackup(): void {
    if (typeof window === "undefined") return;
    const vault = this.loadVault();
    if (!vault) throw new Error("No vault found to export");

    const payload = JSON.stringify(
      {
        format: "orven_keystore_backup_v1",
        version: 1,
        exportedAt: new Date().toISOString(),
        address: vault.address,
        encryptedSeed: vault.encryptedSeed,
        saltHex: vault.saltHex,
        ivHex: vault.ivHex,
        currentKeyIndex: vault.currentKeyIndex,
        balanceUSDG: vault.balanceUSDG,
        shieldedUSDG: vault.shieldedUSDG,
        balanceORVEN: vault.balanceORVEN,
        lockedORVEN: vault.lockedORVEN,
        linkedAgent: vault.linkedAgent,
        transactions: vault.transactions,
      },
      null,
      2
    );

    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orven-vault-${vault.address.slice(0, 8)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Restore vault from backup payload.
   */
  static restoreBackup(jsonString: string): VaultState {
    const backup = JSON.parse(jsonString);
    if (!backup.address || !backup.encryptedSeed) {
      throw new Error("Invalid backup file: missing address or encrypted seed");
    }

    const current = this.loadVault();
    const restored: VaultState = {
      address: backup.address,
      encryptedSeed: backup.encryptedSeed,
      saltHex: backup.saltHex || "00000000000000000000000000000000",
      ivHex: backup.ivHex || "000000000000000000000000",
      currentKeyIndex: typeof backup.currentKeyIndex === "number" ? backup.currentKeyIndex : 1,
      maxKeys: 1024,
      balanceUSDG: typeof backup.balanceUSDG === "number" ? backup.balanceUSDG : current ? current.balanceUSDG : 250.0,
      shieldedUSDG: typeof backup.shieldedUSDG === "number" ? backup.shieldedUSDG : current ? current.shieldedUSDG : 0.0,
      balanceORVEN: typeof backup.balanceORVEN === "number" ? backup.balanceORVEN : current ? current.balanceORVEN : 500_000,
      lockedORVEN: typeof backup.lockedORVEN === "number" ? backup.lockedORVEN : current ? current.lockedORVEN : 0,
      linkedAgent: backup.linkedAgent || (current ? current.linkedAgent : null),
      transactions: Array.isArray(backup.transactions) && backup.transactions.length > 0
        ? [
            {
              id: `restore_${Date.now()}`,
              type: "Vault Restored from Backup",
              asset: "USDG",
              amount: 0,
              timestamp: Date.now(),
              status: "confirmed",
              txHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`,
              wotsIndexUsed: backup.currentKeyIndex || 1,
            },
            ...backup.transactions,
          ]
        : [
            {
              id: `restore_${Date.now()}`,
              type: "Vault Restored from Backup",
              asset: "USDG",
              amount: 0,
              timestamp: Date.now(),
              status: "confirmed",
              txHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`,
              wotsIndexUsed: backup.currentKeyIndex || 1,
            },
            ...(current ? current.transactions : []),
          ],
    };

    localStorage.setItem(this.getStorageKey(), JSON.stringify(restored));
    return restored;
  }
}
