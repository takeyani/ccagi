export const PROJECT_TYPES = [
  { key: "web_app", label: "Webアプリ" },
  { key: "mobile", label: "モバイルアプリ" },
  { key: "business_system", label: "業務システム" },
  { key: "ec_site", label: "ECサイト" },
  { key: "corporate_site", label: "コーポレートサイト" },
  { key: "api", label: "API" },
] as const;

export type ProjectType = (typeof PROJECT_TYPES)[number]["key"];

export const SCALE_OPTIONS = [
  { key: "small", label: "小規模", multiplier: 0.5 },
  { key: "medium", label: "中規模", multiplier: 1.0 },
  { key: "large", label: "大規模", multiplier: 1.8 },
  { key: "enterprise", label: "エンタープライズ", multiplier: 3.0 },
] as const;

export const COMPLEXITY_OPTIONS = [
  { key: "simple", label: "シンプル", multiplier: 0.7 },
  { key: "standard", label: "標準", multiplier: 1.0 },
  { key: "complex", label: "複雑", multiplier: 1.5 },
] as const;

export const DEADLINE_OPTIONS = [
  { key: "relaxed", label: "余裕あり", multiplier: 0.9 },
  { key: "normal", label: "通常", multiplier: 1.0 },
  { key: "urgent", label: "急ぎ", multiplier: 1.3 },
] as const;

export const PLATFORM_OPTIONS = [
  { key: "web", label: "Web", multiplier: 1.0 },
  { key: "mobile", label: "モバイル", multiplier: 1.2 },
  { key: "both", label: "両方", multiplier: 1.8 },
] as const;

export const ADDITIONAL_FEATURES = [
  { key: "auth", label: "認証機能", design: 0, implementation: 0.5, test: 0.2 },
  { key: "payment", label: "決済機能", design: 0.3, implementation: 1.0, test: 0.5 },
  { key: "admin_panel", label: "管理画面", design: 0.5, implementation: 1.5, test: 0.3 },
  { key: "api_integration", label: "API連携", design: 0.3, implementation: 0.8, test: 0.3 },
  { key: "realtime", label: "リアルタイム", design: 0.3, implementation: 1.0, test: 0.3 },
  { key: "file_upload", label: "ファイルアップロード", design: 0, implementation: 0.5, test: 0.2 },
  { key: "notification", label: "通知機能", design: 0.2, implementation: 0.5, test: 0.2 },
  { key: "i18n", label: "多言語対応", design: 0.3, implementation: 0.8, test: 0.3 },
  { key: "analytics", label: "分析・レポート", design: 0.3, implementation: 0.8, test: 0.3 },
  { key: "search", label: "検索機能", design: 0.2, implementation: 0.5, test: 0.2 },
] as const;

export type AdditionalFeatureKey = (typeof ADDITIONAL_FEATURES)[number]["key"];

export const DEFAULT_UNIT_PRICE = 700000;
export const DEFAULT_DISCOUNT_RATE = 30.0;

export const ESTIMATE_STATUSES = [
  "下書き",
  "送付済み",
  "受注",
  "失注",
  "アーカイブ",
] as const;

export type EstimateStatus = (typeof ESTIMATE_STATUSES)[number];

export interface EstimateConditions {
  scale: string;
  complexity: string;
  deadline: string;
  platform: string;
  features: string[];
}
