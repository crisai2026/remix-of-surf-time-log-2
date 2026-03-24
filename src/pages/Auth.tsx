import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Waves } from "lucide-react";

export default function Auth() {
  const { user, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Waves className="w-8 h-8 text-primary animate-pulse" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("¡Bienvenido de vuelta!");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success("Revisa tu correo para confirmar tu cuenta");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/40 flex flex-col items-center justify-center px-4">
      {/* Branding */}
      <div className="mb-8 text-center animate-fade-in">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Waves className="w-9 h-9 text-primary" />
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Marea</h1>
        </div>
        <p className="text-muted-foreground text-sm">Mide lo que importa</p>
        <p className="text-muted-foreground/70 text-xs max-w-xs text-center mx-auto mt-2 leading-relaxed animate-fade-in" style={{ animationDelay: "400ms", animationFillMode: "backwards" }}>
          Marea te ayuda a visualizar y elimina la fricción entre lo que haces y lo que quieres hacer — para que cambiar de tarea no sea una batalla, sino una ola.
        </p>
      </div>

      {/* Auth Card */}
      <Card className="w-full max-w-sm shadow-lg border-border/60 animate-fade-in" style={{ animationDelay: "150ms" }}>
        <CardContent className="pt-6">
          <h2 className="text-lg font-semibold text-center mb-1">
            {isLogin ? "Iniciar sesión" : "Crear cuenta"}
          </h2>
          <p className="text-sm text-muted-foreground text-center mb-5">
            {isLogin ? "Ingresa tus credenciales" : "Regístrate con tu email"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "..." : isLogin ? "Entrar" : "Registrarse"}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {isLogin ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia sesión"}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <p className="mt-8 text-xs text-muted-foreground animate-fade-in" style={{ animationDelay: "300ms" }}>
        Built with focus ✦
      </p>
    </div>
  );
}
