import type { SVGProps } from 'react';

export function BmvLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M4 4v16h16V4H4z" fill="hsl(var(--primary) / 0.2)" />
      <path d="M4 4l16 16" />
      <path d="M9 20H4V4h5" />
      <path d="M15 4h5v16h-5" />
      <path d="M12 12l-3 3" />
      <path d="M12 12l3-3" />
    </svg>
  );
}
