import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'ghost';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

/**
 * Primary = solid brown with cream text. Ghost = transparent with a brown
 * border (the secondary style). See .btn-* in index.css.
 */
export function Button({ variant = 'primary', className = '', ...rest }: Props) {
  const cls = variant === 'primary' ? 'btn-primary' : 'btn-secondary';
  return <button className={`${cls} ${className}`} {...rest} />;
}
