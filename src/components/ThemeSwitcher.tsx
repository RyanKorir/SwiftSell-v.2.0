import React from 'react';
import { Check } from 'lucide-react';
import { THEMES, useTheme } from '../context/ThemeContext.tsx';

export default function ThemeSwitcher({ compact = false }: { compact?: boolean }) {
  const { themeId, setThemeId } = useTheme();
  const size = compact ? 26 : 40;

  return (
    <div
      className={
        compact
          ? 'flex gap-2 overflow-x-auto max-w-[220px] py-1 px-0.5'
          : 'grid grid-cols-5 gap-x-3 gap-y-4'
      }
    >
      {THEMES.map((theme) => {
        const active = theme.id === themeId;
        const button = (
          <button
            key={theme.id}
            type="button"
            onClick={() => setThemeId(theme.id)}
            title={theme.label}
            aria-label={`Use ${theme.label} color scheme`}
            aria-pressed={active}
            className={`relative flex shrink-0 items-center justify-center rounded-full transition-all btn-glow ${
              active ? 'ring-2 ring-offset-2 ring-offset-slate-950' : 'hover:scale-110'
            }`}
            style={
              {
                width: size,
                height: size,
                backgroundColor: theme.swatch,
                '--tw-ring-color': theme.swatch
              } as React.CSSProperties
            }
          >
            {active && <Check size={size * 0.55} className="text-slate-950" strokeWidth={3} />}
          </button>
        );

        if (compact) return button;

        return (
          <div key={theme.id} className="flex flex-col items-center gap-1.5">
            {button}
            <p className="text-center text-[10px] text-slate-500 font-medium leading-tight">
              {theme.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}
