import { Suspense } from "react";
import RegistrySearchPage from "./RegistrySearchPage";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-white">
          <div className="text-center">
            {/* Red spinner */}
            <div className="inline-block w-12 h-12 border-4 border-gray-100 border-t-red-600 rounded-full animate-spin"></div>
            {/* Red loading text */}
            <p className="mt-4 text-red-600 font-medium text-lg">Loading...</p>
          </div>
        </div>
      }
    >
      <RegistrySearchPage />
    </Suspense>
  );
}
