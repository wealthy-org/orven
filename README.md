# Orven Protocol — Robinhood Chain

> **Autonomous Agent Financial & Commerce Platform on Robinhood Chain**  
> Built with Post-Quantum WOTS Vaults, x402 Payment Channels, STARK Note Privacy, OrvenPad Decentralized Marketplace, and Fair Token Launchpad.

---

## 📌 Executive Status & Scope

- **Jaringan Target:** Robinhood Chain Testnet (Chain ID `46630`) → Mainnet (Chain ID `4663`)
- **Status Pengembangan:** **Milestone A–H Lengkap (Testnet Simulation Mode)**
- **Prinsip Utama:** *Copycat-First Parity* terhadap referensi Ostra (`app.ostraagent.xyz`), tanpa pemotongan fitur ke MVP.
- **Arahan Manajemen:** Fokus pengujian fungsional penuh (by-code & E2E) wajib tuntas dan terbukti di **Testnet (simulasi coin)** terlebih dahulu. Transisi ke Mainnet (real coin) dilakukan setelah seluruh testnet terbukti aman dan stabil.

---

## 🏛️ Arsitektur Sistem

```mermaid
flowchart TD
  subgraph Clients [Permukaan Pengguna & Agen]
    U[Human Users / Browser Extension] --> W[Orven Web App - Next.js\nPort 3000]
    A[Autonomous AI Agents] --> M[Orven Local MCP Server\n@orven/mcp (stdio)]
  end

  subgraph Services [Layanan Backend Orven]
    W --> API[Application & Relayer API\nPort 4010]
    M --> API
    W --> G[AI Task Gateway\nPort 4020]
    M --> G
  end

  subgraph OnChain [Robinhood Chain Contracts]
    API --> C[Robinhood Chain Testnet 46630\n(Vaults, Router, Pool, Pad)]
    G --> P[External AI Providers\n(OpenAI, Anthropic, BFL, Runway)]
  end
```

---

## 🚀 Quick Start (Menjalankan Seluruh Platform)

### 1. Build Seluruh Monorepo (5 Workspace Sekaligus)
```bash
npm run build:all
```

### 2. Jalankan Seluruh Platform Sekaligus (Satu Perintah)
Perintah ini akan menyalakan **Web App (3000)**, **Relayer API (4010)**, dan **AI Gateway (4020)** secara bersamaan dengan log berwarna:
```bash
npm run dev
```

Buka browser di:
👉 **[http://localhost:3000](http://localhost:3000)**

### 3. Jalankan Layanan Secara Terpisah (Opsional)
```bash
# Frontend Web Application (Port 3000)
npm run dev:web

# Application API & Relayer Sponsorship (Port 4010)
npm run dev:api

# AI Inference & Metering Gateway (Port 4020)
npm run dev:ai

# MCP Server untuk AI Agent Mandiri (stdio)
npm run start:mcp
```

---

## 📁 Struktur Direktori Monorepo

```text
orven/
├── apps/
│   └── web/                   # Next.js 14 Web App (UIKit Orven, in-browser WOTS keystore, Faucet)
├── packages/
│   ├── product-config/        # Konfigurasi rantai, token USDG/WETH, design tokens, fee tiers
│   └── mcp/                   # @orven/mcp server resmi (JSON-RPC 2.0 stdio)
├── services/
│   ├── ai-gateway/            # AI inference gateway, kuotasi & reservasi mikro-USDG
│   └── application-api/       # Relayer sponsorship engine & portofolio indexer
├── upstream/
│   ├── ostra-robinhood/       # Core protocol contracts & launchpad (Solc 0.8.30)
│   ├── ostra-swap/            # Router Uniswap v3/v4 & STARK privacy verifier
│   └── ostrapad/              # Decentralized work marketplace escrow
├── deployments/
│   └── robinhood-testnet.json # Deployment manifest skema Testnet 46630
├── scripts/
│   └── start-all.js           # Orkestrator fullstack satu-perintah
├── BASELINE.md                # Laporan audit sumber upstream & toolchain
├── ECONOMICS.md               # Model ekonomi, pembagian fee 70/30, tier diskon
├── ACCEPTANCE.md              # Matriks verifikasi 11 perjalanan E2E testnet
└── ORVEN_ROBINHOOD_DEV_BRIEF.md # Dokumen brief spesifikasi lengkap
```

---

## 📚 Dokumen Spesifikasi Resmi

- **[`BASELINE.md`](./BASELINE.md):** Analisis ketergantungan upstream, versi commit, dan hasil audit kompilasi smart contract.
- **[`ECONOMICS.md`](./ECONOMICS.md):** Rincian parameter ekonomi: base swap fee `0.20%`, hook fee launchpad `1.00%` (70% creator / 30% protocol), marketplace fee `0.50%`, dan biaya gas relayer `0.05 USDG`.
- **[`ACCEPTANCE.md`](./ACCEPTANCE.md):** Matriks akseptasi 11 skenario end-to-end yang wajib terverifikasi sebelum rilis mainnet.
- **[`ORVEN_ROBINHOOD_DEV_BRIEF.md`](./ORVEN_ROBINHOOD_DEV_BRIEF.md):** Arahan asli pemilik produk dan arsitektur target.

---

## 🛡️ Keamanan & Catatan Jaringan

1. **WOTS Non-Reuse Invariant:** Satu kunci tanda tangan satu kali (WOTS) tidak boleh menandatangani dua pesan berbeda. Kunci dikelola oleh `BrowserVaultManager` di Web App dan di-rotasi secara monotonik (Key `#0`, `#1`, dst.).
2. **Koneksi RPC & Akses ISP:** Beberapa ISP di Indonesia membatasi akses RPC publik Robinhood Chain. Gunakan VPN saat melakukan pengujian jaringan langsung jika terjadi kendala timeout koneksi RPC.
3. **Single Wallet Admin:** Model kepemilikan protokol menggunakan dompet tunggal terpercaya (sesuai preseden Counter project). Timelock kontraktual dipasang untuk melindungi aset treasury.
