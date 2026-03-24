import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAppContext } from "@/contexts/AppContext";
import { MareaLogo } from "@/components/MareaLogo";
import { toast } from "sonner";

export function AuthModal() {
  const { showAuthModal, setShowAuthModal, signIn, signUp } = useAppContext();
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);

    if (tab === "login") {
      const { error } = await signIn(email, password);
      if (error) {
        toast.error(error.message);
      } else {
        setShowAuthModal(false);
        toast.success("Welcome back!");
      }
    } else {
      const { error } = await signUp(email, password);
      if (error) {
        toast.error(error.message);
      } else {
        setShowAuthModal(false);
        toast.success("Account created!");
      }
    }
    setLoading(false);
  };

  return (
    <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
      <DialogContent className="sm:max-w-md" style={{ backgroundColor: "#FAF9F6", border: "1px solid #E8E4DF" }}>
        <DialogHeader>
          <DialogTitle className="text-center">
            <div className="mx-auto mb-2 flex justify-center">
              <MareaLogo width={48} height={26} />
            </div>
            <span className="text-lg font-bold" style={{ color: "#1A1A1A" }}>Marea</span>
          </DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex rounded-lg p-0.5" style={{ backgroundColor: "#F0EDE8" }}>
          <button
            onClick={() => setTab("login")}
            className={`flex-1 text-sm font-medium py-2 rounded-md transition-all ${
              tab === "login" ? "bg-white shadow-sm" : ""
            }`}
            style={{ color: tab === "login" ? "#1A1A1A" : "#888" }}
          >
            Log in
          </button>
          <button
            onClick={() => setTab("signup")}
            className={`flex-1 text-sm font-medium py-2 rounded-md transition-all ${
              tab === "signup" ? "bg-white shadow-sm" : ""
            }`}
            style={{ color: tab === "signup" ? "#1A1A1A" : "#888" }}
          >
            Sign up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-medium" style={{ color: "#555" }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full mt-1 px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2"
              style={{ borderColor: "#E0DCD6", backgroundColor: "#fff", color: "#1A1A1A" }}
              placeholder="you@email.com"
            />
          </div>
          <div>
            <label className="text-xs font-medium" style={{ color: "#555" }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full mt-1 px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2"
              style={{ borderColor: "#E0DCD6", backgroundColor: "#fff", color: "#1A1A1A" }}
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-50"
            style={{ backgroundColor: "#D97757" }}
          >
            {loading ? "..." : tab === "login" ? "Log in" : "Create account"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
