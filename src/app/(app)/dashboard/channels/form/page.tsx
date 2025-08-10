import { Suspense } from "react";
import { FormCreatorScreen } from "@/screens/dashboard";
import LottieLoading from "@/components/LottieLoading";

export default function Page() {
  return (
    <Suspense fallback={<LottieLoading />}>
      <FormCreatorScreen />
    </Suspense>
  );
}
