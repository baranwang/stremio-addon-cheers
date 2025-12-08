"use client";

import { useActionState } from "react";
import { Checkbox } from "@/components/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/field";
import { FnvalType } from "@/lib/bilibili/stream/constants";
import { saveFnvalSetting } from "./function";

interface FnvalSettingProps {
  value: number;
}

const fnvalTypeOptions = [
  {
    value: FnvalType.HDR,
    label: "开启 HDR 视频",
  },
  {
    value: FnvalType.NEED_4K,
    label: "开启 4K 分辨率",
  },
  {
    value: FnvalType.DOLBY_VISION,
    label: "开启杜比视界",
  },
  {
    value: FnvalType.NEED_8K,
    label: "开启 8K 分辨率",
  },
  {
    value: FnvalType.AV1,
    label: "开启 AV1 编码",
  },
  {
    value: FnvalType.SMART_REPAIR,
    label: "开启智能修复",
  },
];

export const FnvalSetting: React.FC<FnvalSettingProps> = ({ value }) => {
  const [state, formAction] = useActionState(saveFnvalSetting, value || 0);

  return (
    <Field>
      <FieldContent>
        <FieldLabel>视频分辨率</FieldLabel>
        <FieldDescription>大多数开关都需要大会员账号才会生效</FieldDescription>
      </FieldContent>
      <FieldGroup className="gap-3">
        {fnvalTypeOptions.map((option) => (
          <Field orientation="horizontal" key={option.value}>
            <FieldContent>
              <label className="hover:bg-accent/50 flex items-center gap-3 rounded-lg border p-3 has-aria-checked:border-neutral-600 has-aria-checked:bg-neutral-50 dark:has-aria-checked:border-neutral-900 dark:has-aria-checked:bg-neutral-950">
                <Checkbox
                  checked={(state & option.value) === option.value}
                  onCheckedChange={(checked: boolean) =>
                    formAction({ checked, value: option.value })
                  }
                />
                <span>{option.label}</span>
              </label>
            </FieldContent>
          </Field>
        ))}
      </FieldGroup>
    </Field>
  );
};
