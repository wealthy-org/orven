# Orven Protocol — Mainnet Pre-Flight & Real Coin Deployment Guide (`MAINNET_PREFLIGHT_GUIDE.md`)

**Target Network:** Robinhood Chain Mainnet (Chain ID: `4663`)  
**Target Date:** Production Deployment Window  
**Authority Directive:** Manager's Core Philosophy on Mainnet Parity  
> *"Ini nanti outputnya sampai ke tahap mainnet, tapi sementara ditest secara fungsional by-code sama by end-to-end user sampai ke tahap testnet dulu aja. Kalau semua sudah oke untuk bagian mainnet nya nanti baru di-deploy ulang, untuk tahapan mainnet nya jangan terlalu dipikir berat, yang terpenting nanti secara fungsional test nya untuk testnet maupun mainnet itu hampir sama aja pembeda nya yang satu pakai coin buat test seperti simulasi yang satu nya pakai real coin."*

---

## 1. Parameter Jaringan & Spesifikasi Teknis Mainnet

| Parameter | Nilai Resmi Mainnet | Catatan Verifikasi |
|---|---|---|
| **Network Name** | Robinhood Chain | L1/L2 kompatibel EVM |
| **Chain ID** | `4663` | Validated in `packages/product-config` |
| **RPC Endpoint** | `https://rpc.mainnet.chain.robinhood.com` | Public high-availability endpoint |
| **Block Explorer** | `https://robinhoodchain.blockscout.com` | Eksplorer resmi verifikasi kontrak |
| **Native Currency** | Ether (`ETH`) — 18 Decimals | Digunakan untuk gas settlement |
| **Settlement Token** | Global Dollar (`USDG`) — 6 Decimals | `0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168` |
| **Wrapped Ether** | Wrapped Ether (`WETH`) — 18 Decimals | `0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73` |
| **Admin Architecture** | Single-Wallet Admin (No multisig per brief) | Section 6 Developer Brief |

---

## 2. Standar Keamanan & Manajemen Secret (Zero-Leakage Policy)

Untuk menjamin keamanan aset berharga (real coin) di Mainnet:
1. **Dilarang Keras** menuliskan `DEPLOYER_PRIVATE_KEY` ke dalam file kode, git commit, atau file disk yang berpotensi terunggah ke remote.
2. File `.env` telah diproteksi di `.gitignore`. Namun cara paling aman adalah **menginjeksi environment variable langsung di sesi terminal** atau menggunakan secret vault (misal: Doppler, Infisical, atau GitHub Actions Secrets).
3. Gunakan address deployer yang didanai secukupnya untuk gas deployment (~0.05 - 0.20 ETH di Robinhood Chain).

---

## 3. Tahapan Eksekusi Deployment Mainnet (Step-by-Step)

### Langkah 1: Jalankan Pre-Flight Verification Otomatis
Sebelum menyentuh coin asli, pastikan seluruh 35 check sistem dalam kondisi hijau:

```bash
npm run verify:mainnet
```
*Kriteria Lolos:* Output terminal harus menyatakan `35/35 CHECKS PASSED — 100% PASS`.

---

### Langkah 2: Jalankan Deployment Kontrak On-Chain dengan Real Coin
Eksekusi deployment 16 smart contract protokol ke Robinhood Chain Mainnet:

```bash
DEPLOYER_PRIVATE_KEY=0x<PRIVATE_KEY_ADMIN_ANDA> npm run deploy:mainnet
```

**Proses Otomatis yang Terjadi:**
1. Memvalidasi artefak Solc 0.8.30 di `upstream/ostra-robinhood/out`.
2. Menghubungkan deployer address ke RPC `https://rpc.mainnet.chain.robinhood.com`.
3. Menerbitkan 16 kontrak protokol:
   - `OstraVault` Implementation & Beacon
   - `OstraVaultFactory`
   - `OstraPool` Implementation, Beacon & Hook
   - `OstraLaunchpad` & Creator Split Factory
   - `OstraRegistry` & VaultModule
   - `OstraRouter` & SpendVerifier
   - `OstraPrivatePool` (STARK Shielded Pool)
   - `OrvenPad` (Decentralized Work Marketplace)
4. Memperbarui manifest resmi produksi di `deployments/robinhood-mainnet.json`.

---

### Langkah 3: Publikasikan MCP Agent Tooling ke NPM Registry
Rilis paket agen autonomous agar client AI dapat menginstalnya secara global dengan tag `latest`:

```bash
cd packages/mcp
npm run publish:latest
```
Setelah terbit, agen di seluruh dunia dapat langsung menjalankan:
```bash
npx @orven/mcp@latest
```

---

### Langkah 4: Publikasikan Web Application ke Vercel / Cloud
1. Pastikan build Next.js 14 siap:
   ```bash
   npm run build:web
   ```
2. Hubungkan repositori ke dashboard Vercel (atau deploy via Vercel CLI):
   ```bash
   vercel --prod
   ```
3. Set environment variable produksi di Vercel:
   - `NEXT_PUBLIC_RELAYER_API=https://api.orven.network`
   - `NEXT_PUBLIC_AI_GATEWAY=https://ai.orven.network`
   - `NEXT_PUBLIC_DEFAULT_CHAIN=4663`

---

### Langkah 5: Jalankan Service Backend (API & AI Gateway) di Production Host
Deploy service `services/application-api` (Port 4010) dan `services/ai-gateway` (Port 4020) menggunakan process manager seperti `pm2` atau container Docker:

```bash
# Menjalankan Application & Relayer API
cd services/application-api
PORT=4010 node dist/index.js

# Menjalankan AI Gateway dengan Provider Nyata
cd services/ai-gateway
PORT=4020 AI_PROVIDER=anthropic ANTHROPIC_API_KEY=sk-ant-... node dist/index.js
```

---

### Langkah 6: Smoke Test Pasca Deployment di Mainnet
Lakukan verifikasi kilat menggunakan browser:
1. Kunjungi rute `/vault` di Web App produksi.
2. Sambungkan wallet browser (atau generate WOTS vault seed lokal).
3. Verifikasi saldo real USDG / ETH tampil sesuai data on-chain.
4. Lakukan 1 transaksi swap uji coba di `/swap` untuk memverifikasi eksekusi relayer gas USDG.

---

## 4. Prosedur Darurat & Circuit Breaker

Sesuai dokumen `docs/RUNBOOKS.md`:
- **Pause Darurat:** Single-Wallet Admin memegang wewenang memanggil fungsi `pause()` pada `OstraVaultFactory` dan `OstraRouter` jika terdeteksi aktivitas anomali.
- **WOTS Mutex Collision:** Keystore browser memiliki mutex lock 3,000ms untuk mencegah multi-tab signature collision.
- **Relayer Rate Limit:** Relayer secara otomatis membatasi 30 request per menit per IP/Vault untuk menangkis DoS.

---

**Disahkan oleh Tim BMAD:**  
- 🎯 Sofia (PO) & 🏗️ Winston (Architect) & 🔒 Vex (Security)
