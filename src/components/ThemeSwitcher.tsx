import React from 'react';
import { Check } from 'lucide-react';
import { THEMES, useTheme } from '../context/ThemeContext.tsx';

export default function ThemeSwitcher({ compact = false }: { compact?: boolean }) {
  const { themeId, setThemeId } = useTheme();

  return (
    <div className={compact ? 'flex gap-2' : 'grid grid-cols-5 gap-3'}>
      {THEMES.map((theme) => {
        const active = theme.id === themeId;
        return (
          <button
            key={theme.id}
            type="button"
            onClick={() => setThemeId(theme.id)}
            title={theme.label}
            aria-label={`Use ${theme.label} color scheme`}
            aria-pressed={active}
            className={`relative flex items-center justify-center rounded-full transition-all btn-glow ${
              compact ? 'w-7 h-7' : 'w-10 h-10 mx-auto'
            } ${active ? 'ring-2 ring-offset-2 ring-offset-slate-950' : 'hover:scale-110'}`}
            style={{
              backgroundColor: theme.swatch,
              '--tw-ring-color': theme.swatch
            } as React.CSSProperties}
          >
            {active && <Check size={compact ? 14 : 18} className="text-slate-950" strokeWidth={3} />}
          </button>
        );
      })}
      {!compact && (
        <div className="col-span-5 grid grid-cols-5 gap-3 -mt-1">
          {THEMES.map((theme) => (
            <p key={theme.id} className="text-center text-[10px] text-slate-500 font-medium truncate">
              {theme.label}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
