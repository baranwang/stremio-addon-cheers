import { saveConfig } from "@/lib/config";

export const saveFnvalSetting = async (
  previousState: number,
  state: { checked: boolean; value: number },
) => {
  const { checked, value } = state;
  if (checked) {
    return saveConfig("fnval", previousState | value);
  } else {
    return saveConfig("fnval", previousState & ~value);
  }
};
