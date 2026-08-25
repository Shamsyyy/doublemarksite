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
  const baseUrl = import.meta.env.BASE_URL;
  const logoUrl = `${baseUrl}brand/doublemark-logo.png`;
  const iconUrl = size <= 36
    ? `${baseUrl}brand/doublemark-favicon.png`
    : logoUrl;

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
        src={iconUrl}
        alt="DoubleMark"
        width={size}
        height={size}
        decoding="async"
        style={{
          width: size,
          height: size,
          objectFit: "contain",
          flexShrink: 0,
        }}
      />
      {withText && <span>DoubleMark</span>}
    </span>
  );
}
