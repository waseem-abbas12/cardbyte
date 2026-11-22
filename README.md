# Cardbyte Pro - High-Speed Digital Gift Card & Crypto Exchange

Cardbyte Pro is an institutional-grade, high-speed digital gift card trading platform and OTC liquidity settlement engine built with **Next.js 14 (App Router)**, **TypeScript**, and **Tailwind CSS**.

---

## 🚀 Key Features

- **Live Valuation Calculator**: Instant quotations supporting both **E-Codes** and **Physical Cards** with country-specific wholesale margin parity.
- **3-Step Streamlined Trade Wizard**:
  1. *Instant Quote*: Real-time payout calculations in USDT (TRC20, BEP20), Bitcoin, Solana, Bank Wires (USD, EUR, NGN), or Mobile Money (GHS MoMo).
  2. *Card Submission*: Multi-card code entry, optional security PIN, and receipt/card back image upload.
  3. *Escrow Payout Settlement*: Direct delivery to buyer's configured crypto address or bank.
- **Live Order Tracking Portal (`/track`)**:
  - Secure tracking code format (`CB-XXXX-XXXX`).
  - Zero-knowledge redaction of card codes and PINs on public view.
  - Real-time 2-way customer & operator chat.
- **Integrated User Wallet Manager (`/wallet`)**:
  - Stores user payout rails locally in browser storage (`localStorage`) for quick auto-fill at checkout.
- **Comprehensive Admin Desk Vault HQ (`/admin` or `/desk-vault-hq`)**:
  - **Dual-Factor Security Authentication**: Stage 1 Master Secret Key + Stage 2 6-Digit Security PIN with HMAC-signed challenge handoff (90s window).
  - **Brute-Force Defense**: Sliding window rate-limiting with 5-attempt threshold resulting in a 15-minute IP lockdown.
  - **Orders Management**: Full status control (`PENDING`, `IN_REVIEW`, `COMPLETED`, `REJECTED`), payout transaction hash input, customer messaging, and receipt inspection modal.
  - **Rates & Brands Catalog**: Full CRUD for gift card brands, country regional rates, available nominals, and custom order sorting.
  - **Layout & Headless CMS**: Drag-and-drop section reordering, live announcement ticker editor, FAQ management, and custom content pages (`/p/[slug]`).
  - **Staff Sub-Accounts (RBAC)**: Create and manage operator accounts with scoped permissions (Support, Moderator, Admin).

---

## 🛠️ Getting Started

### 1. Prerequisites
- Node.js 18.17+ or higher
- npm, pnpm, or yarn

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/waseem-abbas12/cardbyte.git
cd cardbyte

# Install dependencies
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Configure your master credentials:
```env
ADMIN_SECRET_KEY=your_secure_master_key_here
ADMIN_SECURITY_PIN=849201
```

### 4. Running Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Production Build
```bash
npm run build
npm start
```

---

## 🔐 Administrative Access

Navigate to either:
- `/admin`
- `/desk-vault-hq`

### Default Development Credentials
- **Stage 1 (Master Key):** `cardbyte-master-key-2026`
- **Stage 2 (6-Digit PIN):** `849201`

*(Be sure to customize these in your environment variables before public production deployment).*

---

## 🎨 Theme & Customization

The platform features a **Fintech Prestige** color palette inspired by market leaders (Cardtonic, Prestmit, Stripe):
- **Light Theme**: Crisp white (`#ffffff`), Slate surface (`#f8fafc`), High-contrast text (`#0b1528`).
- **Dark Theme**: Deep Prussian Navy (`#070d1e`), Midnight Card (`#101c3d`), Electric Blue (`#2563eb`), Neon Emerald (`#10b981`).
- Switch dynamically using the sun/moon button in the top navigation.

---

## 📄 License
Private & Proprietary. All rights reserved.
