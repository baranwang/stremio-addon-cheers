"use client";

import { isEqual } from "es-toolkit";
import { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/button";
import { Checkbox } from "@/components/checkbox";
import {
  FieldContent,
  FieldDescription,
  FieldLegend,
  FieldSet,
} from "@/components/field";
import { SeasonType } from "@/lib/bilibili";
import { savePgcCatalogs } from "./service";

const PGC_CATALOG_LIST = [
  { id: SeasonType.Anime, name: "番剧" },
  { id: SeasonType.Movie, name: "电影" },
  { id: SeasonType.Documentary, name: "纪录片" },
  { id: SeasonType.ChineseAnime, name: "国创" },
  { id: SeasonType.TV, name: "电视剧" },
  { id: SeasonType.VarietyShow, name: "综艺" },
];

interface CatalogsConfigProps {
  value: SeasonType[];
}

export const CatalogsConfig: React.FC<CatalogsConfigProps> = ({ value }) => {
  const [state, formAction, isPending] = useActionState(savePgcCatalogs, value);
  const [selected, setSelected] = useState<SeasonType[]>(state ?? []);

  // 当 server action 返回新值后同步本地状态
  useEffect(() => {
    setSelected(state ?? []);
  }, [state]);

  const handleToggle = (id: SeasonType) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  return (
    <FieldSet>
      <FieldContent>
        <FieldLegend>列表配置</FieldLegend>
        <FieldDescription>选择要在 Stremio 中显示的内容分类</FieldDescription>
      </FieldContent>

      <form action={formAction} className="space-y-4">
        {/* 使用隐藏的 input 传递选中的值 */}
        {selected.map((id) => (
          <input type="hidden" name="catalog" value={id} key={id} />
        ))}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {PGC_CATALOG_LIST.map((catalog) => (
            <label
              key={catalog.id}
              className="flex cursor-pointer items-center gap-2.5 rounded-lg border bg-background px-3 py-2.5 transition-colors hover:bg-accent/50 has-[[aria-checked=true]]:border-primary has-[[aria-checked=true]]:bg-primary/5"
            >
              <Checkbox
                checked={selected.includes(catalog.id)}
                onCheckedChange={() => handleToggle(catalog.id)}
              />
              <span className="text-sm font-medium">{catalog.name}</span>
            </label>
          ))}
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="w-full"
          hidden={isEqual(selected, value)}
        >
          {isPending ? "保存中..." : "保存列表配置"}
        </Button>
      </form>
    </FieldSet>
  );
};
