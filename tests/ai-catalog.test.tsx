import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { AI_TOOLS, AI_TOOL_CATEGORIES, filterAiTools, NEW_AI_TOOL_IDS } from '../data/ai-tools';
import Catalog from '../app/cong-cu-ai/page';

vi.mock('@/components/Header', () => ({ default: () => null }));
vi.mock('@/components/Footer', () => ({ default: () => null }));
vi.mock('@/components/SectionReveal', () => ({ default: ({ children }: { children: ReactNode }) => <div>{children}</div> }));
vi.mock('@/components/AiToolLogo', () => ({ default: () => null }));
afterEach(cleanup);

describe('AI catalog', () => {
  it('has unique IDs and HTTPS destinations, valid categories, and descriptions', () => {
    expect(new Set(AI_TOOLS.map((tool) => tool.id)).size).toBe(AI_TOOLS.length);
    expect(new Set(AI_TOOLS.map((tool) => tool.website.replace(/\/$/, ''))).size).toBe(AI_TOOLS.length);
    expect(NEW_AI_TOOL_IDS.size).toBe(60);
    expect(AI_TOOL_CATEGORIES).toHaveLength(20);
    for (const tool of AI_TOOLS) {
      expect(new URL(tool.website).protocol).toBe('https:');
      expect(AI_TOOL_CATEGORIES.some((category) => category.id === tool.categoryId)).toBe(true);
      expect(tool.useCase.length).toBeGreaterThan(20);
    }
    for (const category of AI_TOOL_CATEGORIES) {
      expect(AI_TOOLS.some((tool) => tool.categoryId === category.id)).toBe(true);
    }
    console.info(`Catalog: ${AI_TOOLS.length} tools, ${AI_TOOL_CATEGORIES.length} categories, ${NEW_AI_TOOL_IDS.size} additions`);
  });

  it('searches Vietnamese without accents and supports combined filters', () => {
    expect(filterAiTools('all', 'noi that').map((tool) => tool.id)).toEqual(filterAiTools('all', 'nội thất').map((tool) => tool.id));
    expect(filterAiTools('all', 'noi that').length).toBeGreaterThan(0);
    expect(filterAiTools('data', 'excel', true).map((tool) => tool.id)).toContain('numerous');
    expect(filterAiTools('translation', 'n8n')).toEqual([]);
    expect(filterAiTools('all', '', true)).toHaveLength(60);
    expect(filterAiTools('audio').map((tool) => tool.id)).toContain('suno');
  });

  it('paginates and resets the page after selecting a new category', () => {
    render(<Catalog />);
    expect(screen.getAllByRole('link', { name: 'Trang chính thức' })).toHaveLength(24);
    expect(screen.getByRole('button', { name: 'Trang trước' }).hasAttribute('disabled')).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Trang sau' }));
    expect(screen.getByText(/Trang 2\//)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /^Dữ liệu & Excel/ }));
    expect(screen.getAllByRole('link', { name: 'Trang chính thức' })).toHaveLength(filterAiTools('data').length);
    expect(screen.queryByRole('navigation', { name: 'Phân trang công cụ AI' })).toBeNull();
  });

  it('shows new entries and clears all filters from the empty state', () => {
    render(<Catalog />);
    fireEvent.click(screen.getByRole('button', { name: /^Mới bổ sung/ }));
    expect(screen.getByRole('status').textContent).toContain('60');
    fireEvent.change(screen.getByRole('textbox', { name: 'Tìm công cụ AI theo tên hoặc nhu cầu' }), { target: { value: 'not-a-real-tool-999' } });
    expect(screen.getByText('Không tìm thấy AI phù hợp')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Xóa bộ lọc' }));
    expect(screen.getByRole('status').textContent).toContain(String(AI_TOOLS.length));
    expect(screen.getByRole('button', { name: /^Mới bổ sung/ }).getAttribute('aria-pressed')).toBe('false');
  });
});
