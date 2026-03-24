interface MareaLogoProps {
  width?: number;
  height?: number;
}

export function MareaLogo({ width = 72, height = 44 }: MareaLogoProps) {
  return (
    <svg viewBox="0 0 80 48" style={{ width, height }}>
      {/* Top wave — thinnest, lowest opacity */}
      <path
        d="M8 12 Q20 6, 32 12 Q44 18, 56 12 Q68 6, 72 12"
        fill="none"
        stroke="#D97757"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.25"
      />
      {/* Middle wave */}
      <path
        d="M8 24 Q20 16, 32 24 Q44 32, 56 24 Q68 16, 72 24"
        fill="none"
        stroke="#D97757"
        strokeWidth="3.5"
        strokeLinecap="round"
        opacity="0.55"
      />
      {/* Bottom wave — thickest, full opacity */}
      <path
        d="M8 36 Q20 28, 32 36 Q44 44, 56 36 Q68 28, 72 36"
        fill="none"
        stroke="#D97757"
        strokeWidth="5"
        strokeLinecap="round"
        opacity="1"
      />
    </svg>
  );
}
