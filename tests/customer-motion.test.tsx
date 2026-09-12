import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import CustomerExperience from '../components/motion/CustomerExperience';

const route = vi.hoisted(() => ({ pathname: '/products' }));
vi.mock('next/navigation', () => ({ usePathname: () => route.pathname }));

let observerCallback: IntersectionObserverCallback;
let observed: Element[];
let disconnect: ReturnType<typeof vi.fn>;
let animate: ReturnType<typeof vi.fn>;
let cancel: ReturnType<typeof vi.fn>;
let reduced: boolean;
let preferenceListener: () => void;

beforeEach(() => {
  route.pathname = '/products';
  observed = [];
  reduced = false;
  disconnect = vi.fn();
  cancel = vi.fn();
  animate = vi.fn(() => ({ cancel, onfinish: null, oncancel: null }));
  Object.defineProperty(HTMLElement.prototype, 'animate', { configurable: true, value: animate });
  vi.stubGlobal('matchMedia', () => ({
    get matches() { return reduced; },
    addEventListener: (_: string, listener: () => void) => { preferenceListener = listener; },
    removeEventListener: vi.fn(),
  }));
  vi.stubGlobal('IntersectionObserver', class {
    constructor(callback: IntersectionObserverCallback) { observerCallback = callback; }
    observe(element: Element) { observed.push(element); }
    unobserve = vi.fn();
    disconnect = disconnect;
  });
});

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

function enter(elements = observed) {
  act(() => observerCallback(elements.map((target) => ({ target, isIntersecting: true })) as IntersectionObserverEntry[], {} as IntersectionObserver));
}

describe('customer motion', () => {
  it('keeps content readable before reveal and staggers entering cards', () => {
    render(<CustomerExperience><div data-customer-card="">First</div><div data-customer-card="">Second</div></CustomerExperience>);
    expect(screen.getByText('First').style.opacity).toBe('');
    expect(animate).not.toHaveBeenCalled();
    enter();
    expect(animate).toHaveBeenCalledTimes(2);
    expect(animate.mock.calls[0][1].delay).toBe(0);
    expect(animate.mock.calls[1][1].delay).toBe(55);
  });

  it('handles cards added after an API response', async () => {
    const view = render(<CustomerExperience><p>Loading</p></CustomerExperience>);
    view.rerender(<CustomerExperience><div data-customer-card="">New product</div></CustomerExperience>);
    await act(async () => {});
    expect(observed).toContain(screen.getByText('New product'));
  });

  it('does not animate when reduced motion is enabled and cancels on preference changes', () => {
    render(<CustomerExperience><div data-customer-card="">Product</div></CustomerExperience>);
    enter();
    reduced = true;
    act(() => preferenceListener());
    expect(cancel).toHaveBeenCalled();
    animate.mockClear();
    enter();
    expect(animate).not.toHaveBeenCalled();
  });

  it.each(['/admin', '/admin/login', '/collaborator/products'])('excludes %s', (pathname) => {
    route.pathname = pathname;
    const view = render(<CustomerExperience><div data-customer-card="">Internal</div></CustomerExperience>);
    expect(observed).toHaveLength(0);
    expect(view.container.querySelector('.customer-scroll-progress')).toBeNull();
  });

  it('preserves input state across navigation and disconnects observers', () => {
    const content = <input aria-label="Email" defaultValue="" />;
    const view = render(<CustomerExperience>{content}</CustomerExperience>);
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'user@example.com' } });
    route.pathname = '/contact';
    view.rerender(<CustomerExperience>{content}</CustomerExperience>);
    expect((screen.getByLabelText('Email') as HTMLInputElement).value).toBe('user@example.com');
    view.unmount();
    expect(disconnect).toHaveBeenCalledTimes(2);
  });

  it('does not double animate hero headings or dialog content', () => {
    render(<CustomerExperience><div className="customer-hero-copy"><h1>Hero</h1></div><div role="dialog"><div data-customer-card="">Dialog</div></div></CustomerExperience>);
    expect(observed).toHaveLength(0);
  });
});
