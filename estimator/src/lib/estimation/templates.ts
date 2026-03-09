export interface TaskTemplate {
  phaseKey: string;
  phaseName: string;
  phaseSortOrder: number;
  taskName: string;
  taskSortOrder: number;
  baseManMonths: number;
}

export const PHASE_TEMPLATES: TaskTemplate[] = [
  // 要件定義
  { phaseKey: "requirements", phaseName: "要件定義", phaseSortOrder: 1, taskName: "要求ヒアリング", taskSortOrder: 1, baseManMonths: 0.5 },
  { phaseKey: "requirements", phaseName: "要件定義", phaseSortOrder: 1, taskName: "要件定義書作成", taskSortOrder: 2, baseManMonths: 1.0 },
  { phaseKey: "requirements", phaseName: "要件定義", phaseSortOrder: 1, taskName: "画面一覧・画面遷移図", taskSortOrder: 3, baseManMonths: 0.5 },
  { phaseKey: "requirements", phaseName: "要件定義", phaseSortOrder: 1, taskName: "機能一覧作成", taskSortOrder: 4, baseManMonths: 0.3 },

  // 基本設計
  { phaseKey: "basic_design", phaseName: "基本設計", phaseSortOrder: 2, taskName: "システム構成設計", taskSortOrder: 1, baseManMonths: 0.5 },
  { phaseKey: "basic_design", phaseName: "基本設計", phaseSortOrder: 2, taskName: "DB設計", taskSortOrder: 2, baseManMonths: 0.5 },
  { phaseKey: "basic_design", phaseName: "基本設計", phaseSortOrder: 2, taskName: "API設計", taskSortOrder: 3, baseManMonths: 0.5 },
  { phaseKey: "basic_design", phaseName: "基本設計", phaseSortOrder: 2, taskName: "画面設計（ワイヤーフレーム）", taskSortOrder: 4, baseManMonths: 1.0 },

  // 詳細設計
  { phaseKey: "detailed_design", phaseName: "詳細設計", phaseSortOrder: 3, taskName: "詳細設計書作成", taskSortOrder: 1, baseManMonths: 1.0 },
  { phaseKey: "detailed_design", phaseName: "詳細設計", phaseSortOrder: 3, taskName: "テスト仕様書作成", taskSortOrder: 2, baseManMonths: 0.5 },

  // 実装
  { phaseKey: "implementation", phaseName: "実装", phaseSortOrder: 4, taskName: "フロントエンド実装", taskSortOrder: 1, baseManMonths: 2.0 },
  { phaseKey: "implementation", phaseName: "実装", phaseSortOrder: 4, taskName: "バックエンド実装", taskSortOrder: 2, baseManMonths: 2.0 },
  { phaseKey: "implementation", phaseName: "実装", phaseSortOrder: 4, taskName: "DB構築・マイグレーション", taskSortOrder: 3, baseManMonths: 0.3 },
  { phaseKey: "implementation", phaseName: "実装", phaseSortOrder: 4, taskName: "外部連携実装", taskSortOrder: 4, baseManMonths: 0.5 },

  // テスト
  { phaseKey: "testing", phaseName: "テスト", phaseSortOrder: 5, taskName: "単体テスト", taskSortOrder: 1, baseManMonths: 1.0 },
  { phaseKey: "testing", phaseName: "テスト", phaseSortOrder: 5, taskName: "結合テスト", taskSortOrder: 2, baseManMonths: 0.5 },
  { phaseKey: "testing", phaseName: "テスト", phaseSortOrder: 5, taskName: "総合テスト", taskSortOrder: 3, baseManMonths: 0.5 },
  { phaseKey: "testing", phaseName: "テスト", phaseSortOrder: 5, taskName: "UAT支援", taskSortOrder: 4, baseManMonths: 0.3 },

  // 運用保守
  { phaseKey: "maintenance", phaseName: "運用保守", phaseSortOrder: 6, taskName: "デプロイ・環境構築", taskSortOrder: 1, baseManMonths: 0.3 },
  { phaseKey: "maintenance", phaseName: "運用保守", phaseSortOrder: 6, taskName: "運用マニュアル作成", taskSortOrder: 2, baseManMonths: 0.3 },
  { phaseKey: "maintenance", phaseName: "運用保守", phaseSortOrder: 6, taskName: "保守契約（月額）", taskSortOrder: 3, baseManMonths: 0.5 },
];
