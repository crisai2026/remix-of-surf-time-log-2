import { useEffect, useRef } from "react";
import { useVisualTheme } from "@/hooks/useVisualTheme";

function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const fontSize = 14;
    let columns = Math.floor(canvas.width / fontSize);
    let drops: number[] = Array(columns).fill(0).map(() => Math.random() * -100);
    const chars = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789MAREA";

    let animId: number;

    const draw = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#00FF41";
      ctx.font = `${fontSize}px 'Share Tech Mono', monospace`;

      const currentColumns = Math.floor(canvas.width / fontSize);
      if (currentColumns !== columns) {
        columns = currentColumns;
        drops = Array(columns).fill(0).map(() => Math.random() * -100);
      }

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(char, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i] += 0.5 + Math.random() * 0.5;
      }
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ opacity: 0.08, zIndex: 0 }}
    />
  );
}


function VaporwaveBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(185,103,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(185,103,255,0.05) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div
        className="absolute top-1/4 left-1/2 w-[500px] h-[500px] rounded-full"
        style={{
          transform: "translateX(-50%)",
          background: "radial-gradient(circle, rgba(255,113,206,0.12) 0%, transparent 70%)",
          animation: "vaporwave-drift 20s ease-in-out infinite alternate",
        }}
      />
    </div>
  );
}

export function ThemeEffects() {
  const { visualTheme } = useVisualTheme();

  return (
    <>
      {visualTheme === "matrix" && <MatrixRain />}
      {visualTheme === "vaporwave" && <VaporwaveBackground />}
    </>
  );
}
