import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "特定商取引法に基づく表記 | Cross Infinity",
};

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <nav className="mb-8">
          <Link href="/" className="text-sm text-orange-600 hover:text-orange-800">&larr; トップページに戻る</Link>
        </nav>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">特定商取引法に基づく表記</h1>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <tbody>
              {[
                ["販売業者", "株式会社XXXカンパニー"],
                ["代表責任者", "山田 太郎"],
                ["所在地", "〒100-0001 東京都千代田区千代田1-1-1 XXXビル 5F"],
                ["電話番号", "03-XXXX-XXXX（平日 10:00〜18:00）"],
                ["メールアドレス", "info@example.com"],
                ["URL", "https://lot-lp.vercel.app"],
                ["販売価格", "各商品ページに記載の価格（税抜表示）"],
                ["商品代金以外の必要料金", "消費税、振込手数料（お客様負担）、送料（別途表示）"],
                ["支払方法", "クレジットカード決済（Stripe）"],
                ["支払時期", "注文確定時に即時決済"],
                ["商品の引き渡し時期", "決済完了後、出荷準備完了次第発送（通常3〜7営業日）"],
                ["返品・交換について", "商品到着後7日以内に限り、未開封・未使用の場合のみ返品を受け付けます。不良品の場合は送料当社負担にて交換いたします。"],
                ["返品送料", "お客様都合の場合：お客様負担 / 不良品の場合：当社負担"],
                ["動作環境", "本サービスはWebブラウザ上で動作します。推奨環境：Chrome、Safari、Firefox、Edge の最新版"],
                ["サービス利用料", "初期費用 0円 / 月額費用 0円 / 成果報酬 12%（売上発生時のみ）"],
              ].map(([label, value]) => (
                <tr key={label} className="border-b last:border-0">
                  <th className="text-left px-6 py-4 bg-gray-50 font-medium text-gray-700 w-1/3 align-top">{label}</th>
                  <td className="px-6 py-4 text-gray-600">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 業種別特記事項 */}
        <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">業種別特記事項</h2>

        <div className="space-y-6">
          {/* 健康食品・化粧品 */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-3">健康食品・化粧品の取扱いについて</h3>
            <ul className="text-sm text-gray-600 space-y-2 list-disc pl-5">
              <li>医薬品医療機器等法（薬機法）に基づき、効能効果に関する虚偽・誇大な表現は行いません</li>
              <li>食品表示法に基づき、原材料名・アレルゲン（特定原材料28品目）・栄養成分を適切に表示します</li>
              <li>健康増進法に基づき、虚偽または誇大な栄養・健康効果の表示を行いません</li>
              <li>機能性表示食品については、消費者庁届出番号を商品ページに記載します</li>
              <li>化粧品の全成分表示は、薬機法の規定に従い商品ページおよびラベルに記載します</li>
            </ul>
          </div>

          {/* 取扱禁止商品 */}
          <div className="bg-red-50 rounded-2xl border border-red-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-red-800 mb-3">取扱禁止商品</h3>
            <p className="text-sm text-red-700 mb-3">以下に該当する商品は、免許・許可の確認が困難なため、当プラットフォームでの取扱いを禁止しています。</p>
            <ul className="text-sm text-red-700 space-y-2 list-disc pl-5">
              <li><span className="font-bold">古物</span>（古物営業法） — 中古品・リユース品の売買。古物商許可証が必要</li>
              <li><span className="font-bold">酒類</span>（酒税法） — 酒類販売業免許が必要</li>
              <li><span className="font-bold">たばこ</span>（たばこ事業法） — たばこ小売販売業の許可が必要</li>
              <li><span className="font-bold">医薬品・医療機器</span>（薬機法） — 販売業の許可・届出が必要</li>
              <li><span className="font-bold">銃砲刀剣類</span>（銃刀法） — 所持許可・販売許可が必要</li>
              <li><span className="font-bold">その他</span> — 法令で免許・許可・届出が必要な全ての商品</li>
            </ul>
            <p className="text-xs text-red-600 mt-3">
              上記カテゴリの商品を登録した場合、予告なくアカウントを停止する場合があります。
              免許確認の仕組みが整い次第、段階的に取扱いを開始する予定です。
            </p>
          </div>

          {/* 食品全般 */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-3">食品の取扱いについて</h3>
            <ul className="text-sm text-gray-600 space-y-2 list-disc pl-5">
              <li>食品衛生法に基づく営業許可を取得した事業者の商品のみ取り扱います</li>
              <li>賞味期限・消費期限は商品ページおよび商品ラベルに明記します</li>
              <li>要冷蔵・冷凍商品は適切な温度管理の下で配送します</li>
              <li>HACCP対応の衛生管理記録をプルーフチェーンに含めます</li>
            </ul>
          </div>

          {/* オークション・中古品 */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-3">オークション・中古品の取扱いについて</h3>
            <ul className="text-sm text-gray-600 space-y-2 list-disc pl-5">
              <li>古物営業法に基づく古物商許可番号：第○○○号（○○公安委員会）</li>
              <li>中古品の売買には本人確認（身分証明書の提示）が必要です</li>
              <li>取引記録は古物営業法に基づき3年間保存します</li>
              <li>盗品等の疑いがある場合は直ちに警察へ届出を行います</li>
            </ul>
          </div>

          {/* 酒類 */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-3">酒類の取扱いについて</h3>
            <ul className="text-sm text-gray-600 space-y-2 list-disc pl-5">
              <li>酒類販売業免許に基づき販売を行います</li>
              <li>20歳未満への酒類の販売は法律で禁止されています</li>
              <li>ご購入時に年齢確認を実施します</li>
            </ul>
          </div>

          {/* 越境EC */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-3">越境EC（海外取引）について</h3>
            <ul className="text-sm text-gray-600 space-y-2 list-disc pl-5">
              <li>輸出入に関する法令（外為法・関税法等）を遵守します</li>
              <li>関税・消費税等の諸費用はお客様のご負担となります</li>
              <li>ワシントン条約等により輸出入が制限される商品は取り扱いません</li>
              <li>輸出先国の消費者保護法に準拠した表示を行います</li>
            </ul>
          </div>
        </div>

        {/* 景品表示法 */}
        <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">景品表示法に関するポリシー</h2>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <ul className="text-sm text-gray-600 space-y-2 list-disc pl-5">
            <li>商品の品質・規格その他の内容について、実際のものより著しく優良であると示す「優良誤認表示」は行いません</li>
            <li>商品の価格その他の取引条件について、実際のものより著しく有利であると示す「有利誤認表示」は行いません</li>
            <li>二重価格表示を行う場合は、比較対照価格の根拠（メーカー希望小売価格・当社通常販売価格等）を明示します</li>
            <li>「No.1」「最安値」等の最上級表現を使用する場合は、客観的な調査データに基づく根拠を明示します</li>
            <li>クリエイターLP内の表現については、AI薬機法チェック機能により自動審査を行います</li>
          </ul>
        </div>

        {/* 電子メール */}
        <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">特定電子メール法への対応</h2>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <ul className="text-sm text-gray-600 space-y-2 list-disc pl-5">
            <li>広告・宣伝メール（ステップメール含む）は、事前にオプトイン（同意）を得た方にのみ配信します</li>
            <li>すべてのメールに配信停止（オプトアウト）リンクを設置します</li>
            <li>送信者の氏名・名称、連絡先を全メールに記載します</li>
            <li>配信停止の申出には速やかに（遅くとも受付から3営業日以内に）対応します</li>
          </ul>
        </div>

        {/* インボイス制度 */}
        <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">インボイス制度への対応</h2>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <ul className="text-sm text-gray-600 space-y-2 list-disc pl-5">
            <li>適格請求書発行事業者登録番号：T○○○○○○○○○○○○○</li>
            <li>BtoB取引の帳票（見積書・請求書・納品書）はインボイス記載要件を満たしています</li>
            <li>税率ごとの消費税額を明記します</li>
          </ul>
        </div>

        <p className="mt-8 text-xs text-gray-400 text-center">
          ※ 上記は表示例です。実際の運営情報は正式な事業者情報に置き換えてください。
        </p>
        <p className="mt-2 text-xs text-gray-400 text-center mb-8">
          最終更新日: 2026年3月27日
        </p>
      </div>
    </div>
  );
}
