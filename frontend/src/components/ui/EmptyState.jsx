import clsx from 'clsx';

const EmptyState = ({ icon = 'inbox', title = 'Nothing here', message = '', className }) => {
  return (
    <div className={clsx('flex flex-col items-center justify-center py-16 px-4 text-center', className)}>
      <div className="w-16 h-16 rounded-full bg-[#eceef0] flex items-center justify-center mb-4">
        <span className="material-symbols-outlined text-[#737686]" style={{ fontSize: '32px' }}>
          {icon}
        </span>
      </div>
      <h3 className="text-base font-semibold text-[#191c1e] mb-1">{title}</h3>
      {message && (
        <p className="text-sm text-[#434655] max-w-xs">{message}</p>
      )}
    </div>
  );
};

export default EmptyState;
