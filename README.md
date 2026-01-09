---

# 📘 LazorKit Referral Demo (Zealy-Style)

A simple starter UI demonstrating **passkey login**, **smart wallets**, and **referral-based onboarding** on Solana using **Lazorkit** — with no seed phrases or browser extensions.

This demo helps you see how Lazorkit can power **Zealy-like task systems**, **community referral flows**, **badge claiming**, and more.

---

## 🚀 What This Project Does

This UI showcases:

* 🔐 **Passkey Login** using Lazorkit WebAuthn
* 🧠 **Smart Wallets** (account abstraction)
* ⚡ **Gasless Transactions** using Lazorkit paymaster
* 👥 **User onboarding with referral links**
* 🎁 **Claimable badges or tasks**
* 🔗 **Simple dashboard showing referral stats**

> **Note:** This repo currently contains the **UI only**.
> Full Lazorkit referral integration will be added during the stream.

---

## 💡 Why Lazorkit for Referral Apps?

Zealy-style task systems require:

| Feature               | Needed | Provided by Lazorkit      |
| --------------------- | ------ | ------------------------- |
| User identity         | Yes    | Smart wallet address      |
| Secure authentication | Yes    | Passkey login (WebAuthn)  |
| Gasless actions       | Yes    | Paymaster support         |
| Task verification     | Yes    | Signed messages           |
| Referral tracking     | Yes    | Wallet-based referral IDs |

Lazorkit simplifies onboarding because users don’t need:

* Wallet extensions
* Seed phrases
* Token balances

They can log in with:

* FaceID
* Fingerprint
* Device PIN

And sign tasks or claims **gaslessly**.

---

---

# 📥 How to Fork This Repo

1. Click **Fork** on GitHub
2. Choose your GitHub account
3. Open the forked repo

---

# 📥 How to Clone

```sh
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>
```

---

# 🛠 Install Dependencies

Make sure you have Node.js 18+ installed.

```sh
npm install
```

or

```sh
yarn install
```

---

# ▶️ Run the App

```sh
npm run dev
```

Then open:

```
http://localhost:5173/
```

---

# 🔧 LazorKit Configuration

The project uses:

```ts
const CONFIG = {
  RPC_URL: "https://api.devnet.solana.com",
  PORTAL_URL: "https://portal.lazor.sh",
  PAYMASTER: {
    paymasterUrl: "https://kora.devnet.lazorkit.com",
  },
};
```

Wrapped by:

```tsx
<LazorkitProvider
  rpcUrl={CONFIG.RPC_URL}
  portalUrl={CONFIG.PORTAL_URL}
  paymasterConfig={CONFIG.PAYMASTER}
>
  <AppContent />
</LazorkitProvider>
```
---

# 📌 What Lazorkit Enables for Growth Apps

This setup allows you to build:

### ✔ Zealy-style quests

### ✔ Referral leaderboards

### ✔ Badge claiming

### ✔ Profile verification

### ✔ Gasless actions

### ✔ Viral onboarding funnels

Future additions can include:

* Streaks
* Levels
* XP rewards
* Task verification logic
* On-chain or off-chain validation

---

# 🖥️ Technologies Used

* React + Vite
* React Router
* Lazorkit Wallet SDK
* Tailwind / basic CSS
* Simple localStorage logic

---

# 📺 Streaming Plan (Suggested)

Here’s a structured flow you can follow during the stream:

1. **Intro to Lazorkit** — why we’re using it
2. Clone/fork the repo live
3. Walk through the UI
4. Add referral detection
5. Add Lazorkit login
6. Track referrals
7. Generate referral link
8. Add signMessage badge task
9. Test flow end-to-end
10. Q&A

---

# ⭐ Contributing

Pull requests are welcome!