import type { SVGProps } from "react";
const paths = {
  search: "m21 21-5-5m2-6a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z",
  menu: "M4 6h16M4 12h16M4 18h16",
  close: "m6 6 12 12M6 18 18 6",
  user: "M20 21v-2a6 6 0 0 0-6-6h-4a6 6 0 0 0-6 6v2m12-16a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z",
  shield: "m12 3 8 3v5c0 5-8 10-8 10S4 16 4 11V6l8-3Zm-4 9 3 3 5-6",
  arrow: "M4 12h16m-6-6 6 6-6 6",
  pin: "M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Zm-5 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
  calendar:
    "M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2Zm2 10h3m4 0h3m-10 4h3",
  camera: "m3 7 4-1 2-3h6l2 3 4 1v13H3V7Zm14 6a5 5 0 1 1-10 0 5 5 0 0 1 10 0Z",
  tent: "m2 21 10-18 10 18H2Zm6 0 4-8 4 8m-4-18v10",
  tools:
    "m14 6 4 4m-9 5-5 5 3 3 5-5m4-16a6 6 0 0 0-7 8L3 16l5 5 6-7a6 6 0 0 0 8-7l-4 4-4-4 4-4Z",
  check: "m5 12 4 4L19 6",
  logout: "M9 4H4v16h5m5-13 5 5-5 5m-6-5h11",
  box: "m3 6 9-4 9 4v12l-9 4-9-4V6Zm0 0 9 4 9-4M12 10v12M7 4l10 4",
  info: "M12 11v6m0-10v.01m10 5a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z",
} as const;
export type IconName = keyof typeof paths;
export function Icon({
  name,
  size = 22,
  ...props
}: SVGProps<SVGSVGElement> & { name: IconName; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d={paths[name]} />
    </svg>
  );
}
