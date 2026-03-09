import {
  SCALE_OPTIONS,
  COMPLEXITY_OPTIONS,
  DEADLINE_OPTIONS,
  PLATFORM_OPTIONS,
  ADDITIONAL_FEATURES,
  DEFAULT_UNIT_PRICE,
  DEFAULT_DISCOUNT_RATE,
  type EstimateConditions,
} from "./constants";
import { PHASE_TEMPLATES, type TaskTemplate } from "./templates";

export interface EstimateItem {
  phaseKey: string;
  phaseName: string;
  phaseSortOrder: number;
  taskName: string;
  taskSortOrder: number;
  baseManMonths: number;
  multiplier: number;
  adjustedManMonths: number;
  unitPrice: number;
  amount: number;
  isIncluded: boolean;
}

export interface EstimateResult {
  items: EstimateItem[];
  totalManMonths: number;
  subtotal: number;
  discountRate: number;
  discountAmount: number;
  total: number;
}

function getMultiplierValue(
  options: readonly { key: string; multiplier: number }[],
  key: string
): number {
  return options.find((o) => o.key === key)?.multiplier ?? 1.0;
}

function computeBaseMultiplier(conditions: EstimateConditions): number {
  const scale = getMultiplierValue(SCALE_OPTIONS, conditions.scale);
  const complexity = getMultiplierValue(COMPLEXITY_OPTIONS, conditions.complexity);
  const deadline = getMultiplierValue(DEADLINE_OPTIONS, conditions.deadline);
  const platform = getMultiplierValue(PLATFORM_OPTIONS, conditions.platform);
  return scale * complexity * deadline * platform;
}

function computeFeatureAdditions(features: string[]): {
  design: number;
  implementation: number;
  test: number;
} {
  let design = 0;
  let implementation = 0;
  let test = 0;

  for (const featureKey of features) {
    const feature = ADDITIONAL_FEATURES.find((f) => f.key === featureKey);
    if (feature) {
      design += feature.design;
      implementation += feature.implementation;
      test += feature.test;
    }
  }

  return { design, implementation, test };
}

// Map phase keys to feature addition categories
function getFeatureAdditionForPhase(
  phaseKey: string,
  additions: { design: number; implementation: number; test: number }
): number {
  switch (phaseKey) {
    case "basic_design":
    case "detailed_design":
      return additions.design;
    case "implementation":
      return additions.implementation;
    case "testing":
      return additions.test;
    default:
      return 0;
  }
}

export function calculateEstimate(
  conditions: EstimateConditions,
  unitPrice: number = DEFAULT_UNIT_PRICE,
  discountRate: number = DEFAULT_DISCOUNT_RATE
): EstimateResult {
  const baseMultiplier = computeBaseMultiplier(conditions);
  const featureAdditions = computeFeatureAdditions(conditions.features);

  // Calculate additions per phase (distributed across tasks in that phase)
  const phaseTaskCounts: Record<string, number> = {};
  for (const t of PHASE_TEMPLATES) {
    phaseTaskCounts[t.phaseKey] = (phaseTaskCounts[t.phaseKey] || 0) + 1;
  }

  const items: EstimateItem[] = PHASE_TEMPLATES.map((template: TaskTemplate) => {
    const phaseAddition = getFeatureAdditionForPhase(template.phaseKey, featureAdditions);
    // Distribute feature additions evenly across tasks in the phase
    const taskAddition = phaseAddition / (phaseTaskCounts[template.phaseKey] || 1);
    const adjustedBase = template.baseManMonths + taskAddition;
    const adjustedManMonths = Math.round(adjustedBase * baseMultiplier * 100) / 100;
    const amount = Math.round(adjustedManMonths * unitPrice);

    return {
      phaseKey: template.phaseKey,
      phaseName: template.phaseName,
      phaseSortOrder: template.phaseSortOrder,
      taskName: template.taskName,
      taskSortOrder: template.taskSortOrder,
      baseManMonths: template.baseManMonths,
      multiplier: Math.round(baseMultiplier * 1000) / 1000,
      adjustedManMonths,
      unitPrice,
      amount,
      isIncluded: true,
    };
  });

  const includedItems = items.filter((i) => i.isIncluded);
  const totalManMonths = includedItems.reduce((sum, i) => sum + i.adjustedManMonths, 0);
  const subtotal = includedItems.reduce((sum, i) => sum + i.amount, 0);
  const discountAmount = Math.round(subtotal * (discountRate / 100));
  const total = subtotal - discountAmount;

  return {
    items,
    totalManMonths: Math.round(totalManMonths * 100) / 100,
    subtotal,
    discountRate,
    discountAmount,
    total,
  };
}

export function recalculateTotals(
  items: EstimateItem[],
  discountRate: number
): Pick<EstimateResult, "totalManMonths" | "subtotal" | "discountAmount" | "total"> {
  const includedItems = items.filter((i) => i.isIncluded);
  const totalManMonths = includedItems.reduce((sum, i) => sum + i.adjustedManMonths, 0);
  const subtotal = includedItems.reduce((sum, i) => sum + i.amount, 0);
  const discountAmount = Math.round(subtotal * (discountRate / 100));
  const total = subtotal - discountAmount;

  return {
    totalManMonths: Math.round(totalManMonths * 100) / 100,
    subtotal,
    discountAmount,
    total,
  };
}

export function generateEstimateNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const seq = String(Math.floor(Math.random() * 9999) + 1).padStart(4, "0");
  return `EST-${year}-${seq}`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("ja-JP").format(amount);
}
