type Props = {
  restrictionType: "alcohol" | "tobacco" | null | undefined;
};

export default function AgeRestrictionBadge({ restrictionType }: Props) {
  if (!restrictionType) return null;
  const label = restrictionType === "tobacco" ? "たばこ" : "酒類";
  return (
    <div className="mt-3 rounded-lg border border-amber-300 bg-amber-50 p-3">
      <p className="text-sm font-semibold text-amber-900">
        ⚠ {label}は20歳以上の方のみ購入可能です
      </p>
      <p className="mt-1 text-xs text-amber-800 leading-relaxed">
        ご購入手続きの前に、生年月日による年齢確認が必要となります。
      </p>
    </div>
  );
}
