import { Suspense } from "react";
import { Spinner } from "@/components/spinner";
import { ConfigureTemplate } from "@/modules/configure/templates";

export const dynamic = "force-dynamic";

export default function ConfigurePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          <Spinner className="size-8 animate-spin" />
        </div>
      }
    >
      <ConfigureTemplate />
    </Suspense>
  );
}
