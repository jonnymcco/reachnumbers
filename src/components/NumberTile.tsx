type TileOrigin = "large" | "small" | "derived";

export function NumberTile({
  value,
  origin = "derived",
  selected = false,
  disabled = false,
  onClick,
}: {
  value: number;
  origin?: TileOrigin;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}) {
  const base =
    "relative flex items-center justify-center rounded-2xl font-bold tabular-nums select-none transition-all duration-150 h-16 w-16 sm:h-20 sm:w-20 text-xl sm:text-2xl";

  const palette =
    origin === "large"
      ? "bg-tile-large text-white"
      : origin === "small"
        ? "bg-tile-small text-white"
        : "bg-accent text-accent-foreground";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || !onClick}
      className={`${base} ${palette} ${
        selected ? "ring-4 ring-accent ring-offset-2 ring-offset-background scale-105" : ""
      } ${onClick && !disabled ? "cursor-pointer hover:scale-105" : "cursor-default"} ${
        disabled && onClick ? "opacity-40" : ""
      }`}
    >
      {value}
    </button>
  );
}
