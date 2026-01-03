import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | 'primary'
    | 'secondary'
    | 'danger'
    | 'ghost'
    | 'success'
    | 'warning';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  icon,
  ...props
}) => {
  // Base styles: clear focus rings, rounded corners, transition for the "press" effect
  const baseStyles =
    'relative font-black tracking-wide rounded-2xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2 select-none touch-manipulation focus:outline-none';

  // 3D-ish flat style with border-bottom
  const variants = {
    primary:
      'bg-blue-500 text-white shadow-[0_4px_0_0_rgba(29,78,216,1)] active:shadow-none active:translate-y-[4px]',
    // Secondary adapted for Light Theme: Light gray/slate with darker shadow
    secondary:
      'bg-slate-200 text-slate-700 shadow-[0_4px_0_0_rgba(148,163,184,1)] active:shadow-none active:translate-y-[4px]',
    success:
      'bg-green-500 text-white shadow-[0_4px_0_0_rgba(21,128,61,1)] active:shadow-none active:translate-y-[4px]',
    warning:
      'bg-yellow-400 text-black shadow-[0_4px_0_0_rgba(161,98,7,1)] active:shadow-none active:translate-y-[4px]',
    danger:
      'bg-red-500 text-white shadow-[0_4px_0_0_rgba(185,28,28,1)] active:shadow-none active:translate-y-[4px]',
    ghost:
      'bg-transparent text-slate-400 hover:text-slate-700 hover:bg-slate-100 active:bg-slate-200',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm h-10',
    md: 'px-6 py-4 text-lg h-14',
    lg: 'px-8 py-5 text-xl h-16',
    xl: 'px-8 py-6 text-2xl h-20',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
      {...props}
    >
      {icon && <span className="text-current">{icon}</span>}
      {children && <span>{children}</span>}
    </button>
  );
};
