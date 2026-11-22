export default function Logo({ size = 32, style = {} }) {
  return (
    <img
      src="/y-lib-logo.svg"
      alt="Y-Library Logo"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: `${Math.round(size * 0.22)}px`,
        objectFit: "contain",
        display: "inline-block",
        verticalAlign: "middle",
        ...style,
      }}
    />
  );
}
