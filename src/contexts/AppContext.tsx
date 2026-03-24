import { createContext, useContext, useState, type ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";

type AppMode = "landing" | "demo" | "app";

interface AppContextType {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  user: ReturnType<typeof useAuth>["user"];
  loading: boolean;
  signUp: ReturnType<typeof useAuth>["signUp"];
  signIn: ReturnType<typeof useAuth>["signIn"];
  signOut: ReturnType<typeof useAuth>["signOut"];
  showAuthModal: boolean;
  setShowAuthModal: (v: boolean) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const { user, loading, signUp, signIn, signOut } = useAuth();
  const [mode, setModeState] = useState<AppMode>("landing");
  const [showAuthModal, setShowAuthModal] = useState(false);

  // If user is authenticated, always show app
  const effectiveMode = user ? "app" : mode;

  const setMode = (m: AppMode) => {
    if (user) return; // can't go back if authenticated
    setModeState(m);
  };

  return (
    <AppContext.Provider value={{
      mode: effectiveMode,
      setMode,
      user,
      loading,
      signUp,
      signIn,
      signOut,
      showAuthModal,
      setShowAuthModal,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
}
