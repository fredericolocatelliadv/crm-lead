import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

export function InstagramIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <rect width="18" height="18" x="3" y="3" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function LinkedinIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M6.94 8.98H3.68V20h3.26V8.98ZM5.31 7.48a1.9 1.9 0 1 0 0-3.8 1.9 1.9 0 0 0 0 3.8ZM20.32 13.95c0-3.03-1.62-5.02-4.27-5.02-1.66 0-2.63.91-3.08 1.55v-1.5H9.84V20h3.26v-5.43c0-1.43.27-2.82 2.04-2.82 1.75 0 1.78 1.64 1.78 2.91V20h3.4v-6.05Z" />
    </svg>
  );
}

export function FacebookIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M14.2 8.1V6.7c0-.68.45-.84.77-.84h1.96V2.85L14.23 2.84c-3 0-3.68 2.24-3.68 3.68V8.1H8.8v3.1h1.75V20h3.65v-8.8h2.46l.33-3.1H14.2Z" />
    </svg>
  );
}

export function YoutubeIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M21.58 7.19a2.75 2.75 0 0 0-1.94-1.94C17.93 4.8 12 4.8 12 4.8s-5.93 0-7.64.45a2.75 2.75 0 0 0-1.94 1.94A28.53 28.53 0 0 0 2 12a28.53 28.53 0 0 0 .42 4.81 2.75 2.75 0 0 0 1.94 1.94c1.71.45 7.64.45 7.64.45s5.93 0 7.64-.45a2.75 2.75 0 0 0 1.94-1.94A28.53 28.53 0 0 0 22 12a28.53 28.53 0 0 0-.42-4.81ZM10 15.2V8.8l5.5 3.2L10 15.2Z" />
    </svg>
  );
}
