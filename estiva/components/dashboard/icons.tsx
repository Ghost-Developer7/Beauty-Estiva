import type { SVGProps } from "react";

export const baseIconProps = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  className: "h-5 w-5",
} satisfies SVGProps<SVGSVGElement>;

export const IconHome = () => (
  <svg {...baseIconProps}>
    <path d="M3 11L12 3l9 8" />
    <path d="M5 10v10h5v-5h4v5h5V10" />
  </svg>
);

export const IconCalendar = () => (
  <svg {...baseIconProps}>
    <rect x="3" y="4" width="18" height="18" rx="3" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);

export const IconUsers = () => (
  <svg {...baseIconProps}>
    <circle cx="9" cy="8" r="3" />
    <path d="M2 20c0-3 3-5 7-5" />
    <circle cx="17" cy="9" r="2.5" />
    <path d="M14 20c0-2.2 1.8-4 4-4 1 0 2 .3 3 .9" />
  </svg>
);

export const IconReports = () => (
  <svg {...baseIconProps}>
    <path d="M4 4h16v16H4z" />
    <path d="M8 14l3-4 3 2 2-4" />
  </svg>
);

export const IconSettings = () => (
  <svg {...baseIconProps}>
    <circle cx="12" cy="12" r="2.5" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 0 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.3V21a2 2 0 0 1-4 0v-.2a1.7 1.7 0 0 0-1-1.3 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 0 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.3-1H3a2 2 0 0 1 0-4h.2a1.7 1.7 0 0 0 1.3-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 0 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9A1.7 1.7 0 0 0 10 3V3a2 2 0 0 1 4 0v.2a1.7 1.7 0 0 0 1 1.3 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 0 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8 1.7 1.7 0 0 0 1.3 1H21a2 2 0 0 1 0 4h-.2a1.7 1.7 0 0 0-1.3 1z" />
  </svg>
);

export const IconList = () => (
  <svg {...baseIconProps}>
    <path d="M7 6h14M7 12h14M7 18h14" />
    <circle cx="3" cy="6" r="1" />
    <circle cx="3" cy="12" r="1" />
    <circle cx="3" cy="18" r="1" />
  </svg>
);

export const IconClock = () => (
  <svg {...baseIconProps}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </svg>
);

export const IconTag = () => (
  <svg {...baseIconProps}>
    <path d="M12 2l9 4.9V17L12 22l-9-4.9V7z" />
  </svg>
);

export const IconGrid = () => (
  <svg {...baseIconProps}>
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
);

export const IconPOS = () => (
  <svg {...baseIconProps}>
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <path d="M4 10h16" />
    <path d="M12 15v3" />
  </svg>
);

export const IconMessage = () => (
  <svg {...baseIconProps}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

export const IconMenu = () => (
  <svg {...baseIconProps}>
    <circle cx="12" cy="12" r="1" />
    <circle cx="12" cy="5" r="1" />
    <circle cx="12" cy="19" r="1" />
  </svg>
);

export const IconWallet = () => (
  <svg {...baseIconProps}>
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M2 10h20" />
    <path d="M7 15h.01" />
    <path d="M7 15h0" />
  </svg>
);

export const IconBanknote = () => (
  <svg {...baseIconProps}>
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <line x1="2" y1="10" x2="22" y2="10" />
    <line x1="12" y1="5" x2="12" y2="19" />
  </svg>
);

export const IconWhatsapp = () => (
  <svg {...baseIconProps}>
    <path d="M3 21l1.65-3.8C3.37 15.63 3.09 13.92 3.84 12.35 4.86 10.22 7.03 8.8 9.38 8.8h.02c2.81 0 5.4 1.34 7.07 3.66 1.67 2.32 1.94 5.34.74 7.89-.99 2.11-3.08 3.59-5.43 3.65h-.04l-3.81.01-4.93 1.99z" />
    <path d="M16.14 13.68c-.14-.24-.52-.39-1.09-.67-.57-.28-3.37-1.66-3.89-1.85-.52-.19-.9-.28-1.29.28-.38.56-1.48 1.85-1.81 2.22-.33.37-.67.42-1.24.14-.57-.28-2.4-0.88-4.57-2.82-1.7-1.51-2.85-3.38-3.18-3.95-.33-.57-.04-.88.25-1.16.25-.26.57-.67.86-1.01.28-.33.38-.56.57-.93.19-.37.09-.7-.05-.97-.14-.28-1.29-3.1-1.76-4.24-.46-1.11-.93-.96-1.29-.98-.33-.02-.71-.02-1.09-.02-.38 0-1 .14-1.52.71-.52.57-2 1.95-2 4.76s2.05 5.51 2.33 5.9c.28.38 4.04 6.17 9.79 8.65 1.37.59 2.43.94 3.26 1.2.98.31 1.87.27 2.57.16.79-.12 2.43-.99 2.77-1.95.34-.96.34-1.78.24-1.95z" fill="currentColor" />
  </svg>
);

export const IconInstagram = () => (
  <svg {...baseIconProps}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

// Other / Settings Icons
export const IconEnvelope = () => (
  <svg {...baseIconProps}>
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

export const IconPercent = () => (
  <svg {...baseIconProps}>
    <line x1="19" y1="5" x2="5" y2="19" />
    <circle cx="6.5" cy="6.5" r="2.5" />
    <circle cx="17.5" cy="17.5" r="2.5" />
  </svg>
);

export const IconMessageSquare = () => (
  <svg {...baseIconProps}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

export const IconPhone = () => (
  <svg {...baseIconProps}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

export const IconUpload = () => (
  <svg {...baseIconProps}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

export const IconDownload = () => (
  <svg {...baseIconProps}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

export const IconArrowDownLeft = () => (
  <svg {...baseIconProps}>
    <line x1="17" y1="7" x2="7" y2="17" />
    <polyline points="17 17 7 17 7 7" />
  </svg>
);

export const IconArrowUpRight = () => (
  <svg {...baseIconProps}>
    <line x1="7" y1="17" x2="17" y2="7" />
    <polyline points="7 7 17 7 17 17" />
  </svg>
);// ... existing icons

export const IconEstiva = () => (
  <svg {...baseIconProps} viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h-4v10h4c2.21 0 4-1.79 4-4s-1.79-4-4-4zm0 6h-2v-4h2c1.1 0 2 .9 2 2s-.9 2-2 2z" opacity="0.5" />
    <path d="M15.5 12c0-2.5-1.5-4.5-4-4.5h-3v9h3c2.5 0 4-2 4-4.5z" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <path d="M8.5 7.5h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M8.5 16.5h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);
// Simplified elegant abstract logo instead of complex letter logic
export const IconEstivaLogo = () => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
    <path d="M20 40C31.0457 40 40 31.0457 40 20C40 8.9543 20 0 20 0C20 0 0 8.9543 0 20C0 31.0457 8.9543 40 20 40Z" fill="url(#paint0_radial)" fillOpacity="0.2" />
    <path d="M20 32C26.6274 32 32 26.6274 32 20C32 13.3726 26.6274 8 20 8C13.3726 8 8 13.3726 8 20C8 26.6274 13.3726 32 20 32Z" stroke="white" strokeOpacity="0.8" strokeWidth="2" />
    <path d="M20 12V28M12 20H28" stroke="white" strokeOpacity="0.4" strokeWidth="1" />
    <circle cx="20" cy="20" r="3" fill="white" />
    <defs>
      <radialGradient id="paint0_radial" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(20 20) rotate(90) scale(20)">
        <stop stopColor="white" />
        <stop offset="1" stopColor="white" stopOpacity="0" />
      </radialGradient>
    </defs>
  </svg>
);
export const IconChevronDown = () => (
  <svg {...baseIconProps}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
