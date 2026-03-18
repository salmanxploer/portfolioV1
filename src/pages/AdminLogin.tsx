import { useState } from "react";
import { Navigate } from "react-router-dom";
import { LockKeyhole, LogIn } from "lucide-react";
import { ADMIN_DASHBOARD_PATH } from "@/lib/adminRoute";
import { auth, isAllowedAdminUser, signInAdmin, signOutAdmin } from "@/lib/firebase";
import { ensureBlogsStoredInFirestore } from "@/lib/blogStorage";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (auth.currentUser) {
    return <Navigate to={ADMIN_DASHBOARD_PATH} replace />;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signInAdmin(email, password);
      if (!isAllowedAdminUser(auth.currentUser)) {
        await signOutAdmin();
        setError("This email is not allowed for admin access.");
        return;
      }
      await ensureBlogsStoredInFirestore();
    } catch {
      setError("Invalid admin credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4 section-shell">
      <div className="w-full max-w-md p-6 rounded-2xl border border-border bg-card/80 backdrop-blur-sm">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 border border-primary/30 mb-3">
            <LockKeyhole className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-1">Admin Access</h1>
          <p className="text-sm text-muted-foreground">Secure login to manage blog and analytics</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Admin email"
            className="w-full px-4 py-2 rounded-lg bg-background/70 border border-border focus:outline-none focus:border-primary"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-2 rounded-lg bg-background/70 border border-border focus:outline-none focus:border-primary"
            required
          />

          {error ? <p className="text-sm text-red-400">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium inline-flex items-center justify-center gap-2 disabled:opacity-70"
          >
            <LogIn className="w-4 h-4" />
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
};

export default AdminLogin;
