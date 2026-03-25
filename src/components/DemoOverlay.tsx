import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

export function DemoOverlay({ children }: { children: React.ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="relative">
          <div className="pointer-events-none opacity-60">{children}</div>
          <div className="absolute inset-0 cursor-not-allowed" />
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>Sign up to start tracking</p>
      </TooltipContent>
    </Tooltip>
  );
}
