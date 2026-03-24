import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeEffects } from "@/components/effects/ThemeEffects";
import { AppProvider, useAppContext } from "@/contexts/AppContext";
import { AuthModal } from "@/components/AuthModal";
import { DemoBanner } from "@/components/DemoBanner";
import Landing from "./pages/Landing";
import Index from "./pages/Index";
import DemoApp from "./pages/DemoApp";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppContent() {
  const { mode, loading } = useAppContext();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <ThemeEffects />
      <AuthModal />
      {mode === "landing" ? (
        <Landing />
      ) : mode === "demo" ? (
        <>
          <DemoBanner />
          <DemoApp />
        </>
      ) : (
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      )}
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppProvider>
        <AppContent />
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
