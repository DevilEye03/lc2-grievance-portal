import Image from "next/image";

interface CampusBackgroundProps {
  variant?: "light" | "dark";
  blur?: boolean;
}

export function CampusBackground({ variant = "light", blur = true }: CampusBackgroundProps) {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none select-none">
      {/* Background Campus Photograph */}
      <Image
        src="/images/campus-bg.jpg"
        alt="Law Centre II Campus Building"
        fill
        priority
        quality={90}
        sizes="100vw"
        className="object-cover object-[center_30%] sm:object-center scale-[1.02] filter brightness-[0.98]"
      />

      {/* Atmospheric Overlays */}
      {variant === "light" ? (
        <>
          {/* Subtle contrast stabilizer */}
          <div className="absolute inset-0 bg-slate-900/10" />
          {/* Institutional bright scrim to ensure complete legibility of text and cards */}
          <div
            className={`absolute inset-0 bg-gradient-to-b from-white/72 via-white/75 to-slate-50/88 ${
              blur ? "backdrop-blur-[1.5px]" : ""
            }`}
          />
        </>
      ) : (
        <>
          {/* Midnight overlay for admin login */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-brand-950/90 to-slate-950/95 backdrop-blur-[2px]" />
        </>
      )}
    </div>
  );
}
