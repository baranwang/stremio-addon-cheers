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

interface ManifestUrlProps {
  baseUrl: string;
}

export const ManifestUrl: React.FC<ManifestUrlProps> = ({ baseUrl }) => {
  const manifest = useMemo(() => {
    return new URL("/manifest.json", baseUrl).toString();
  }, [baseUrl]);
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
