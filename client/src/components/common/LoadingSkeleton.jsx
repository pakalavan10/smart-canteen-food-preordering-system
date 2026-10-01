const LoadingSkeleton = ({ type = 'card', count = 1 }) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div className="glass p-4 space-y-3 animate-pulse">
            <div className="skeleton h-40 w-full rounded-xl" />
            <div className="skeleton h-4 w-3/4 rounded" />
            <div className="skeleton h-3 w-1/2 rounded" />
            <div className="flex justify-between items-center">
              <div className="skeleton h-5 w-16 rounded" />
              <div className="skeleton h-8 w-20 rounded-lg" />
            </div>
          </div>
        );
      case 'table-row':
        return (
          <div className="flex items-center gap-4 p-4 animate-pulse">
            <div className="skeleton h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-4 w-1/3 rounded" />
              <div className="skeleton h-3 w-1/4 rounded" />
            </div>
            <div className="skeleton h-6 w-16 rounded-full" />
          </div>
        );
      case 'stat':
        return (
          <div className="glass p-6 animate-pulse space-y-3">
            <div className="skeleton h-3 w-20 rounded" />
            <div className="skeleton h-8 w-24 rounded" />
          </div>
        );
      case 'text':
        return (
          <div className="animate-pulse space-y-2">
            <div className="skeleton h-4 w-full rounded" />
            <div className="skeleton h-4 w-5/6 rounded" />
            <div className="skeleton h-4 w-4/6 rounded" />
          </div>
        );
      default:
        return <div className="skeleton h-20 w-full rounded-xl animate-pulse" />;
    }
  };

  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div key={i}>{renderSkeleton()}</div>
      ))}
    </>
  );
};

export default LoadingSkeleton;
