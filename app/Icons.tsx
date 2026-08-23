// app/Icons.tsx — כל האייקונים של האתר כ-SVG
export const size = { sm: 18, md: 22, lg: 28, xl: 36 };

type Props = { size?: number; color?: string; className?: string };

export function HomeIcon({ size: s = 22, color = 'currentColor', className }: Props) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={color} className={className}>
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
    </svg>
  );
}

export function MicIcon({ size: s = 22, color = 'currentColor', className }: Props) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={color} className={className}>
      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1 1.93c-3.94-.49-7-3.85-7-7.93h2c0 3.31 2.69 6 6 6s6-2.69 6-6h2c0 4.08-3.06 7.44-7 7.93V22h-2v-4.07z"/>
    </svg>
  );
}

export function AlbumIcon({ size: s = 22, color = 'currentColor', className }: Props) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={color} className={className}>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-5.5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/>
    </svg>
  );
}

export function MusicNoteIcon({ size: s = 22, color = 'currentColor', className }: Props) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={color} className={className}>
      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
    </svg>
  );
}

export function HeartIcon({ size: s = 22, filled = false, color = '#DD2476', className }: Props & { filled?: boolean }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={filled ? color : 'none'} stroke={filled ? 'none' : '#ccc'} strokeWidth="2" className={className}>
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
    </svg>
  );
}

export function PlayIcon({ size: s = 22, color = 'currentColor', className }: Props) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={color} className={className}>
      <path d="M8 5v14l11-7z"/>
    </svg>
  );
}

export function DownloadIcon({ size: s = 22, color = 'currentColor', className }: Props) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={color} className={className}>
      <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
    </svg>
  );
}

export function FolderIcon({ size: s = 22, color = 'currentColor', className }: Props) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={color} className={className}>
      <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
    </svg>
  );
}

export function SearchIcon({ size: s = 22, color = 'currentColor', className }: Props) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" className={className}>
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
    </svg>
  );
}

export function MenuIcon({ size: s = 22, color = 'currentColor', className }: Props) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" className={className}>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  );
}

export function CloseIcon({ size: s = 22, color = 'currentColor', className }: Props) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" className={className}>
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );
}

export function MailIcon({ size: s = 22, color = 'currentColor', className }: Props) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={color} className={className}>
      <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
    </svg>
  );
}

export function HistoryIcon({ size: s = 22, color = 'currentColor', className }: Props) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={color} className={className}>
      <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
    </svg>
  );
}

export function PrevIcon({ size: s = 22, color = 'currentColor', className }: Props) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={color} className={className}>
      <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/>
    </svg>
  );
}

export function NextIcon({ size: s = 22, color = 'currentColor', className }: Props) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={color} className={className}>
      <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
    </svg>
  );
}

export function BackIcon({ size: s = 22, color = 'currentColor', className }: Props) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={color} className={className}>
      <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
    </svg>
  );
}

export function LogoutIcon({ size: s = 22, color = 'currentColor', className }: Props) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={color} className={className}>
      <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
    </svg>
  );
}

export function StarIcon({ size: s = 22, filled = false, color = '#DD2476', className }: Props & { filled?: boolean }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={filled ? color : 'none'} stroke={color} strokeWidth="2" className={className}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  );
}
