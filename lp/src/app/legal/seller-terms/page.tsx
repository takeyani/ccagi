import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "出店規約 | Cross Infinity",
};

export default function SellerTermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <nav className="mb-8 flex gap-4">
          <Link href="/" className="text-sm text-orange-600 hover:text-orange-800">&larr; トップページ</Link>
          <Link href="/legal" className="text-sm text-orange-600 hover:text-orange-800">特定商取引法</Link>
        </nav>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">出店規約</h1>
        <p className="text-sm text-gray-500 mb-8">Cross Infinity マーケットプレイス 出店者向け利用規約</p>

        <div className="space-y-8 text-sm text-gray-700 leading-relaxed">

          {/* 第1条 */}
          <section className="bg-white rounded-2xl border shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">第1条（目的）</h2>
            <p>本規約は、Cross Infinity株式会社（以下「当社」）が運営するマーケットプレイスプラットフォーム「Cross Infinity」（以下「本サービス」）における出店者（以下「パートナー」）の利用条件を定めるものです。パートナーは本規約に同意のうえ、本サービスを利用するものとします。</p>
          </section>

          {/* 第2条 */}
          <section className="bg-white rounded-2xl border shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">第2条（定義）</h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li><strong>「パートナー」</strong>とは、本サービスに出店登録を行い、商品の販売を行う法人または個人事業主をいいます。</li>
              <li><strong>「メーカー」</strong>とは、自社製造または仕入れた商品を直接出品するパートナーをいいます。</li>
              <li><strong>「販売代理店」</strong>とは、メーカーの承認を得て商品を販売するパートナーをいいます。</li>
              <li><strong>「クリエイター」</strong>とは、アフィリエイトプログラムに登録し、LP（ランディングページ）を作成して商品を紹介・販売するユーザーをいいます。</li>
              <li><strong>「バイヤー」</strong>とは、本サービスを通じて商品を購入するユーザーをいいます。</li>
              <li><strong>「商品」</strong>とは、パートナーが本サービスに出品する有形・無形の財をいいます。</li>
              <li><strong>「プルーフチェーン」</strong>とは、本サービスが提供する5層の証明・認証システムをいいます。</li>
            </ol>
          </section>

          {/* 第3条 */}
          <section className="bg-white rounded-2xl border shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">第3条（出店登録）</h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li>出店を希望する者は、当社所定の方法により出店登録を申請するものとします。</li>
              <li>当社は、出店登録の申請を審査し、承認または不承認を決定できるものとします。</li>
              <li>パートナーは、登録情報に変更が生じた場合、速やかに当社に届け出るものとします。</li>
              <li>以下に該当する場合、当社は出店登録を拒否または取り消すことができます。
                <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-600">
                  <li>虚偽の情報を登録した場合</li>
                  <li>過去に本規約に違反したことがある場合</li>
                  <li>反社会的勢力に該当する場合</li>
                  <li>その他、当社が不適切と判断した場合</li>
                </ul>
              </li>
            </ol>
          </section>

          {/* 第4条 */}
          <section className="bg-white rounded-2xl border shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">第4条（手数料）</h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li>本サービスの利用にあたり、初期費用および月額固定費用は発生しません。</li>
              <li>商品の販売が成立した場合、当社は販売価格に対して以下の手数料を徴収します。
                <table className="mt-2 w-full border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border px-3 py-2 text-left">項目</th>
                      <th className="border px-3 py-2 text-left">料率</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td className="border px-3 py-2">プラットフォーム手数料</td><td className="border px-3 py-2">売上の12%（カテゴリにより変動あり）</td></tr>
                    <tr><td className="border px-3 py-2">決済手数料</td><td className="border px-3 py-2">Stripe決済手数料（3.6%）はプラットフォーム手数料に含む</td></tr>
                    <tr><td className="border px-3 py-2">振込手数料</td><td className="border px-3 py-2">Stripe Connect による自動送金（Stripe規定による）</td></tr>
                  </tbody>
                </table>
              </li>
              <li>手数料率は、当社が合理的な理由に基づき変更することができます。変更の場合は30日前までに通知します。</li>
            </ol>
          </section>

          {/* 第5条 */}
          <section className="bg-white rounded-2xl border shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">第5条（出品禁止商品）</h2>
            <p className="mb-3">以下に該当する商品の出品を禁止します。違反が確認された場合、予告なく商品の削除およびアカウントの停止を行います。</p>
            <ol className="list-decimal pl-5 space-y-2">
              <li><strong>免許・許可が必要な商品</strong>
                <ul className="list-disc pl-5 mt-1 space-y-1 text-gray-600">
                  <li>古物（古物営業法に基づく許可が必要なもの）</li>
                  <li>酒類（酒税法に基づく免許が必要なもの）</li>
                  <li>たばこ（たばこ事業法に基づく許可が必要なもの）</li>
                  <li>医薬品・医療機器（薬機法に基づく許可が必要なもの）</li>
                  <li>銃砲刀剣類（銃刀法に基づく許可が必要なもの）</li>
                </ul>
              </li>
              <li><strong>法令に違反する商品</strong> — 違法薬物、偽ブランド品、盗品、児童ポルノ等</li>
              <li><strong>第三者の権利を侵害する商品</strong> — 著作権・商標権・特許権等の知的財産権を侵害するもの</li>
              <li><strong>安全性に問題がある商品</strong> — リコール対象品、安全基準を満たさないもの</li>
              <li><strong>公序良俗に反する商品</strong> — 当社が不適切と判断したもの</li>
              <li><strong>その他</strong> — 当社が別途定める出品ガイドラインに違反するもの</li>
            </ol>
          </section>

          {/* 第6条 */}
          <section className="bg-white rounded-2xl border shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">第6条（商品情報の正確性）</h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li>パートナーは、出品する商品の情報（商品名、説明、画像、価格、在庫数、成分、アレルゲン情報等）を正確かつ最新の状態に保つものとします。</li>
              <li>パートナーは、景品表示法に基づき、優良誤認表示・有利誤認表示を行ってはなりません。</li>
              <li>食品の場合、食品表示法に基づく表示（原材料名、アレルゲン、栄養成分、賞味期限等）を適切に行うものとします。</li>
              <li>商品画像は実際の商品を正確に反映するものとし、過度な加工や異なる商品の画像を使用してはなりません。</li>
            </ol>
          </section>

          {/* 第7条 */}
          <section className="bg-white rounded-2xl border shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">第7条（注文の成立と履行）</h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li>バイヤーが決済を完了した時点で売買契約が成立します。</li>
              <li>パートナーは、注文を受けた商品を、商品ページに記載された期間内に発送するものとします。</li>
              <li>在庫切れ等により注文を履行できない場合、速やかにバイヤーに連絡し、キャンセル処理を行うものとします。</li>
              <li>正当な理由なく注文のキャンセルまたは発送遅延を繰り返した場合、当社はアカウントの制限または停止を行うことができます。</li>
            </ol>
          </section>

          {/* 第8条 */}
          <section className="bg-white rounded-2xl border shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">第8条（売上金の支払い）</h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li>売上金は、プラットフォーム手数料を差し引いた金額が、Stripe Connect を通じてパートナーの登録口座に送金されます。</li>
              <li>送金のタイミングはStripeの規定に準じます（通常、決済完了後2〜7営業日）。</li>
              <li>パートナーはStripe Connectアカウントの開設・維持に関する責任を負うものとします。</li>
              <li>返品・返金が発生した場合、当該金額は次回の送金から差し引かれます。</li>
            </ol>
          </section>

          {/* 第9条 */}
          <section className="bg-white rounded-2xl border shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">第9条（返品・返金）</h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li>パートナーは、商品の品質に対して責任を負い、不良品の場合は返品・交換に応じるものとします。</li>
              <li>返品期間は商品到着後7日以内とします。ただし、食品等の性質上返品が困難な商品については、別途条件を定めることができます。</li>
              <li>バイヤー都合の返品にかかる送料はバイヤー負担とし、商品の瑕疵による返品の送料はパートナー負担とします。</li>
            </ol>
          </section>

          {/* 第10条 */}
          <section className="bg-white rounded-2xl border shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">第10条（知的財産権）</h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li>パートナーは、出品する商品およびその情報（画像、説明文等）について、第三者の知的財産権を侵害していないことを保証するものとします。</li>
              <li>当社は、パートナーが提供した商品情報を、本サービスの運営に必要な範囲で利用（表示、複製、編集等）できるものとします。</li>
              <li>知的財産権の侵害が報告された場合、当社は調査のうえ、該当商品の非公開措置をとることができます。</li>
            </ol>
          </section>

          {/* 第11条 */}
          <section className="bg-white rounded-2xl border shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">第11条（プルーフチェーン）</h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li>パートナーは、当社が定めるプルーフチェーン（5層証明システム）の認証手続きに協力するものとします。</li>
              <li>プルーフチェーンの各層は以下のとおりです。
                <ul className="list-disc pl-5 mt-1 space-y-1 text-gray-600">
                  <li>L1: 主体証明（事業者としての実在性証明）</li>
                  <li>L2: 商品証明（商品の品質・成分・規格の証明）</li>
                  <li>L3: 在庫証明（在庫の実在性と状態の証明）</li>
                  <li>L4: 所有権証明（取引履歴と所有権の証明）</li>
                  <li>L5: 配送証明（配送・受領の証明）</li>
                </ul>
              </li>
              <li>プルーフチェーンの認証レベルは、購買エージェントのスコアリングに影響します。</li>
            </ol>
          </section>

          {/* 第12条 */}
          <section className="bg-white rounded-2xl border shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">第12条（禁止行為）</h2>
            <p className="mb-3">パートナーは、以下の行為を行ってはなりません。</p>
            <ol className="list-decimal pl-5 space-y-2">
              <li>虚偽の情報を登録・掲載する行為</li>
              <li>本サービスの運営を妨害する行為</li>
              <li>他のパートナーまたはバイヤーに対する誹謗中傷・嫌がらせ行為</li>
              <li>本サービスを介さない直接取引の誘導（いわゆる「横流し」）</li>
              <li>不正なアクセスまたはシステムの脆弱性を悪用する行為</li>
              <li>マネーロンダリングその他の違法行為</li>
              <li>複数アカウントの不正取得・利用</li>
              <li>本サービスの信用を毀損する行為</li>
            </ol>
          </section>

          {/* 第12条の2 */}
          <section className="bg-red-50 rounded-2xl border border-red-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-red-900 mb-3">第12条の2（不正利用対策・リスク管理）</h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li><strong>カード不正利用の防止</strong>
                <ul className="list-disc pl-5 mt-1 space-y-1 text-gray-600">
                  <li>1回の注文上限は¥500,000とします。</li>
                  <li>¥100,000以上の注文は、当社が確認するまで決済を保留（手動キャプチャ）します。</li>
                  <li>3Dセキュア認証およびStripe Radarによる不正検知を実施します。</li>
                  <li>不正取引が疑われる場合、当社は注文の取消・返金を行うことができます。</li>
                </ul>
              </li>
              <li><strong>高額商品の出品に関する義務</strong>
                <ul className="list-disc pl-5 mt-1 space-y-1 text-gray-600">
                  <li>¥100,000以上の商品を出品する場合、パートナーは事前に当社の審査を受けるものとします。</li>
                  <li>高額商品には追加のプルーフチェーン認証（L2商品証明以上）を必須とします。</li>
                  <li>パートナーは、不正購入による損害リスクを認識し、適切な在庫管理・出荷前確認を行うものとします。</li>
                </ul>
              </li>
              <li><strong>チャージバック・不正返金に関する責任</strong>
                <ul className="list-disc pl-5 mt-1 space-y-1 text-gray-600">
                  <li>カード不正利用によるチャージバックが発生した場合、出荷前であれば当社が注文を取消します。</li>
                  <li>出荷後のチャージバックについて、当社は調査に協力しますが、商品の回収費用はパートナーと協議のうえ決定します。</li>
                  <li>パートナーが出荷前確認義務を怠った場合、チャージバックによる損害はパートナーが負担するものとします。</li>
                </ul>
              </li>
              <li><strong>異常検知・モニタリング</strong>
                <ul className="list-disc pl-5 mt-1 space-y-1 text-gray-600">
                  <li>当社は、異常な注文パターン（短時間での大量注文、同一カードによる複数注文等）を自動検知します。</li>
                  <li>異常が検知された場合、当社は注文の保留・取消・アカウントの一時停止を行うことができます。</li>
                  <li>パートナーは、不審な注文に気づいた場合、速やかに当社に報告するものとします。</li>
                </ul>
              </li>
              <li><strong>リスク承諾</strong>
                <ul className="list-disc pl-5 mt-1 space-y-1 text-gray-600">
                  <li>パートナーは、オンライン取引に伴うカード不正利用のリスクを認識し、本規約に定めるリスク管理措置に同意するものとします。</li>
                  <li>当社が本条に基づき注文の保留・取消を行った場合、パートナーは当社に対して損害賠償を請求できないものとします。</li>
                </ul>
              </li>
            </ol>
          </section>

          {/* 第12条の3 */}
          <section className="bg-red-50 rounded-2xl border border-red-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-red-900 mb-3">第12条の3（各ロール別 不正行為防止規定）</h2>

            <h3 className="font-bold text-gray-900 mt-4 mb-2">（1）メーカーに対する規定</h3>
            <ol className="list-decimal pl-5 space-y-1 text-sm">
              <li>架空商品・実在しない商品の出品を禁止します。プルーフチェーン（L2商品証明・L3在庫証明）による実在性の証明を求めることがあります。</li>
              <li>商品価格の不正操作（極端な高額設定による不正決済の誘発等）を禁止します。商品価格の上限は¥500,000です。</li>
              <li>自社商品を自己購入し、アフィリエイト報酬を不正取得する行為（自己アフィリエイト）を禁止します。</li>
              <li>意図的に品質の低い商品を出品し、返品・チャージバックを誘発する行為を禁止します。</li>
              <li>複数アカウントを作成し、同一商品を異なる価格で出品する行為を禁止します。</li>
            </ol>

            <h3 className="font-bold text-gray-900 mt-4 mb-2">（2）購入者（バイヤー）に対する規定</h3>
            <ol className="list-decimal pl-5 space-y-1 text-sm">
              <li>盗難カード・他人名義のカードによる購入を禁止します。3Dセキュア認証およびStripe Radarによる不正検知を実施します。</li>
              <li>1回の注文上限は¥500,000、¥100,000以上の注文は管理者による手動承認が必要です。</li>
              <li>短時間での大量注文、同一カードによる複数注文等の異常パターンを自動検知し、注文を保留・取消する場合があります。</li>
              <li>商品受領後に虚偽の理由でチャージバックを申請する行為を禁止します。</li>
              <li>転売目的での大量購入が疑われる場合、当社は注文数量を制限する場合があります。</li>
              <li>不正行為が確認された場合、アカウントの永久停止および法的措置をとる場合があります。</li>
            </ol>

            <h3 className="font-bold text-gray-900 mt-4 mb-2">（3）クリエイターに対する規定</h3>
            <ol className="list-decimal pl-5 space-y-1 text-sm">
              <li>虚偽・誇大な表現によるLP（ランディングページ）の作成を禁止します。薬機法・景品表示法に違反する表現は自動チェックの対象です。</li>
              <li>メーカーの許可なく商品を販売する行為を禁止します。商品承認（Authorization）が未取得の商品のLP作成は無効です。</li>
              <li>自己クリック・自己購入によるアフィリエイト報酬の不正取得を禁止します。</li>
              <li>他のクリエイターのLPデザイン・コンテンツを無断でコピーする行為を禁止します。</li>
              <li>クリエイターコード・アカウントの第三者への譲渡・貸与を禁止します。</li>
              <li>不正行為が確認された場合、報酬の没収およびアカウントの永久停止を行います。</li>
            </ol>

            <h3 className="font-bold text-gray-900 mt-4 mb-2">（4）販売代理店に対する規定</h3>
            <ol className="list-decimal pl-5 space-y-1 text-sm">
              <li>メーカーの承認なく商品を販売する行為を禁止します。商品承認の偽造・改ざんは即時アカウント停止の対象です。</li>
              <li>メーカーが設定した販売価格の上限・下限を逸脱する価格設定を禁止します。</li>
              <li>本サービスを介さず、取得した顧客情報を使って直接取引を行う行為（横流し）を禁止します。</li>
              <li>架空の在庫を登録し、注文を受けてからメーカーに発注する無在庫販売を禁止します（ドロップシッピングは別途契約が必要）。</li>
              <li>複数の代理店アカウントを使い分けて価格競争を操作する行為を禁止します。</li>
              <li>不正行為が確認された場合、売上金の凍結およびアカウントの永久停止を行います。</li>
            </ol>

            <p className="text-xs text-red-600 mt-4">
              ※ 上記の不正行為が確認された場合、当社は事前の催告なくアカウントの停止・売上金の凍結・法的措置を行う権利を有します。
            </p>
          </section>

          {/* 第13条 */}
          <section className="bg-white rounded-2xl border shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">第13条（アカウントの停止・解除）</h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li>当社は、パートナーが本規約に違反した場合、事前の催告なくアカウントの一時停止または永久停止を行うことができます。</li>
              <li>アカウント停止時に未送金の売上金がある場合、違約金および損害賠償金を差し引いたうえで、残額をパートナーに送金します。</li>
              <li>パートナーは、30日前までに当社に通知することにより、いつでも退店することができます。</li>
              <li>退店後も、既に成立した注文に対する履行義務および本規約に基づく責任は存続するものとします。</li>
            </ol>
          </section>

          {/* 第14条 */}
          <section className="bg-white rounded-2xl border shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">第14条（免責事項）</h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li>当社は、本サービスの提供に関して、その完全性、正確性、安全性、適用性等について一切保証しません。</li>
              <li>当社は、天災、通信障害、システム障害等の不可抗力により生じた損害について責任を負いません。</li>
              <li>パートナーとバイヤー間の紛争は、当事者間で解決するものとし、当社は仲介義務を負いません。ただし、当社は必要に応じて調停に協力することがあります。</li>
            </ol>
          </section>

          {/* 第15条 */}
          <section className="bg-white rounded-2xl border shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">第15条（秘密保持）</h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li>パートナーは、本サービスの利用を通じて知り得た当社の非公開情報および他のパートナー・バイヤーの個人情報を、第三者に開示・漏洩してはなりません。</li>
              <li>本条の義務は、退店後も3年間存続するものとします。</li>
            </ol>
          </section>

          {/* 第16条 */}
          <section className="bg-white rounded-2xl border shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">第16条（規約の変更）</h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li>当社は、法令の改正、社会情勢の変化、その他合理的な理由がある場合、本規約を変更できるものとします。</li>
              <li>変更後の規約は、当社が定める方法により通知した時点から効力を生じるものとします。重要な変更の場合は30日前までに通知します。</li>
              <li>変更後も本サービスの利用を継続した場合、パートナーは変更後の規約に同意したものとみなします。</li>
            </ol>
          </section>

          {/* 第17条 */}
          <section className="bg-white rounded-2xl border shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">第17条（準拠法・管轄裁判所）</h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li>本規約は、日本法に準拠し、日本法に従って解釈されるものとします。</li>
              <li>本規約に関する紛争については、東京地方裁判所を第一審の専属的合意管轄裁判所とします。</li>
            </ol>
          </section>

          {/* 附則 */}
          <section className="bg-gray-50 rounded-2xl border shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">附則</h2>
            <ul className="space-y-2 text-gray-600">
              <li>本規約は、2026年4月14日より施行します。</li>
              <li>本サービスは現在実証実験中であり、サービス内容が予告なく変更される場合があります。</li>
              <li>決済機能はテストモードで運用されています。実際の課金は発生しません。</li>
            </ul>
          </section>

        </div>

        <p className="mt-8 text-xs text-gray-400 text-center mb-8">
          最終更新日: 2026年4月14日
        </p>
      </div>
    </div>
  );
}
