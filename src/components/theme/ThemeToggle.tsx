'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTheme, ThemeMode } from './ThemeProvider';
import { Sun, Moon, Laptop, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const options: { mode: ThemeMode; label: string; icon: typeof Sun }[] = [
    { mode: 'light', label: 'Terang', icon: Sun },
    { mode: 'dark', label: 'Gelap', icon: Moon },
    { mode: 'system', label: 'Sistem', icon: Laptop },
  ];

  const CurrentIcon = resolvedTheme === 'dark' ? Moon : Sun;

  return (
    <div className={cn('relative inline-block text-left', className)} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Pengalih Tema"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-card text-foreground hover:bg-muted text-xs font-semibold transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <CurrentIcon className="w-3.5 h-3.5 text-secondary" strokeWidth={1.5} />
        <span className="capitalize">{theme === 'system' ? 'Sistem' : theme === 'dark' ? 'Gelap' : 'Terang'}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 rounded-xl bg-card border border-border shadow-xl z-50 py-1 animate-in fade-in zoom-in-95 duration-100">
          {options.map(opt => {
            const Icon = opt.icon;
            const isSelected = theme === opt.mode;

            return (
              <button
                key={opt.mode}
                type="button"
                onClick={() => {
                  setTheme(opt.mode);
                  setIsOpen(false);
                }}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-2 text-xs font-medium transition text-left',
                  isSelected
                    ? 'bg-secondary/10 text-secondary font-bold'
                    : 'text-foreground hover:bg-muted'
                )}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
                  <span>{opt.label}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-secondary" strokeWidth={1.5} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
