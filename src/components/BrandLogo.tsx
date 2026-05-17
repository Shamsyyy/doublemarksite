type BrandLogoProps = {
  size?: number;
  withText?: boolean;
  className?: string;
};

export function BrandLogo({
  size = 32,
  withText = true,
  className,
}: BrandLogoProps) {
  const logoUrl = `${import.meta.env.BASE_URL}brand/doublemark-logo.png`;

  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: withText ? "0.625rem" : 0,
        lineHeight: 1,
      }}
    >
      <img
        src={logoUrl}
        alt="DoubleMark"
        width={size}
        height={size}
        style={{
          width: size,
          height: size,
          objectFit: "contain",
          flexShrink: 0,
          filter: "drop-shadow(0 0 10px rgba(59, 130, 246, 0.22))",
        }}
      />
      {withText && <span>DoubleMark</span>}
    </span>
  );
}
