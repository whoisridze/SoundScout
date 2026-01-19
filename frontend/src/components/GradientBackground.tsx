interface GradientBackgroundProps {
  variant?: "default" | "contact" | "auth";
  fixed?: boolean;
}

export default function GradientBackground({
  variant = "default",
  fixed = false,
}: GradientBackgroundProps) {
  const positionClass = fixed ? "fixed" : "absolute";

  if (variant === "contact") {
    return (
      <div className={`${positionClass} inset-0 bg-bg-base pointer-events-none`}>
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary-600/10 rounded-full blur-[150px] translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent-600/10 rounded-full blur-[150px] -translate-x-1/3 translate-y-1/3" />
      </div>
    );
  }

  if (variant === "auth") {
    return (
      <div className={`${positionClass} inset-0 bg-bg-base pointer-events-none`}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-600/15 rounded-full blur-[150px]" />
        <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-accent-600/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-primary-600/10 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2" />
      </div>
    );
  }

  return (
    <div className={`${positionClass} inset-0 bg-bg-base`}>
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary-600/20 rounded-full blur-[128px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent-600/20 rounded-full blur-[128px]" />
    </div>
  );
}
