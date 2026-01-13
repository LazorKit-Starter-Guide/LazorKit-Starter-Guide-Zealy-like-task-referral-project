# Zealy-like Referral Platform with Lazorkit - Complete Tutorial Guide

## Introduction

Welcome to this comprehensive tutorial on building a Zealy-like referral and task platform using Lazorkit's smart wallet technology. This guide will walk you through creating a complete Web3 application with passwordless authentication, gasless transactions, referral tracking, and task completion features.

## What You'll Build

By the end of this tutorial, you'll have a fully functional referral platform where users can:
- Create wallet accounts without seed phrases using WebAuthn
- Share referral links to earn points
- Complete on-chain tasks with gasless transactions
- Track referral earnings in a dashboard
- Claim badges through message signing


## Prerequisites

Before starting, ensure you have:
- Node.js 18+ installed
- Basic understanding of React and TypeScript
- A modern browser with WebAuthn support (Chrome 67+, Safari 13+, Firefox 60+)
- Code editor (VS Code recommended)


## 🚀 Tutorial Steps

### Step 1: Create a New React Application

Open your terminal and create a new React application with TypeScript:

```bash
npx create-react-app zealy-platform --template typescript
cd zealy-platform
```

This creates a new React project with TypeScript configuration pre-setup.

### Step 1: Create a New React Application

  ```typescript
  npm install @lazorkit/wallet @coral-xyz/anchor @solana/web3.js buffer react-router-dom
  ```
  Sometimes during installation or when running the project, you might encounter "Module not found" errors for certain Solana-related packages. This typically happens when peer dependencies aren't automatically installed or when there are version conflicts.

Quick Fix: Install All Missing Dependencies
If you're encountering multiple module errors, you can install all of these at once:

```typescript
npm install @solana/kora @solana-program/token @solana/kit @solana/wallet-adapter-base @wallet-standard/wallet --legacy-peer-deps
```


### Step 3: Set Up Environment Configuration

Create a `.env` file in the root directory:

```env
REACT_APP_RPC_URL=https://api.devnet.solana.com
REACT_APP_PORTAL_URL=https://portal.lazor.sh
REACT_APP_PAYMASTER_URL=https://kora.devnet.lazorkit.com
```

For production deployment, you'll replace these with mainnet URLs. The devnet URLs allow you to test without spending real SOL.

### Step 4: Create the App.tsx Foundation

Open `src/App.tsx` and remove all existing code. We'll build the application from scratch.

#### 4.1 Import Required Modules

Start by importing the necessary modules:

```typescript
import { LazorkitProvider, useWallet } from "@lazorkit/wallet";
import {
  HashRouter as Router,
  Routes,
  Route,
  useParams,
  useNavigate,
} from "react-router-dom";
import { useState, useEffect } from "react";
import "./App.css";
```

**Explanation:**
- `LazorkitProvider` wraps your application to provide wallet context
- `useWallet` hook gives access to wallet methods throughout your components
- React Router handles client-side routing with hash-based navigation (works well with static hosting)
- React hooks (`useState`, `useEffect`) manage component state and side effects

#### 4.2 Configure Application Settings

Define a configuration object that centralizes your application settings:

```typescript
const CONFIG = {
  RPC_URL: process.env.REACT_APP_RPC_URL || "https://api.devnet.solana.com",
  PORTAL_URL: process.env.REACT_APP_PORTAL_URL || "https://portal.lazor.sh",
  PAYMASTER: {
    paymasterUrl: process.env.REACT_APP_PAYMASTER_URL || "https://kora.devnet.lazorkit.com",
  },
};
```

**Design Decision:** Using environment variables with fallbacks ensures your app works in both development and production without code changes.

### Step 5: Implement Referral Tracking System

Since we're building a referral platform, we need a way to track referral relationships. We'll use localStorage for simplicity in this tutorial.

#### 5.1 Define Data Structure

Create a TypeScript interface to define the shape of your referral data:

```typescript
interface ReferralData {
  referrals: Record<string, string[]>;
  referrers: Record<string, string>;
}
```

This structure tracks:
- `referrals`: Which users a wallet has referred (one-to-many relationship)
- `referrers`: Who referred each wallet (one-to-one relationship)

#### 5.2 Create Data Access Functions

Implement functions to read and write referral data:

```typescript
const getReferralData = (): ReferralData => {
  try {
    const data = localStorage.getItem("referralData");
    return data ? JSON.parse(data) : { referrals: {}, referrers: {} };
  } catch {
    return { referrals: {}, referrers: {} };
  }
};

const saveReferralData = (data: ReferralData) => {
  localStorage.setItem("referralData", JSON.stringify(data));
};
```

**Best Practice:** Always wrap localStorage operations in try-catch blocks since some browsers may restrict access in private mode.

#### 5.3 Implement Referral Logic

Create the core function that links referrers to new users:

```typescript
const trackReferral = (referrerWallet: string, newUserWallet: string) => {
  const data = getReferralData();
  
  // Record who referred this new user
  data.referrers[newUserWallet] = referrerWallet;
  
  // Add the new user to referrer's referral list
  if (!data.referrals[referrerWallet]) {
    data.referrals[referrerWallet] = [];
  }
  
  // Prevent duplicate entries
  if (!data.referrals[referrerWallet].includes(newUserWallet)) {
    data.referrals[referrerWallet].push(newUserWallet);
  }
  
  saveReferralData(data);
  console.log(`Tracked referral: ${referrerWallet} -> ${newUserWallet}`);
};
```

**Business Logic:** This function establishes the bidirectional relationship between referrer and referred user.

#### 5.4 Add Utility Functions

Create helper functions to retrieve referral statistics:

```typescript
const getReferralCount = (walletAddress: string): number => {
  const data = getReferralData();
  return data.referrals[walletAddress]?.length || 0;
};

const getReferrer = (walletAddress: string): string | null => {
  const data = getReferralData();
  return data.referrers[walletAddress] || null;
};
```

These functions will be used in the dashboard to display referral metrics.

### Step 6: Build the Connect Button Component

The Connect Button is a reusable component that handles wallet connection and disconnection.

#### 6.1 Create the Component Structure

```typescript
function ConnectButton() {
  const { connect, disconnect, isConnected, wallet } = useWallet();
  const navigate = useNavigate();
```

The `useWallet` hook provides all wallet-related methods, while `useNavigate` enables programmatic routing.

#### 6.2 Implement Connection Logic

```typescript
  const handleConnect = async () => {
    try {
      await connect({ feeMode: "paymaster" });
      navigate("/dashboard");
    } catch (error) {
      console.error("Connection failed:", error);
    }
  };
```

**Key Feature:** `feeMode: "paymaster"` enables gasless transactions, removing a major barrier for users.

#### 6.3 Implement Disconnection Logic

```typescript
  const handleDisconnect = async () => {
    await disconnect();
    navigate("/");
  };
```

#### 6.4 Render Conditional UI

```typescript
  if (isConnected && wallet) {
    return (
      <div className="connected">
        <span>Wallet: {wallet.smartWallet.slice(0, 6)}...</span>
        <button onClick={handleDisconnect} className="disconnect-btn">
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button onClick={handleConnect} className="connect-btn">
      Login with Passkey
    </button>
  );
}
```

**UX Decision:** Showing a truncated wallet address improves readability while maintaining security.

### Step 7: Create the Home Page Component

The Home Page serves as the landing page and entry point for new users.

#### 7.1 Set Up Component with Auto-Redirect

```typescript
function HomePage() {
  const { isConnected, wallet } = useWallet();
  const navigate = useNavigate();

  useEffect(() => {
    if (isConnected && wallet) {
      navigate("/dashboard");
    }
  }, [isConnected, wallet, navigate]);
```

This useEffect automatically redirects authenticated users to the dashboard, improving user experience.

#### 7.2 Build the Landing Page UI

Create an engaging landing page with features explanation:

```typescript
  return (
    <div className="home flex flex-col items-center justify-center px-4 py-10 min-h-screen bg-white text-gray-900">
      <header className="text-center max-w-2xl mb-10 flex flex-col gap-3">
        <h1 className="text-3xl lg:text-5xl font-bold">
          Zealy-like Referral Powered by Lazorkit
        </h1>
        <p className="text-base lg:text-lg text-gray-600 mt-4">
          A simple demo showing how to connect to a Solana smart wallet using
          LazorKit's WebAuthn authentication. No seed phrases — just FaceID,
          fingerprint, or device pin.
        </p>
      </header>

      <section className="max-w-3xl w-full grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="p-5 border rounded-xl bg-gray-50 shadow-sm">
          <h3 className="text-lg font-semibold mb-2">
            Passkey Authentication
          </h3>
          <p className="text-gray-700">
            Login with secure WebAuthn. No extension. No seed phrase. No stress.
          </p>
        </div>

        <div className="p-5 border rounded-xl bg-gray-50 shadow-sm">
          <h3 className="text-lg font-semibold mb-2">
            Gasless Transactions
          </h3>
          <p className="text-gray-700">
            Built-in paymaster support makes user actions free and smooth for claiming badges.
          </p>
        </div>
      </section>

      <div className="w-full max-w-sm text-center">
        <ConnectButton />
      </div>
    </div>
  );
}
```

**Design Approach:** The landing page clearly communicates value propositions and provides a clear call-to-action.

### Step 8: Implement Referral Landing Page

This specialized page handles users who arrive via referral links.

#### 8.1 Capture Referral Code from URL

```typescript
function ReferralLanding() {
  const { refCode } = useParams();
  const navigate = useNavigate();
  const { connect, isConnected, wallet } = useWallet();
```

The `useParams` hook extracts the referral code from the URL path.

#### 8.2 Store Referral Code Temporarily

```typescript
  useEffect(() => {
    if (refCode?.startsWith("ref_")) {
      sessionStorage.setItem("pendingReferrer", refCode);
      console.log("Saved referral:", refCode);
    }
  }, [refCode]);
```

**Technical Choice:** Using `sessionStorage` ensures the referral is only tracked for the current browsing session.

#### 8.3 Process Referral After Connection

```typescript
  useEffect(() => {
    if (!isConnected || !wallet) return;

    const pendingReferrer = sessionStorage.getItem("pendingReferrer");
    if (pendingReferrer) {
      const referrerWallet = pendingReferrer.replace("ref_", "");
      trackReferral(referrerWallet, wallet.smartWallet);

      sessionStorage.removeItem("pendingReferrer");
      console.log("Referral tracked:", referrerWallet, wallet.smartWallet);
    }

    navigate("/dashboard");
  }, [isConnected, wallet, navigate]);
```

**Implementation Pattern:** Deferring referral tracking until after wallet connection ensures we have the new user's wallet address.

#### 8.4 Create the Join Interface

```typescript
  const handleJoin = async () => {
    try {
      await connect({ feeMode: "paymaster" });
    } catch (err) {
      console.error("Join failed:", err);
    }
  };

  return (
    <div className="referral-landing">
      <h1> You've been invited!</h1>
      <p>Referral Code: {refCode}</p>
      <button onClick={handleJoin} className="join-btn">
        Accept & Join
      </button>
    </div>
  );
}
```

### Step 9: Build the Dashboard Component

The Dashboard is the main interface where users manage their referrals and complete tasks.

#### 9.1 Initialize Component State

```typescript
function Dashboard() {
  const { wallet, disconnect, isConnected, signMessage } = useWallet();
  const navigate = useNavigate();

  const [copied, setCopied] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [referralCount, setReferralCount] = useState(0);
  const [referredBy, setReferredBy] = useState<string | null>(null);
```

**State Management:** Multiple state variables track UI state, loading states, and referral data.

#### 9.2 Handle Authentication State

```typescript
  useEffect(() => {
    if (isConnected && !wallet) return;
    if (!isConnected) navigate("/");
  }, [isConnected, wallet, navigate]);
```

This ensures users can only access the dashboard when properly authenticated.

#### 9.3 Load Referral Statistics

```typescript
  useEffect(() => {
    if (wallet) {
      setReferralCount(getReferralCount(wallet.smartWallet));
      setReferredBy(getReferrer(wallet.smartWallet));
    }
  }, [wallet]);
```

Dynamically loads referral data when the wallet is available.

#### 9.4 Generate Referral Link

```typescript
  if (!wallet) return null;

  const referralCode = `ref_${wallet.smartWallet}`;
  const referralLink = `${window.location.origin}/#/ref/${referralCode}`;
```

**URL Structure:** The referral link follows the pattern `/#/ref/ref_walletaddress`.

#### 9.5 Implement Copy Functionality

```typescript
  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
```

Provides visual feedback when users copy their referral link.

#### 9.6 Create Task Completion Function

```typescript
  const claimBadge = async () => {
    if (claimed || loading) return;

    setLoading(true);
    try {
      const msg = `Claim welcome badge for ${wallet.smartWallet}`;
      const sig = await signMessage(msg);

      setClaimed(true);
      alert("Badge claimed!\nSignature: " + sig.signature.slice(0, 20) + "...");
    } catch (err: any) {
      console.error(err);
      alert("Failed to claim badge: " + err.message);
    }
    setLoading(false);
  };
```

**On-chain Interaction:** This demonstrates how to use message signing as proof of task completion.

#### 9.7 Calculate Points

```typescript
  const points = referralCount * 10;
```

**Business Logic:** Each referral earns 10 points. You can modify this formula based on your reward structure.

#### 9.8 Build the Dashboard UI

```typescript
  return (
    <div className="dashboard">
      <header>
        <h1> Dashboard</h1>
        <button onClick={handleDisconnect} className="disconnect-btn">
          Logout
        </button>
      </header>

      <div className="flex flex-col justify-start align-start gap-3">
        <h2>Welcome!</h2>
        <p>Wallet: {wallet.smartWallet.slice(0, 12)}...</p>
        {referredBy && <p>Referred by: {referredBy.slice(0, 8)}...</p>}
      </div>

      <div className="referral-section">
        <h3>Your Referral Link</h3>
        <input value={referralLink} readOnly className="link-input" />
        <button onClick={copyLink} className="copy-btn">
          {copied ? "Copied!" : "Copy"}
        </button>

        <div className="referral-stats">
          <p>Referrals: {referralCount}</p>
          <p>Points: {points}</p>
        </div>
      </div>

      <div className="task-section">
        <h3>Claim Welcome Badge</h3>
        <button onClick={claimBadge} disabled={claimed || loading} className="copy-btn">
          {claimed ? "Claimed" : loading ? "Signing..." : "Sign to Claim"}
        </button>
      </div>
    </div>
  );
}
```

### Step 10: Set Up Application Routing

Create the routing structure that connects all components:

```typescript
function AppContent() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/ref/:refCode" element={<ReferralLanding />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
    </Router>
  );
}
```

**Routing Strategy:** HashRouter is used because it works with static hosting and doesn't require server-side configuration for routing.

### Step 11: Wrap Application with Lazorkit Provider

The final step is to wrap your entire application with the Lazorkit provider:

```typescript
export default function App() {
  return (
    <LazorkitProvider
      rpcUrl={CONFIG.RPC_URL}
      portalUrl={CONFIG.PORTAL_URL}
      paymasterConfig={CONFIG.PAYMASTER}
    >
      <AppContent />
    </LazorkitProvider>
  );
}
```

Full Code
```typescript
import { LazorkitProvider, useWallet } from "@lazorkit/wallet";
import {
  HashRouter as Router,
  Routes,
  Route,
  useParams,
  useNavigate,
} from "react-router-dom";
import { useState, useEffect } from "react";
import "./App.css";

const CONFIG = {
  RPC_URL: "https://api.devnet.solana.com",
  PORTAL_URL: "https://portal.lazor.sh",
  PAYMASTER: {
    paymasterUrl: "https://kora.devnet.lazorkit.com",
  },
};

// Simple referral tracking using localStorage
interface ReferralData {
  referrals: Record<string, string[]>;
  referrers: Record<string, string>;
}

const getReferralData = (): ReferralData => {
  try {
    const data = localStorage.getItem("referralData");
    return data ? JSON.parse(data) : { referrals: {}, referrers: {} };
  } catch {
    return { referrals: {}, referrers: {} };
  }
};

const saveReferralData = (data: ReferralData) => {
  localStorage.setItem("referralData", JSON.stringify(data));
};

const trackReferral = (referrerWallet: string, newUserWallet: string) => {
  const data = getReferralData();

  data.referrers[newUserWallet] = referrerWallet;

  if (!data.referrals[referrerWallet]) {
    data.referrals[referrerWallet] = [];
  }

  if (!data.referrals[referrerWallet].includes(newUserWallet)) {
    data.referrals[referrerWallet].push(newUserWallet);
  }

  saveReferralData(data);
  console.log(`Tracked referral: ${referrerWallet} -> ${newUserWallet}`);
};

const getReferralCount = (walletAddress: string): number => {
  const data = getReferralData();
  return data.referrals[walletAddress]?.length || 0;
};

const getReferrer = (walletAddress: string): string | null => {
  const data = getReferralData();
  return data.referrers[walletAddress] || null;
};

// Connect Button Component
function ConnectButton() {
  const { connect, disconnect, isConnected, wallet } = useWallet();
  const navigate = useNavigate();

  const handleConnect = async () => {
    try {
      await connect({ feeMode: "paymaster" });
      navigate("/dashboard");
    } catch (error) {
      console.error("Connection failed:", error);
    }
  };

  const handleDisconnect = async () => {
    await disconnect();
    navigate("/");
  };

  if (isConnected && wallet) {
    return (
      <div className="connected">
        <span>Wallet: {wallet.smartWallet.slice(0, 6)}...</span>
        <button onClick={handleDisconnect} className="disconnect-btn">
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button onClick={handleConnect} className="connect-btn">
      🔐 Login with Passkey
    </button>
  );
}

// Home Page
function HomePage() {
  const { isConnected, wallet } = useWallet();
  const navigate = useNavigate();

  useEffect(() => {
    if (isConnected && wallet) {
      navigate("/dashboard");
    }
  }, [isConnected, wallet, navigate]);

  return (
    <div className="home flex flex-col items-center justify-center px-4 py-10 min-h-screen bg-white text-gray-900">
      {/* Title Section */}
      <header className="text-center max-w-2xl mb-10 flex flex-col gap-3">
        <h1 className="text-3xl lg:text-5xl font-bold">
         Zealy-like Referral Powered by Lazorkit
        </h1>
        <p className="text-base lg:text-lg text-gray-600 mt-4">
          A simple demo showing how to connect to a Solana smart wallet using
          LazorKit’s WebAuthn authentication. No seed phrases — just FaceID,
          fingerprint, or device pin.
        </p>
      </header>

      {/* Features Section */}
      <section className="max-w-3xl w-full grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="p-5 border rounded-xl bg-gray-50 shadow-sm">
          <h3 className="text-lg font-semibold mb-2">
            🔐 Passkey Authentication
          </h3>
          <p className="text-gray-700">
            Login with secure WebAuthn. No extension. No seed phrase. No stress.
          </p>
        </div>

        <div className="p-5 border rounded-xl bg-gray-50 shadow-sm">
          <h3 className="text-lg font-semibold mb-2">
            ⚡ Gasless Transactions
          </h3>
          <p className="text-gray-700">
            Built-in paymaster support makes user actions free and smooth for claiming badges.
          </p>
        </div>
      </section>

      {/* Login Button */}
      <div className="w-full max-w-sm text-center">
        <ConnectButton />
      </div>
    </div>
  );
}

// Referral Landing Page
function ReferralLanding() {
  const { refCode } = useParams();
  const navigate = useNavigate();
  const { connect, isConnected, wallet } = useWallet();

  // Save referral code
  useEffect(() => {
    if (refCode?.startsWith("ref_")) {
      sessionStorage.setItem("pendingReferrer", refCode);
      console.log("Saved referral:", refCode);
    }
  }, [refCode]);

  // Track referral after wallet is connected
  useEffect(() => {
    if (!isConnected || !wallet) return;

    const pendingReferrer = sessionStorage.getItem("pendingReferrer");

    if (pendingReferrer) {
      const referrerWallet = pendingReferrer.replace("ref_", "");
      trackReferral(referrerWallet, wallet.smartWallet);

      sessionStorage.removeItem("pendingReferrer");
      console.log("Referral tracked:", referrerWallet, wallet.smartWallet);
    }

    navigate("/dashboard");
  }, [isConnected, wallet, navigate]);

  const handleJoin = async () => {
    try {
      await connect({ feeMode: "paymaster" });
    } catch (err) {
      console.error("Join failed:", err);
    }
  };

  return (
    <div className="referral-landing">
      <h1>🎁 You've been invited!</h1>
      <p>Referral Code: {refCode}</p>

      <button onClick={handleJoin} className="join-btn">
        Accept & Join
      </button>
    </div>
  );
}

// Dashboard Page
function Dashboard() {
  const { wallet, disconnect, isConnected, signMessage } = useWallet();
  const navigate = useNavigate();

  const [copied, setCopied] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [referralCount, setReferralCount] = useState(0);
  const [referredBy, setReferredBy] = useState<string | null>(null);

  // Wait for wallet hydration
  useEffect(() => {
    if (isConnected && !wallet) return;
    if (!isConnected) navigate("/");
  }, [isConnected, wallet, navigate]);

  // Load referral stats
  useEffect(() => {
    if (wallet) {
      setReferralCount(getReferralCount(wallet.smartWallet));
      setReferredBy(getReferrer(wallet.smartWallet));
    }
  }, [wallet]);

  if (!wallet) return null;

  // Referral code must include FULL wallet
  const referralCode = `ref_${wallet.smartWallet}`;
  const referralLink = `${window.location.origin}/#/ref/${referralCode}`;

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDisconnect = async () => {
    await disconnect();
    navigate("/");
  };

  const claimBadge = async () => {
    if (claimed || loading) return;

    setLoading(true);
    try {
      const msg = `Claim welcome badge for ${wallet.smartWallet}`;
      const sig = await signMessage(msg);

      setClaimed(true);
      alert("Badge claimed!\nSignature: " + sig.signature.slice(0, 20) + "...");
    } catch (err: any) {
      console.error(err);
      alert("Failed to claim badge: " + err.message);
    }
    setLoading(false);
  };

  const points = referralCount * 10;

  return (
    <div className="dashboard">
      <header>
        <h1>📊 Dashboard</h1>
        <button onClick={handleDisconnect} className="disconnect-btn">
          Logout
        </button>
      </header>

      <div className="flex flex-col justify-start align-start gap-3">
        <h2>Welcome!</h2>
        <p>Wallet: {wallet.smartWallet.slice(0, 12)}...</p>
        {referredBy && <p>Referred by: {referredBy.slice(0, 8)}...</p>}
      </div>

      <div className="referral-section">
        <h3>Your Referral Link</h3>
        <input value={referralLink} readOnly className="link-input" />
        <button onClick={copyLink} className="copy-btn">
          {copied ? "Copied!" : "Copy"}
        </button>

        <div className="referral-stats">
          <p>Referrals: {referralCount}</p>
          <p>Points: {points}</p>
        </div>
      </div>

      <div className="task-section">
        <h3>Claim Welcome Badge</h3>
        <button onClick={claimBadge} disabled={claimed || loading} className="copy-btn">
          {claimed ? "Claimed" : loading ? "Signing..." : "Sign to Claim"}
        </button>
      </div>
    </div>
  );
}

// Main App
function AppContent() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/ref/:refCode" element={<ReferralLanding />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
    </Router>
  );
}

export default function App() {
  return (
    <LazorkitProvider
      rpcUrl={CONFIG.RPC_URL}
      portalUrl={CONFIG.PORTAL_URL}
      paymasterConfig={CONFIG.PAYMASTER}
    >
      <AppContent />
    </LazorkitProvider>
  );
}

```


**Critical Component:** The `LazorkitProvider` makes wallet functionality available throughout your component tree via React Context.

### Step 12: Add Basic Styling

Create or update `src/App.css` with basic styles:

```css
/* ---------- Base Layout ---------- */

body {
  margin: 0;
  padding: 0;
  font-family: "Manrope", sans-serif;
  font-optical-sizing: auto;
  background: #f7f7f8;
  color: #222;
}

h1, h2, h3, p {
  margin: 0;
}

button {
  cursor: pointer;
  border: none;
  outline: none;
}

/* ---------- Container ---------- */

.home,
.referral-landing,
.dashboard {
  max-width: 600px;
  margin: 0 auto;
  padding: 24px;
}

/* ---------- Header ---------- */

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

header h1 {
  font-size: 22px;
  font-weight: 600;
}

/* ---------- Buttons ---------- */

.connect-btn,
.join-btn,
.disconnect-btn,
.copy-btn,
.task-btn {
  background: #222;
  color: white;
  padding: 12px 18px;
  border-radius: 8px;
  font-size: 15px;
  transition: opacity 0.2s ease;
}

.connect-btn:hover,
.join-btn:hover,
.disconnect-btn:hover,
.copy-btn:hover,
.task-btn:hover {
  opacity: 0.85;
}

.disconnect-btn {
  background: #444;
}

/* ---------- Referral Section ---------- */

.referral-section {
  margin-top: 32px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e5e5;
}

.link-input {
  width: 100%;
  padding: 10px 12px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 14px;
  margin-bottom: 8px;
}

/* ---------- Stats ---------- */

.referral-stats {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.referral-stats div {
  text-align: center;
}

.stat-number {
  font-size: 20px;
  font-weight: 700;
}

.stat-label {
  font-size: 13px;
  color: #555;
}

/* ---------- User Card ---------- */

.user-card {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e1e1e1;
}

.user-card .avatar {
  width: 48px;
  height: 48px;
  background: #222;
  color: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.wallet-address {
  font-size: 14px;
  color: #666;
}

.referred-by {
  margin-top: 4px;
  font-size: 13px;
  color: #444;
}

/* ---------- Task Section ---------- */

.task-section {
  margin-top: 32px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e5e5;
}

.task-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-weight: 600;
}

.task-status {
  font-size: 14px;
}

.task-btn {
  width: 100%;
  margin-top: 8px;
}

.task-note {
  margin-top: 6px;
  font-size: 12px;
  color: #666;
  text-align: center;
}

```

## 🚀 Running Your Application

### Development Mode

Start the development server:

```bash
npm run dev
```

## Congratulations!

You've successfully built a complete Zealy-like referral platform with:

✅ Passwordless authentication using WebAuthn  
✅ Gasless transactions with paymaster integration  
✅ Referral tracking system  
✅ Task completion with on-chain signatures

This platform provides an excellent foundation for building Web3 applications that prioritize user experience while maintaining security and decentralization. And would want to build tools, and platforms around referrals/task similar to Zealy.