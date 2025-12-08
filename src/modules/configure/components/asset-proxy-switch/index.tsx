"use client";

import { useActionState } from "react";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "@/components/field";
import { Switch } from "@/components/switch";
import { saveAssetProxySwitch } from "./service";

interface AssetProxySwitchProps {
  value: boolean;
}

export const AssetProxySwitch: React.FC<AssetProxySwitchProps> = ({
  value,
}) => {
  const [state, formAction, isPending] = useActionState(
    saveAssetProxySwitch,
    value,
  );

  return (
    <Field orientation="horizontal">
      <FieldContent>
        <FieldLabel>开启资源代理</FieldLabel>
        <FieldDescription>
          开启后所有资源都会通过代理服务器获取，避免资源无法加载的问题
        </FieldDescription>
      </FieldContent>

      <Switch
        checked={state}
        onCheckedChange={formAction}
        disabled={isPending}
      />
    </Field>
  );
};
