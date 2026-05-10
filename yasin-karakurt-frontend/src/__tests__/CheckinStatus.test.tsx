'use client';

import { render, screen } from '@testing-library/react';

const STATUS_CFG: Record<string, { label: string; cls: string }> = {
  PENDING:   { label: 'Bekliyor',   cls: 'bg-amber-500/15 text-amber-300 border-amber-500/30'     },
  REVIEWED:  { label: 'İncelendi',  cls: 'bg-sky-500/15   text-sky-300   border-sky-500/30'       },
  COMPLETED: { label: 'Tamamlandı', cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
};

interface CheckInStatusBadgeProps {
  status: 'PENDING' | 'REVIEWED' | 'COMPLETED';
}

function CheckInStatusBadge({ status }: CheckInStatusBadgeProps) {
  const config = STATUS_CFG[status];
  return (
    <span 
      data-testid="status-badge"
      className={`text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full border ${config?.cls || ''}`}
    >
      {config?.label || status}
    </span>
  );
}

describe('CheckInStatusBadge', () => {
  it('renders PENDING status with correct label', () => {
    render(<CheckInStatusBadge status="PENDING" />);
    
    const badge = screen.getByTestId('status-badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('Bekliyor');
  });

  it('renders PENDING status with amber Tailwind classes', () => {
    render(<CheckInStatusBadge status="PENDING" />);
    
    const badge = screen.getByTestId('status-badge');
    expect(badge).toHaveClass('bg-amber-500/15');
    expect(badge).toHaveClass('text-amber-300');
  });

  it('renders REVIEWED status with correct label', () => {
    render(<CheckInStatusBadge status="REVIEWED" />);
    
    const badge = screen.getByTestId('status-badge');
    expect(badge).toHaveTextContent('İncelendi');
  });

  it('renders REVIEWED status with sky Tailwind classes', () => {
    render(<CheckInStatusBadge status="REVIEWED" />);
    
    const badge = screen.getByTestId('status-badge');
    expect(badge).toHaveClass('bg-sky-500/15');
    expect(badge).toHaveClass('text-sky-300');
  });

  it('renders COMPLETED status with correct label', () => {
    render(<CheckInStatusBadge status="COMPLETED" />);
    
    const badge = screen.getByTestId('status-badge');
    expect(badge).toHaveTextContent('Tamamlandı');
  });

  it('renders COMPLETED status with emerald Tailwind classes', () => {
    render(<CheckInStatusBadge status="COMPLETED" />);
    
    const badge = screen.getByTestId('status-badge');
    expect(badge).toHaveClass('bg-emerald-500/15');
    expect(badge).toHaveClass('text-emerald-300');
  });

  it('handles unknown status gracefully', () => {
    render(<CheckInStatusBadge status="UNKNOWN" as any />);
    
    const badge = screen.getByTestId('status-badge');
    expect(badge).toHaveTextContent('UNKNOWN');
  });
});

describe('STATUS_CFG', () => {
  it('has PENDING configuration', () => {
    expect(STATUS_CFG.PENDING).toBeDefined();
    expect(STATUS_CFG.PENDING.label).toBe('Bekliyor');
    expect(STATUS_CFG.PENDING.cls).toContain('text-amber-300');
  });

  it('has REVIEWED configuration', () => {
    expect(STATUS_CFG.REVIEWED).toBeDefined();
    expect(STATUS_CFG.REVIEWED.label).toBe('İncelendi');
    expect(STATUS_CFG.REVIEWED.cls).toContain('text-sky-300');
  });

  it('has COMPLETED configuration', () => {
    expect(STATUS_CFG.COMPLETED).toBeDefined();
    expect(STATUS_CFG.COMPLETED.label).toBe('Tamamlandı');
    expect(STATUS_CFG.COMPLETED.cls).toContain('text-emerald-300');
  });
});