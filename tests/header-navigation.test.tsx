import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createPortal } from 'react-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import HeaderNavLink, { isNavigationActive } from '../components/HeaderNavLink';

const route = vi.hoisted(() => ({ pathname: '/about' }));
vi.mock('next/navigation', () => ({ usePathname: () => route.pathname }));
afterEach(cleanup);

describe('header active navigation', () => {
  it.each([
    ['/', '/', true], ['/about', '/', false], ['/about/', '/about', true],
    ['/huong-dan/chatgpt', '/huong-dan', true], ['/lo-trinh-ai/intro', '/lo-trinh-ai', true],
    ['/prompt-other', '/prompt', false], ['/cong-cu-ai', '/about', false],
  ])('matches %s against %s', (path, href, expected) => {
    expect(isNavigationActive(path, href)).toBe(expected);
  });

  it('moves the selected state when the route changes without a mouse hover', () => {
    route.pathname = '/about';
    const nav = () => <nav><HeaderNavLink href="/">Home</HeaderNavLink><HeaderNavLink href="/about">About</HeaderNavLink><HeaderNavLink href="/huong-dan">Guides</HeaderNavLink></nav>;
    const view = render(nav());
    expect(screen.getByText('About').closest('a')?.getAttribute('aria-current')).toBe('page');
    route.pathname = '/huong-dan/chatgpt';
    view.rerender(nav());
    expect(screen.getByText('Guides').closest('a')?.getAttribute('aria-current')).toBe('page');
    expect(screen.getByText('About').closest('a')?.hasAttribute('aria-current')).toBe(false);
    expect(document.querySelectorAll('[aria-current="page"]')).toHaveLength(1);
  });

  it('keeps the active mobile link inside a portal and closes the drawer on click', () => {
    route.pathname = '/about';
    const close = vi.fn();
    render(createPortal(<HeaderNavLink href="/about" icon={<svg />} onClick={close}>About</HeaderNavLink>, document.body));
    const link = screen.getByRole('link', { name: 'About' });
    expect(link.getAttribute('aria-current')).toBe('page');
    expect(link.className).toContain('mobile');
    link.addEventListener('click', (event) => event.preventDefault());
    fireEvent.click(link);
    expect(close).toHaveBeenCalledOnce();
  });
});
