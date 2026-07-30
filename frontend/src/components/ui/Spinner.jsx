import clsx from 'clsx';

const Spinner = ({ size = 'md', className, centered = false }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
  };

  const spinner = (
    <div
      className={clsx(
        'rounded-full border-[#e0e3e5] border-t-[#004ac6] animate-spin',
        sizeClasses[size] || sizeClasses.md,
        className
      )}
    />
  );

  if (centered) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-[200px]">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default Spinner;
