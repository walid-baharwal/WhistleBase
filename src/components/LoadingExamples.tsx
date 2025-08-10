import LottieLoading from './LottieLoading';

// Usage examples for the LottieLoading component with theme variants

export function LoadingExamples() {
  return (
    <div className="space-y-8 p-8 bg-background text-foreground">
      {/* Default variant */}
      <div>
        <h3 className="text-lg font-medium mb-4">Default Loading</h3>
        <LottieLoading size={64} message="Loading..." variant="default" />
      </div>

      {/* Primary theme variant */}
      <div>
        <h3 className="text-lg font-medium mb-4">Primary Theme</h3>
        <LottieLoading size={64} message="Processing with primary colors..." variant="primary" />
      </div>

      {/* Secondary theme variant */}
      <div>
        <h3 className="text-lg font-medium mb-4">Secondary Theme</h3>
        <LottieLoading size={64} message="Loading with secondary colors..." variant="secondary" />
      </div>

      {/* Muted theme variant */}
      <div>
        <h3 className="text-lg font-medium mb-4">Muted Theme</h3>
        <LottieLoading size={64} message="Subtle loading animation..." variant="muted" />
      </div>

      {/* Different sizes with theme variants */}
      <div>
        <h3 className="text-lg font-medium mb-4">Size Variations</h3>
        <div className="flex items-center space-x-8">
          <div className="text-center">
            <p className="mb-2 text-sm text-muted-foreground">Small</p>
            <LottieLoading size={32} variant="primary" />
          </div>
          <div className="text-center">
            <p className="mb-2 text-sm text-muted-foreground">Medium</p>
            <LottieLoading size={48} variant="secondary" />
          </div>
          <div className="text-center">
            <p className="mb-2 text-sm text-muted-foreground">Large</p>
            <LottieLoading size={80} variant="default" />
          </div>
        </div>
      </div>

      {/* In different containers with theme backgrounds */}
      <div>
        <h3 className="text-lg font-medium mb-4">Theme-aware Containers</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-card border rounded-lg p-4">
            <h4 className="text-sm font-medium text-card-foreground mb-3">Card Background</h4>
            <LottieLoading size={48} message="Loading on card..." variant="primary" />
          </div>
          <div className="bg-muted rounded-lg p-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Muted Background</h4>
            <LottieLoading size={48} message="Loading on muted..." variant="default" />
          </div>
        </div>
      </div>
    </div>
  );
}
