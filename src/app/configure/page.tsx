import { Suspense } from "react";
import { Spinner } from "@/components/spinner";
import { ConfigureTemplate } from "@/modules/configure/templates";

export default function Home() {
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
