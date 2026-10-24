import React, { useState } from 'react';

interface BrandSentinelLogoProps {
  className?: string;
  shieldOnly?: boolean;
}

export const BrandSentinelLogo: React.FC<BrandSentinelLogoProps> = ({
  className = "h-8 w-auto",
  shieldOnly = false
}) => {
  const [imageError, setImageError] = useState(false);

  // Exact Google Aida image asset from the prototype
  const logoUrl = "https://lh3.googleusercontent.com/aida/AEtjO1VZA5BjkW18s9r-3f-5grN3CuBjmVDIwSr66dMmKM1laF4Lw4XGt0oKSzj3mTRRw2_XWs2Ocawc3n65a046BTzr8CTQt3EKa8xLKXQDq8hfng6QbsQUZfb5UemZ2Q6TseTiUMU3y1Ct2JC84LI_1h3_YQAoAv3jorQvgJcNKCspJje-z_NF2DDs9pa7C-J8_i83-YNXxFtsnh0mGSR4FNi9XkZv6cA6ItmNLr7T0OdmSw";

  return (
    <div className="flex items-center gap-space-xs">
      {!imageError ? (
        <img
          src={logoUrl}
          alt="BrandSentinel Shield Logo"
          className={`${className} object-contain`}
          onError={() => setImageError(true)}
        />
      ) : (
        /* High-fidelity vector shield SVG fallback */
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary via-primary-container to-secondary-container flex items-center justify-center shadow-sm">
          <svg
            className="w-5 h-5 text-on-primary"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="M9 12l2 2 4-4" />
          </svg>
        </div>
      )}

      {!shieldOnly && (
        <div className="flex items-center gap-1.5 ml-1">
          <span className="font-headline-sm text-headline-sm text-on-surface tracking-tight font-bold">
            BrandSentinel
          </span>
          <span className="px-1.5 py-0.5 rounded bg-primary-container font-label-code text-label-code text-on-primary-container font-semibold">
            AI
          </span>
        </div>
      )}
    </div>
  );
};
