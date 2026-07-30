import clsx from 'clsx';

const VARIANTS = {
  primary: 'bg-[#004ac6] text-white hover:bg-[#003ea8] active:bg-[#00174b]',
  secondary: 'bg-[#d0e1fb] text-[#003ea8] hover:bg-[#b4c5ff] active:bg-[#dbe1ff]',
  outline: 'bg-transparent border border-[#c3c6d7] text-[#434655] hover:bg-[#eceef0] active:bg-[#e0e3e5]',
  danger: 'bg-[#ba1a1a] text-white hover:bg-[#93000a] active:bg-[#690005]',
  ghost: 'bg-transparent text-[#004ac6] hover:bg-[#eceef0] active:bg-[#e0e3e5]',
};

const SIZES = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-9 px-4 text-sm gap-2',
  lg: 'h-11 px-6 text-base gap-2',
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  disabled = false,
  loading = false,
  className,
  onClick,
  type = 'button',
  ...rest
}) => {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={clsx(
        'inline-flex items-center justify-center font-semibold rounded-lg transition-colors cursor-pointer',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#004ac6] focus-visible:ring-offset-1',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        VARIANTS[variant] || VARIANTS.primary,
        SIZES[size] || SIZES.md,
        className
      )}
      {...rest}
    >
      {loading ? (
        <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
      ) : (
        icon && (
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
            {icon}
          </span>
        )
      )}
      {children}
      {iconRight && !loading && (
        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
          {iconRight}
        </span>
      )}
    </button>
  );
};

export default Button;
