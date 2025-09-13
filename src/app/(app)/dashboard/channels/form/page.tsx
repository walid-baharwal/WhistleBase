import { Suspense } from "react";
import { FormCreatorScreen } from "@/screens/dashboard";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          </div>
        </div>
      }
    >
      <FormCreatorScreen />
    </Suspense>
  );
}
