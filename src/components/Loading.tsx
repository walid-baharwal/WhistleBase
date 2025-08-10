interface LoadingProps {
  size?: number;
  className?: string;
  message?: string;
  variant?: 'spinner' | 'dots' | 'pulse';
}

export default function Loading({ 
  size = 40, 
  className = "", 
  message,
  variant = 'spinner' 
}: LoadingProps) {
  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        );
      case 'pulse':
        return (
          <div 
            className="bg-primary rounded-full animate-pulse opacity-75"
            style={{ width: size, height: size }}
          />
        );
      default:
        return (
          <div 
            className="animate-spin rounded-full border-4 border-gray-200 border-t-primary"
            style={{ width: size, height: size }}
          />
        );
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
      {renderSpinner()}
      {message && (
        <p className="text-muted-foreground text-sm text-center">{message}</p>
      )}
    </div>
  );
}
