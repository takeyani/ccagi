export const ATTRIBUTE_LABELS = [
  "成分",
  "原材料",
  "原産地",
  "製造方法",
  "特徴",
  "規格",
  "認定・規格",
  "アレルゲン",
] as const;

export type AttributeLabel = (typeof ATTRIBUTE_LABELS)[number];
