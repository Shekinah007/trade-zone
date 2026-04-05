import { Suspense } from "react";
import RegistrySearchPage from "./RegistrySearchPage";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegistrySearchPage />
    </Suspense>
  );
}