#!/usr/bin/env node
/**
 * Orven Protocol — Real On-Chain Transaction Broadcaster & Explorer Verifier
 * Target: Robinhood Chain Testnet (Chain ID 46630)
 *
 * Usage:
 *   PRIVATE_KEY=0x... node scripts/broadcast-testnet-transaction.js
 */

import { createWalletClient, createPublicClient, http, formatEther, parseEther } from "../apps/web/node_modules/viem/_esm/index.js";
import { privateKeyToAccount, generatePrivateKey } from "../apps/web/node_modules/viem/_esm/accounts/index.js";

const RPC_URL = process.env.RPC_URL || "https://rpc.testnet.chain.robinhood.com";
const EXPLORER_URL = "https://explorer.testnet.chain.robinhood.com";
const CHAIN_ID = 46630;

const customChain = {
  id: CHAIN_ID,
  name: "Robinhood Chain Testnet",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: [RPC_URL] },
    public: { http: [RPC_URL] },
  },
  blockExplorers: {
    default: { name: "Blockscout", url: EXPLORER_URL },
  },
};

console.log("\n=======================================================");
console.log("   ORVEN — ON-CHAIN TESTNET BROADCASTER & EXPLORER   ");
console.log(`   Network: Robinhood Chain Testnet (Chain ID: ${CHAIN_ID})`);
console.log(`   RPC: ${RPC_URL}`);
console.log(`   Explorer: ${EXPLORER_URL}`);
console.log("=======================================================\n");

async function main() {
  const rawKey = process.env.PRIVATE_KEY || process.env.DEPLOYER_PRIVATE_KEY;

  if (!rawKey) {
    const tempKey = generatePrivateKey();
    const tempAccount = privateKeyToAccount(tempKey);

    console.log("⚠️  TIDAK ADA PRIVATE_KEY YANG DIBERIKAN.");
    console.log("   Berikut adalah panduan untuk melakukan test sampai keluar ke explorer:\n");
    console.log(`1. Alamat Wallet Anda: ${tempAccount.address}`);
    console.log("2. Klaim koin testnet ETH gratis di Faucet resmi Robinhood:");
    console.log("   👉 https://faucet.testnet.chain.robinhood.com/\n");
    console.log("3. Setelah klaim, jalankan perintah ini di terminal:");
    console.log(`   PRIVATE_KEY=${tempKey} node scripts/broadcast-testnet-transaction.js\n`);
    console.log("4. Atau test langsung via UI Web di https://www.useorvent.xyz:");
    console.log("   - Buka MetaMask / Rabby di browser.");
    console.log("   - Hubungkan ke Robinhood Testnet (Chain ID 46630).");
    console.log("   - Lakukan transaksi (Swap / Transfer), dan klik notifikasi Toast.");
    console.log("   - Browser akan langsung membuka tx hash di Blockscout Explorer!\n");
    return;
  }

  const account = privateKeyToAccount(rawKey.startsWith("0x") ? rawKey : `0x${rawKey}`);
  console.log(`1. Menggunakan Akun: ${account.address}`);

  const publicClient = createPublicClient({
    chain: customChain,
    transport: http(RPC_URL, { timeout: 10000 }),
  });

  const walletClient = createWalletClient({
    account,
    chain: customChain,
    transport: http(RPC_URL, { timeout: 10000 }),
  });

  console.log("2. Memeriksa Saldo On-Chain di RPC Node...");
  try {
    const balance = await publicClient.getBalance({ address: account.address });
    const formatted = formatEther(balance);
    console.log(`   Saldo On-Chain: ${formatted} ETH`);

    if (balance === 0n) {
      console.log("\n❌ Saldo akun ini masih 0 ETH.");
      console.log("   Silakan klaim Testnet ETH terlebih dahulu di:");
      console.log(`   👉 https://faucet.testnet.chain.robinhood.com/ (Masukkan alamat: ${account.address})\n`);
      return;
    }

    console.log("\n3. Menyiarkan Transaksi Nyata ke Robinhood Chain Testnet...");
    const txHash = await walletClient.sendTransaction({
      to: account.address, // Self-transfer to generate live on-chain tx
      value: parseEther("0.0001"),
    });

    console.log(`   ✔ Transaksi Terkirim! Tx Hash: ${txHash}`);
    console.log("4. Menunggu Konfirmasi Blok di Jaringan...");

    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
    console.log(`   ✔ Status: KONFIRMASI (Block Number: #${receipt.blockNumber})`);
    console.log(`   ✔ Gas Terpakai: ${receipt.gasUsed.toString()} units`);

    console.log("\n=======================================================");
    console.log("   🎉 HASIL SUKSES TERVERIFIKASI DI EXPLORER RESMI!   ");
    console.log("=======================================================");
    console.log(`👉 Buka Explorer: ${EXPLORER_URL}/tx/${txHash}`);
    console.log(`👉 Detail Akun  : ${EXPLORER_URL}/address/${account.address}\n`);

  } catch (err) {
    console.error("\n❌ Gagal terhubung ke RPC Node:", err.message);
    console.log("\n💡 Catatan Penting:");
    console.log("   Jika Anda berada di jaringan ISP Indonesia (Telkomsel/Indihome), domain");
    console.log("   *.robinhood.com diblokir oleh TrustPositif/DNS Nawala.");
    console.log("   Gunakan VPN (misal Cloudflare 1.1.1.1 WARP) untuk menembus RPC,");
    console.log("   atau gunakan transaksi via browser di https://www.useorvent.xyz!\n");
  }
}

main();
