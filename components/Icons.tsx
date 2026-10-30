export function Arrow({
  direction = "right",
}: {
  direction?: "right" | "left" | "up" | "down";
}) {
  return (
    <svg
      className="action-arrow"
      data-direction={direction}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <g
        transform={
          direction === "left"
            ? "rotate(180 12 12)"
            : direction === "up"
              ? "rotate(-90 12 12)"
              : direction === "down"
                ? "rotate(90 12 12)"
                : undefined
        }
      >
        <path
          d="M4 12h16m-6-6 6 6-6 6"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </g>
    </svg>
  );
}
export function Monogram() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 34 14 6 24 34M8.3 22h11.4M24 6v28M36 6v28M24 22h12"
        stroke="currentColor"
        strokeWidth="1.75"
      />
    </svg>
  );
}
