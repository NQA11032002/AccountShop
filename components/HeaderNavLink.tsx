'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './HeaderNavLink.module.css';

export function isNavigationActive(pathname: string | null, href: string) {
  const path = (pathname || '/').replace(/\/+$/, '') || '/';
  const target = href.replace(/\/+$/, '') || '/';
  return path === target || (target !== '/' && path.startsWith(`${target}/`));
}

export default function HeaderNavLink({ href, children, icon, onClick }: {
  href: string;
  children: ReactNode;
  icon?: ReactNode;
  onClick?: () => void;
}) {
  const active = isNavigationActive(usePathname(), href);
  return (
    <Link href={href} aria-current={active ? 'page' : undefined}
      className={`${styles.link} ${icon ? styles.mobile : ''}`} onClick={onClick}>
      {icon && <span className={styles.icon}>{icon}</span>}
      <span>{children}</span>
    </Link>
  );
}
