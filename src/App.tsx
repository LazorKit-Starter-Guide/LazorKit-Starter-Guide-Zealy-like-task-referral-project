import { LazorkitProvider, useWallet } from "@lazorkit/wallet";
import {
  HashRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import { useEffect } from "react";
import "./App.css";

const CONFIG = {
  RPC_URL: "https://api.devnet.solana.com",
  PORTAL_URL: "https://portal.lazor.sh",
  PAYMASTER: {
    paymasterUrl: "https://kora.devnet.lazorkit.com",
  },
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

  return (
    <div className="referral-landing">
      <h1>🎁 You've been invited!</h1>
      <p>Referral Code: {/* refcode */}</p>

      <button className="join-btn">
        Accept & Join
      </button>
    </div>
  );
}

// Dashboard Page
function Dashboard() {
  const { wallet, disconnect, isConnected } = useWallet();
  const navigate = useNavigate();

  // Wait for wallet hydration
  useEffect(() => {
    if (isConnected && !wallet) return;
    if (!isConnected) navigate("/");
  }, [isConnected, wallet, navigate]);


  if (!wallet) return null;

  const handleDisconnect = async () => {
    await disconnect();
    navigate("/");
  };

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
      </div>

      <div className="referral-section">
        <h3>Your Referral Link</h3>
        <input readOnly className="link-input" />
        <button className="copy-btn">
          copy
        </button>

        <div className="referral-stats">
          <p>Referrals: </p>
          <p>Points: {}</p>
        </div>
      </div>

      <div className="task-section">
        <h3>Claim Welcome Badge</h3>
        <button className="copy-btn">
          claim
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
