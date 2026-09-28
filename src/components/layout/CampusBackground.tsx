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
          {/* Institutional light wash to brighten shadows and keep contrast crisp */}
          <div
            className="absolute inset-0 backdrop-blur-[1.5px]"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.72) 40%, rgba(248,250,252,0.90) 100%)",
            }}
          />
        </>
      ) : (
        <div
          className="absolute inset-0 backdrop-blur-sm"
          style={{
            background:
              "linear-gradient(180deg, rgba(15,23,42,0.88) 0%, rgba(30,27,75,0.92) 50%, rgba(15,23,42,0.95) 100%)",
          }}
        />
      )}
    </div>
  );
}
