"use client";

import { LogOutIcon } from "lucide-react";
import { useTransition } from "react";
import { Button } from "@/components/button";
import { logout } from "./service";

export const LogoutButton: React.FC = () => {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      onClick={() => startTransition(() => logout())}
      disabled={isPending}
    >
      <LogOutIcon className="size-4" />
      {isPending ? "退出中..." : "退出登录"}
    </Button>
  );
};
