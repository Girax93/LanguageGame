import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'ghost';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const base =
  'inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 ' +
  'font-semibold transition active:scale-[0.98] focus:outline-none ' +
  'focus-visible:ring-2 focus-visible:ring-white/60 disabled:opacity-50 ' +
  'disabled:pointer-events-none select-none';

const variants: Record<Variant, string> = {
  primary:
    'bg-white text-slate-900 shadow-lg shadow-black/20 hover:bg-slate-100',
  ghost: 'bg-white/10 text-white hover:bg-white/20 backdrop-blur',
};

export function Button({ variant = 'primary', className = '', ...rest }: Props) {
  return <button className={`${base} ${variants[variant]} ${className}`} {...rest} />;
}
