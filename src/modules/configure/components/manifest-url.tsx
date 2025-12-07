"use client";

import { CopyIcon } from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";
import { Button } from "@/components/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/item";

export const ManifestUrl = () => {
  const manifest = useMemo(() => {
    if (typeof window === "undefined") {
      return null;
    }
    return new URL("/manifest.json", window.location.origin).toString();
  }, []);
  return (
    <Item>
      <ItemContent>
        <ItemTitle>Manifest</ItemTitle>
        <ItemDescription>{manifest}</ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button
          variant="outline"
          onClick={() => {
            navigator.clipboard.writeText(manifest ?? "").then(() => {
              toast.success("复制成功");
            });
          }}
        >
          <CopyIcon />
          复制
        </Button>
      </ItemActions>
    </Item>
  );
};
