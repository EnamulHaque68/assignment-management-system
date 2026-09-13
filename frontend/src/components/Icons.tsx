import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  color?: string;
  strokeWidth?: number;
}

const baseProps = (size: number | string = 20, color = 'currentColor', strokeWidth = 2): React.SVGProps<SVGSVGElement> => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: color,
  strokeWidth,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
});

export const Layers: React.FC<IconProps> = ({ size, color, strokeWidth, ...props }) => (
  <svg {...baseProps(size, color, strokeWidth)} {...props}>
    <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
    <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
    <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
  </svg>
);

export const ShieldCheck: React.FC<IconProps> = ({ size, color, strokeWidth, ...props }) => (
  <svg {...baseProps(size, color, strokeWidth)} {...props}>
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export const ShieldAlert: React.FC<IconProps> = ({ size, color, strokeWidth, ...props }) => (
  <svg {...baseProps(size, color, strokeWidth)} {...props}>
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    <path d="M12 8v4" />
    <path d="M12 16h.01" />
  </svg>
);

export const BookOpen: React.FC<IconProps> = ({ size, color, strokeWidth, ...props }) => (
  <svg {...baseProps(size, color, strokeWidth)} {...props}>
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

export const GraduationCap: React.FC<IconProps> = ({ size, color, strokeWidth, ...props }) => (
  <svg {...baseProps(size, color, strokeWidth)} {...props}>
    <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" />
    <path d="M22 10v6" />
    <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" />
  </svg>
);

export const User: React.FC<IconProps> = ({ size, color, strokeWidth, ...props }) => (
  <svg {...baseProps(size, color, strokeWidth)} {...props}>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export const Users: React.FC<IconProps> = ({ size, color, strokeWidth, ...props }) => (
  <svg {...baseProps(size, color, strokeWidth)} {...props}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export const School: React.FC<IconProps> = ({ size, color, strokeWidth, ...props }) => (
  <svg {...baseProps(size, color, strokeWidth)} {...props}>
    <path d="m4 6 8-4 8 4" />
    <path d="m18 10 4 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8l4-2" />
    <path d="M14 22v-4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v4" />
    <path d="M18 5v17" />
    <path d="M6 5v17" />
    <circle cx="12" cy="9" r="2" />
  </svg>
);

export const FileText: React.FC<IconProps> = ({ size, color, strokeWidth, ...props }) => (
  <svg {...baseProps(size, color, strokeWidth)} {...props}>
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    <path d="M10 9H8" />
    <path d="M16 13H8" />
    <path d="M16 17H8" />
  </svg>
);

export const Plus: React.FC<IconProps> = ({ size, color, strokeWidth, ...props }) => (
  <svg {...baseProps(size, color, strokeWidth)} {...props}>
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </svg>
);

export const Trash2: React.FC<IconProps> = ({ size, color, strokeWidth, ...props }) => (
  <svg {...baseProps(size, color, strokeWidth)} {...props}>
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    <line x1="10" x2="10" y1="11" y2="17" />
    <line x1="14" x2="14" y1="11" y2="17" />
  </svg>
);

export const CheckCircle: React.FC<IconProps> = ({ size, color, strokeWidth, ...props }) => (
  <svg {...baseProps(size, color, strokeWidth)} {...props}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <path d="m9 11 3 3L22 4" />
  </svg>
);

export const CheckCircle2: React.FC<IconProps> = CheckCircle;

export const XCircle: React.FC<IconProps> = ({ size, color, strokeWidth, ...props }) => (
  <svg {...baseProps(size, color, strokeWidth)} {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="m15 9-6 6" />
    <path d="m9 9 6 6" />
  </svg>
);

export const AlertCircle: React.FC<IconProps> = ({ size, color, strokeWidth, ...props }) => (
  <svg {...baseProps(size, color, strokeWidth)} {...props}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" x2="12" y1="8" y2="12" />
    <line x1="12" x2="12.01" y1="16" y2="16" />
  </svg>
);

export const X: React.FC<IconProps> = ({ size, color, strokeWidth, ...props }) => (
  <svg {...baseProps(size, color, strokeWidth)} {...props}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

export const LogOut: React.FC<IconProps> = ({ size, color, strokeWidth, ...props }) => (
  <svg {...baseProps(size, color, strokeWidth)} {...props}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" x2="9" y1="12" y2="12" />
  </svg>
);

export const LinkIcon: React.FC<IconProps> = ({ size, color, strokeWidth, ...props }) => (
  <svg {...baseProps(size, color, strokeWidth)} {...props}>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

export const Clock: React.FC<IconProps> = ({ size, color, strokeWidth, ...props }) => (
  <svg {...baseProps(size, color, strokeWidth)} {...props}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

export const Calendar: React.FC<IconProps> = ({ size, color, strokeWidth, ...props }) => (
  <svg {...baseProps(size, color, strokeWidth)} {...props}>
    <path d="M8 2v4" />
    <path d="M16 2v4" />
    <rect width="18" height="18" x="3" y="4" rx="2" />
    <path d="M3 10h18" />
  </svg>
);

export const Award: React.FC<IconProps> = ({ size, color, strokeWidth, ...props }) => (
  <svg {...baseProps(size, color, strokeWidth)} {...props}>
    <path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.734.505l-4.258-2.24-4.258 2.24a.5.5 0 0 1-.734-.505l1.515-8.526" />
    <circle cx="12" cy="8" r="6" />
  </svg>
);

export const Send: React.FC<IconProps> = ({ size, color, strokeWidth, ...props }) => (
  <svg {...baseProps(size, color, strokeWidth)} {...props}>
    <path d="m22 2-7 20-4-9-9-4Z" />
    <path d="M22 2 11 13" />
  </svg>
);

export const Edit: React.FC<IconProps> = ({ size, color, strokeWidth, ...props }) => (
  <svg {...baseProps(size, color, strokeWidth)} {...props}>
    <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
    <path d="m15 5 4 4" />
  </svg>
);

export const Edit3: React.FC<IconProps> = Edit;

export const Eye: React.FC<IconProps> = ({ size, color, strokeWidth, ...props }) => (
  <svg {...baseProps(size, color, strokeWidth)} {...props}>
    <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const FileCheck: React.FC<IconProps> = ({ size, color, strokeWidth, ...props }) => (
  <svg {...baseProps(size, color, strokeWidth)} {...props}>
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    <path d="m9 15 2 2 4-4" />
  </svg>
);

export const Lock: React.FC<IconProps> = ({ size, color, strokeWidth, ...props }) => (
  <svg {...baseProps(size, color, strokeWidth)} {...props}>
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

export const Mail: React.FC<IconProps> = ({ size, color, strokeWidth, ...props }) => (
  <svg {...baseProps(size, color, strokeWidth)} {...props}>
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

export const ArrowRight: React.FC<IconProps> = ({ size, color, strokeWidth, ...props }) => (
  <svg {...baseProps(size, color, strokeWidth)} {...props}>
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

export const Sparkles: React.FC<IconProps> = ({ size, color, strokeWidth, ...props }) => (
  <svg {...baseProps(size, color, strokeWidth)} {...props}>
    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
  </svg>
);

export const Server: React.FC<IconProps> = ({ size, color, strokeWidth, ...props }) => (
  <svg {...baseProps(size, color, strokeWidth)} {...props}>
    <rect width="20" height="8" x="2" y="2" rx="2" ry="2" />
    <rect width="20" height="8" x="2" y="14" rx="2" ry="2" />
    <line x1="6" x2="6.01" y1="6" y2="6" />
    <line x1="6" x2="6.01" y1="18" y2="18" />
  </svg>
);

export const ExternalLink: React.FC<IconProps> = ({ size, color, strokeWidth, ...props }) => (
  <svg {...baseProps(size, color, strokeWidth)} {...props}>
    <path d="M15 3h6v6" />
    <path d="M10 14 21 3" />
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
  </svg>
);

export const Menu: React.FC<IconProps> = ({ size, color, strokeWidth, ...props }) => (
  <svg {...baseProps(size, color, strokeWidth)} {...props}>
    <line x1="4" x2="20" y1="12" y2="12" />
    <line x1="4" x2="20" y1="6" y2="6" />
    <line x1="4" x2="20" y1="18" y2="18" />
  </svg>
);

export const ChevronLeft: React.FC<IconProps> = ({ size, color, strokeWidth, ...props }) => (
  <svg {...baseProps(size, color, strokeWidth)} {...props}>
    <path d="m15 18-6-6 6-6" />
  </svg>
);

export const ChevronRight: React.FC<IconProps> = ({ size, color, strokeWidth, ...props }) => (
  <svg {...baseProps(size, color, strokeWidth)} {...props}>
    <path d="m9 18 6-6-6-6" />
  </svg>
);

export const ChevronDown: React.FC<IconProps> = ({ size, color, strokeWidth, ...props }) => (
  <svg {...baseProps(size, color, strokeWidth)} {...props}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const Search: React.FC<IconProps> = ({ size, color, strokeWidth, ...props }) => (
  <svg {...baseProps(size, color, strokeWidth)} {...props}>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

export const Filter: React.FC<IconProps> = ({ size, color, strokeWidth, ...props }) => (
  <svg {...baseProps(size, color, strokeWidth)} {...props}>
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

export const AlertTriangle: React.FC<IconProps> = ({ size, color, strokeWidth, ...props }) => (
  <svg {...baseProps(size, color, strokeWidth)} {...props}>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <line x1="12" x2="12" y1="9" y2="13" />
    <line x1="12" x2="12.01" y1="17" y2="17" />
  </svg>
);

export const Loader2: React.FC<IconProps> = ({ size, color, strokeWidth, className = '', ...props }) => (
  <svg {...baseProps(size, color, strokeWidth)} className={`animate-spin ${className}`} {...props}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

export const Check: React.FC<IconProps> = ({ size, color, strokeWidth, ...props }) => (
  <svg {...baseProps(size, color, strokeWidth)} {...props}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const Camera: React.FC<IconProps> = ({ size, color, strokeWidth, ...props }) => (
  <svg {...baseProps(size, color, strokeWidth)} {...props}>
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
    <circle cx="12" cy="13" r="3" />
  </svg>
);

export const Phone: React.FC<IconProps> = ({ size, color, strokeWidth, ...props }) => (
  <svg {...baseProps(size, color, strokeWidth)} {...props}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

export const MapPin: React.FC<IconProps> = ({ size, color, strokeWidth, ...props }) => (
  <svg {...baseProps(size, color, strokeWidth)} {...props}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

export const KeyRound: React.FC<IconProps> = ({ size, color, strokeWidth, ...props }) => (
  <svg {...baseProps(size, color, strokeWidth)} {...props}>
    <path d="M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4a6.5 6.5 0 1 0-4-4Z" />
    <circle cx="16.5" cy="7.5" r=".5" fill="currentColor" />
  </svg>
);

export const Upload: React.FC<IconProps> = ({ size, color, strokeWidth, ...props }) => (
  <svg {...baseProps(size, color, strokeWidth)} {...props}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" x2="12" y1="3" y2="15" />
  </svg>
);

export const ImageIcon: React.FC<IconProps> = ({ size, color, strokeWidth, ...props }) => (
  <svg {...baseProps(size, color, strokeWidth)} {...props}>
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
    <circle cx="9" cy="9" r="2" />
    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
  </svg>
);


