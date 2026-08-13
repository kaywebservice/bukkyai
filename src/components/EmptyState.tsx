import type { ReactNode } from "react";

type Props = {
  icon: "image" | "blog" | "target" | "pages" | "sparkles";
  title: string;
  children?: ReactNode;
  action?: ReactNode;
};

const PATHS: Record<Props["icon"], ReactNode> = {
  image: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="3" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      <circle cx="9" cy="9" r="1.6" fill="currentColor" opacity="0.9" />
      <path d="M6 16l4-4 3 3 2-2 3 3" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
      <path d="M6.5 7h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.35" />
      <circle cx="16" cy="11" r="1.1" fill="currentColor" opacity="0.5" />
    </>
  ),
  blog: (
    <>
      <path d="M5 4h14v13a2 2 0 01-2 2H7a2 2 0 01-2-2V4z" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.45" />
      <path d="M8 8h8M8 11h8M8 14h5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.8" />
      <circle cx="15.5" cy="14.5" r="2" fill="currentColor" opacity="0.25" />
      <path d="M4 7.5L6.5 10 9 7" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.5" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      <circle cx="12" cy="12" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.4" opacity="0.7" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.5" />
    </>
  ),
  pages: (
    <>
      <rect x="3" y="5" width="12" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      <rect x="9" y="3" width="12" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.75" />
      <path d="M6 8.5h6M6 11h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
    </>
  ),
  sparkles: (
    <>
      <path d="M12 4l1.8 4.4L18 10l-4.2 1.6L12 16l-1.8-4.4L6 10l4.2-1.6L12 4z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" opacity="0.8" />
      <path d="M18.5 15l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9.9-2.1z" fill="currentColor" opacity="0.5" />
      <path d="M6.5 16l.7 1.6 1.6.7-1.6.7-.7 1.6-.7-1.6-1.6-.7 1.6-.7.7-1.6z" fill="currentColor" opacity="0.35" />
    </>
  ),
};

export default function EmptyState({ icon, title, children, action }: Props) {
  return (
    <div className="empty-state">
      <div className="empty-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="26" height="26">
          {PATHS[icon]}
        </svg>
      </div>
      <b>{title}</b>
      {children && <p>{children}</p>}
      {action}
    </div>
  );
}
