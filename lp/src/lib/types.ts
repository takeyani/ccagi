export type Partner = {
  id: string;
  company_name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  postal_code: string | null;
  address: string | null;
  contract_start_date: string | null;
  payment_terms: string | null;
  memo: string | null;
  partner_type: "メーカー" | "代理店";
  parent_partner_id: string | null;
  certification_number: string | null;
  certification_document_url: string | null;
  certification_status: "未認証" | "認証済み" | "期限切れ";
  certification_expiry: string | null;
  certified_at: string | null;
  invoice_registration_number: string | null;
  invoice_registration_date: string | null;
  created_at: string;
};

export type Product = {
  id: string;
  partner_id: string | null;
  name: string;
  master_name: string | null;
  description: string | null;
  category1: string | null;
  category2: string | null;
  category3: string | null;
  image_url: string | null;
  image_url2: string | null;
  image_url3: string | null;
  image_url4: string | null;
  image_url5: string | null;
  jan_code: string | null;
  product_code: string | null;
  country_of_origin: string | null;
  base_price: number;
  carton_quantity: number | null;
  width_mm: number | null;
  depth_mm: number | null;
  height_mm: number | null;
  net_weight_kg: number | null;
  gross_weight_kg: number | null;
  material: string | null;
  product_page_url: string | null;
  notes: string | null;
  is_new_or_renewal: boolean;
  stripe_price_id: string | null;
  slug: string;
  is_active: boolean;
  min_order_quantity: number | null;
  min_order_amount: number | null;
  order_notes: string | null;
  created_at: string;
  updated_at: string;
};

// カテゴリー別フィールド定義
export type CategoryFieldConfig = {
  field: string;
  label: string;
  required: boolean;
  type: "text" | "date" | "number" | "select" | "boolean";
  options?: string[];
};

export type CategoryTemplate = {
  id: string;
  name: string;
  description: string;
  commission_rate: number;
  referral_rate: number;
  platform_rate: number;
  product_fields: CategoryFieldConfig[];
  lot_fields: CategoryFieldConfig[];
};

// プリセットカテゴリー
export const CATEGORY_TEMPLATES: Record<string, CategoryTemplate> = {
  food: {
    id: "food",
    name: "食品・飲料",
    description: "賞味期限・アレルギー情報など食品固有の項目",
    commission_rate: 12,
    referral_rate: 2,
    platform_rate: 10,
    product_fields: [
      { field: "allergens", label: "アレルギー表示", required: true, type: "text" },
      { field: "ingredients", label: "原材料", required: true, type: "text" },
      { field: "nutrition_facts", label: "栄養成分表示", required: false, type: "text" },
      { field: "storage_method", label: "保存方法", required: true, type: "text" },
      { field: "country_of_origin", label: "原産国", required: true, type: "text" },
      { field: "jan_code", label: "JANコード", required: false, type: "text" },
    ],
    lot_fields: [
      { field: "expiration_date", label: "賞味期限", required: true, type: "date" },
      { field: "manufacture_date", label: "製造日", required: false, type: "date" },
      { field: "storage_temperature", label: "保管温度帯", required: true, type: "select", options: ["常温", "冷蔵", "冷凍"] },
    ],
  },
  cosmetics: {
    id: "cosmetics",
    name: "化粧品・美容",
    description: "使用期限・全成分表示など化粧品固有の項目",
    commission_rate: 15,
    referral_rate: 3,
    platform_rate: 12,
    product_fields: [
      { field: "ingredients", label: "全成分表示", required: true, type: "text" },
      { field: "volume", label: "内容量", required: true, type: "text" },
      { field: "skin_type", label: "対象肌タイプ", required: false, type: "text" },
      { field: "manufacturer_license", label: "製造販売業許可番号", required: true, type: "text" },
      { field: "country_of_origin", label: "原産国", required: true, type: "text" },
    ],
    lot_fields: [
      { field: "expiration_date", label: "使用期限", required: true, type: "date" },
      { field: "manufacture_date", label: "製造日", required: false, type: "date" },
      { field: "batch_number", label: "製造番号", required: true, type: "text" },
    ],
  },
  electronics: {
    id: "electronics",
    name: "家電・電子機器",
    description: "PSEマーク・保証期間など電子機器固有の項目",
    commission_rate: 8,
    referral_rate: 1.5,
    platform_rate: 6.5,
    product_fields: [
      { field: "voltage", label: "定格電圧", required: true, type: "text" },
      { field: "power_consumption", label: "消費電力", required: false, type: "text" },
      { field: "pse_mark", label: "PSEマーク", required: true, type: "boolean" },
      { field: "tech_mark", label: "技適マーク", required: false, type: "boolean" },
      { field: "warranty_period", label: "保証期間", required: true, type: "text" },
      { field: "country_of_origin", label: "原産国", required: true, type: "text" },
    ],
    lot_fields: [
      { field: "serial_range", label: "シリアル番号範囲", required: false, type: "text" },
      { field: "manufacture_date", label: "製造日", required: true, type: "date" },
      { field: "firmware_version", label: "ファームウェアVer", required: false, type: "text" },
    ],
  },
  apparel: {
    id: "apparel",
    name: "アパレル・ファッション",
    description: "サイズ・素材・洗濯表示などアパレル固有の項目",
    commission_rate: 15,
    referral_rate: 3,
    platform_rate: 12,
    product_fields: [
      { field: "material_composition", label: "素材・組成", required: true, type: "text" },
      { field: "size_range", label: "サイズ展開", required: true, type: "text" },
      { field: "color_options", label: "カラー展開", required: true, type: "text" },
      { field: "care_instructions", label: "洗濯表示", required: true, type: "text" },
      { field: "country_of_origin", label: "原産国", required: true, type: "text" },
    ],
    lot_fields: [
      { field: "season", label: "シーズン", required: false, type: "text" },
      { field: "size", label: "サイズ", required: true, type: "text" },
      { field: "color", label: "カラー", required: true, type: "text" },
    ],
  },
  service: {
    id: "service",
    name: "サービス・デジタル",
    description: "有効期限・利用条件などサービス固有の項目（賞味期限不要）",
    commission_rate: 20,
    referral_rate: 4,
    platform_rate: 16,
    product_fields: [
      { field: "service_area", label: "提供エリア", required: false, type: "text" },
      { field: "terms_of_use", label: "利用規約URL", required: true, type: "text" },
      { field: "cancellation_policy", label: "キャンセルポリシー", required: true, type: "text" },
      { field: "delivery_method", label: "提供方法", required: true, type: "select", options: ["オンライン", "対面", "郵送", "ダウンロード"] },
    ],
    lot_fields: [
      { field: "valid_from", label: "利用開始日", required: false, type: "date" },
      { field: "valid_until", label: "有効期限", required: false, type: "date" },
      { field: "usage_limit", label: "利用回数上限", required: false, type: "number" },
    ],
  },
  medical: {
    id: "medical",
    name: "医薬品・医療機器",
    description: "薬事法関連・使用期限など医薬品固有の項目",
    commission_rate: 10,
    referral_rate: 2,
    platform_rate: 8,
    product_fields: [
      { field: "approval_number", label: "承認番号", required: true, type: "text" },
      { field: "classification", label: "医薬品区分", required: true, type: "select", options: ["第1類", "第2類", "第3類", "医療機器"] },
      { field: "active_ingredients", label: "有効成分", required: true, type: "text" },
      { field: "dosage", label: "用法・用量", required: true, type: "text" },
      { field: "side_effects", label: "副作用", required: true, type: "text" },
      { field: "storage_method", label: "保管方法", required: true, type: "text" },
    ],
    lot_fields: [
      { field: "expiration_date", label: "使用期限", required: true, type: "date" },
      { field: "manufacture_date", label: "製造日", required: true, type: "date" },
      { field: "batch_number", label: "ロット番号", required: true, type: "text" },
    ],
  },
  industrial: {
    id: "industrial",
    name: "工業製品・部品",
    description: "規格・認証など工業製品固有の項目",
    commission_rate: 6,
    referral_rate: 1,
    platform_rate: 5,
    product_fields: [
      { field: "standard", label: "適合規格（JIS/ISO等）", required: false, type: "text" },
      { field: "tolerance", label: "公差", required: false, type: "text" },
      { field: "material_grade", label: "材質グレード", required: true, type: "text" },
      { field: "certification", label: "認証・認定", required: false, type: "text" },
      { field: "datasheet_url", label: "データシートURL", required: false, type: "text" },
    ],
    lot_fields: [
      { field: "manufacture_date", label: "製造日", required: true, type: "date" },
      { field: "inspection_date", label: "検査日", required: false, type: "date" },
      { field: "inspection_result", label: "検査成績", required: false, type: "text" },
    ],
  },
};

export type Lot = {
  id: string;
  product_id: string;
  lot_number: string;
  stock: number;
  expiration_date: string | null;
  status: "販売中" | "売切れ" | "期限切れ";
  price: number | null;
  stripe_price_id: string | null;
  purchase_date: string | null;
  purchase_price: number | null;
  memo: string | null;
  category_template_id: string | null;
  custom_fields: Record<string, string | number | boolean | null> | null;
  created_at: string;
  updated_at: string;
};

export type LotPurchase = {
  id: string;
  lot_id: string;
  stripe_session_id: string;
  created_at: string;
};

export type Auction = {
  id: string;
  lot_id: string;
  start_price: number;
  buy_now_price: number | null;
  min_bid_increment: number;
  current_price: number;
  status: "出品中" | "落札済み" | "キャンセル";
  ends_at: string;
  created_at: string;
};

export type Bid = {
  id: string;
  auction_id: string;
  bidder_name: string;
  bidder_email: string;
  amount: number;
  is_buy_now: boolean;
  buyer_id: string | null;
  agent_result_id: string | null;
  created_at: string;
};

export type UserProfile = {
  id: string;
  role: "admin" | "partner" | "buyer";
  partner_id: string | null;
  display_name: string | null;
  created_at: string;
};

export type Announcement = {
  id: string;
  title: string;
  body: string;
  is_published: boolean;
  published_at: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type Message = {
  id: string;
  thread_id: string;
  sender_id: string;
  recipient_id: string;
  body: string;
  is_read: boolean;
  created_at: string;
};

export type Task = {
  id: string;
  title: string;
  description: string | null;
  status: "未着手" | "進行中" | "完了";
  priority: "高" | "中" | "低";
  assigned_to: string | null;
  assigned_partner_id: string | null;
  due_date: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type SharedFile = {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number | null;
  mime_type: string | null;
  uploaded_by: string;
  partner_id: string | null;
  created_at: string;
};

// ====== 商品属性 ======

export type ProductAttribute = {
  id: string;
  product_id: string;
  attribute_name: string;
  attribute_value: string;
  created_at: string;
};

// ====== 購買エージェント ======

export type SpecRequirement = {
  label: string;
  value: string;
};

export type BuyingAgent = {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  keyword: string | null;
  target_tag_ids: string[];
  min_price: number | null;
  max_price: number | null;
  require_certified: boolean;
  require_entity_proof: boolean;
  require_product_proof: boolean;
  spec_requirements: SpecRequirement[];
  certification_weight: number;
  proof_chain_weight: number;
  preferred_partner_type: "メーカー" | "代理店" | null;
  require_in_stock: boolean;
  min_total_score: number | null;
  auto_bid_enabled: boolean;
  auto_bid_max_price: number | null;
  status: "有効" | "一時停止";
  last_run_at: string | null;
  created_at: string;
  updated_at: string;
};

export type AgentResult = {
  id: string;
  agent_id: string;
  lot_id: string;
  product_id: string;
  certification_score: number;
  proof_chain_score: number;
  tag_match_score: number;
  price_match_score: number;
  spec_match_score: number;
  total_score: number;
  score_details: Record<string, unknown>;
  status: "未確認" | "確認済み" | "購入済み" | "却下";
  created_at: string;
};

// ====== 自動入札ログ ======

export type AutoBidLog = {
  id: string;
  agent_id: string;
  agent_result_id: string | null;
  auction_id: string;
  bid_id: string | null;
  action: "入札成功" | "入札失敗" | "上限到達";
  amount: number | null;
  max_price: number;
  message: string | null;
  created_at: string;
};

// ====== 引合い管理 ======

export type AgentInquiry = {
  id: string;
  agent_result_id: string;
  agent_id: string;
  buyer_id: string;
  product_id: string;
  lot_id: string;
  partner_id: string;
  total_score: number;
  score_details: Record<string, unknown>;
  buyer_price: number | null;
  buyer_quantity: number | null;
  buyer_notes: string | null;
  partner_status: "新規" | "対応中" | "承諾" | "辞退";
  response_notes: string | null;
  rejection_reason: string | null;
  responded_at: string | null;
  created_at: string;
  updated_at: string;
};

// ====== タグ ======

export type Tag = {
  id: string;
  name: string;
  slug: string;
  tag_type: "生産者" | "メーカー" | "カテゴリ" | "キーワード";
  description: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ProductTag = {
  id: string;
  product_id: string;
  tag_id: string;
  created_at: string;
};

// ====== 5層証明チェーン ======

export type EntityProof = {
  id: string;
  partner_id: string;
  proof_type: "生産者署名" | "代理店署名" | "販売権証明" | "事業許可証";
  document_url: string | null;
  issuer: string | null;
  issued_at: string | null;
  expires_at: string | null;
  signature_hash: string | null;
  status: "未検証" | "検証済み" | "失効";
  verified_by: string | null;
  verified_at: string | null;
  notes: string | null;
  created_at: string;
};

export type ProductProof = {
  id: string;
  product_id: string;
  proof_type: "成分表" | "スペックシート" | "試験成績書" | "品質証明書";
  document_url: string | null;
  spec_data: Record<string, unknown> | null;
  lab_name: string | null;
  tested_at: string | null;
  valid_until: string | null;
  status: "未検証" | "検証済み" | "失効";
  verified_by: string | null;
  verified_at: string | null;
  notes: string | null;
  created_at: string;
};

export type InventoryProof = {
  id: string;
  lot_id: string;
  verified_stock: number;
  warehouse_code: string | null;
  location_detail: string | null;
  verification_method: "目視" | "バーコード" | "WMS連動" | "IoTセンサー";
  photo_url: string | null;
  verified_by: string;
  notes: string | null;
  created_at: string;
};

export type OwnershipRecord = {
  id: string;
  lot_id: string;
  lot_purchase_id: string | null;
  auction_id: string | null;
  from_partner_id: string | null;
  to_entity_type: "partner" | "buyer";
  to_entity_id: string;
  to_entity_name: string | null;
  quantity: number;
  transfer_type: "出品" | "購入" | "落札" | "移管" | "返品";
  stripe_payment_id: string | null;
  transferred_at: string;
  tx_hash: string | null;
  status: "仮確定" | "確定" | "取消";
  created_at: string;
};

export type DeliveryProof = {
  id: string;
  lot_purchase_id: string | null;
  ownership_record_id: string | null;
  carrier: string | null;
  tracking_number: string | null;
  shipped_at: string | null;
  estimated_delivery: string | null;
  delivered_at: string | null;
  received_by: string | null;
  signature_url: string | null;
  photo_url: string | null;
  status: "準備中" | "発送済み" | "配達中" | "配達完了" | "受領確認済み";
  notes: string | null;
  created_at: string;
  updated_at: string;
};

// ====== グループウェア強化 ======

export type ActivityLog = {
  id: string;
  user_id: string;
  partner_id: string | null;
  action_type: string;
  entity_type: string;
  entity_id: string;
  description: string;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type Notification = {
  id: string;
  user_id: string;
  partner_id: string | null;
  title: string;
  body: string | null;
  link: string | null;
  is_read: boolean;
  notification_type: string;
  entity_type: string | null;
  entity_id: string | null;
  created_at: string;
};

export type Approval = {
  id: string;
  partner_id: string;
  entity_type: "quote" | "invoice";
  entity_id: string;
  document_number: string;
  requested_by: string;
  requested_at: string;
  approver_id: string | null;
  status: "承認待ち" | "承認済み" | "差戻し";
  comment: string | null;
  approved_at: string | null;
  created_at: string;
};

export type PartnerInvitation = {
  id: string;
  partner_id: string;
  email: string;
  invited_by: string;
  token: string;
  status: "招待中" | "登録済み" | "期限切れ";
  expires_at: string;
  created_at: string;
};

// ====== 帳票管理 ======

export type Quote = {
  id: string;
  partner_id: string;
  document_number: string;
  inquiry_id: string | null;
  stock_request_id: string | null;
  buyer_company_name: string;
  buyer_contact_name: string | null;
  buyer_postal_code: string | null;
  buyer_address: string | null;
  subject: string;
  issue_date: string;
  valid_until: string | null;
  payment_terms: string | null;
  notes: string | null;
  status: "下書き" | "送付済み" | "承諾" | "辞退" | "期限切れ";
  subtotal: number;
  tax_total: number;
  total: number;
  sent_at: string | null;
  responded_at: string | null;
  created_at: string;
  updated_at: string;
};

export type QuoteItem = {
  id: string;
  quote_id: string;
  sort_order: number;
  product_id: string | null;
  lot_id: string | null;
  item_name: string;
  description: string | null;
  quantity: number;
  unit: string;
  unit_price: number;
  tax_rate: number;
  amount: number;
  tax_amount: number;
  created_at: string;
};

export type Invoice = {
  id: string;
  partner_id: string;
  document_number: string;
  quote_id: string | null;
  buyer_company_name: string;
  buyer_contact_name: string | null;
  buyer_postal_code: string | null;
  buyer_address: string | null;
  subject: string;
  issue_date: string;
  due_date: string | null;
  payment_terms: string | null;
  notes: string | null;
  status: "下書き" | "送付済み" | "入金済み" | "期限超過" | "取消";
  subtotal: number;
  tax_total: number;
  tax_10_total: number;
  tax_8_total: number;
  total: number;
  invoice_registration_number: string | null;
  sent_at: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
};

export type InvoiceItem = {
  id: string;
  invoice_id: string;
  sort_order: number;
  product_id: string | null;
  lot_id: string | null;
  item_name: string;
  description: string | null;
  quantity: number;
  unit: string;
  unit_price: number;
  tax_rate: number;
  amount: number;
  tax_amount: number;
  created_at: string;
};

export type DeliverySlip = {
  id: string;
  partner_id: string;
  document_number: string;
  invoice_id: string | null;
  buyer_company_name: string;
  buyer_contact_name: string | null;
  buyer_postal_code: string | null;
  buyer_address: string | null;
  subject: string;
  issue_date: string;
  delivery_date: string | null;
  notes: string | null;
  status: "下書き" | "発行済み";
  subtotal: number;
  tax_total: number;
  total: number;
  created_at: string;
  updated_at: string;
};

export type DeliverySlipItem = {
  id: string;
  delivery_slip_id: string;
  sort_order: number;
  product_id: string | null;
  lot_id: string | null;
  item_name: string;
  description: string | null;
  quantity: number;
  unit: string;
  unit_price: number;
  tax_rate: number;
  amount: number;
  tax_amount: number;
  created_at: string;
};

// ====== アンケート ======

export type Survey = {
  id: string;
  title: string;
  description: string | null;
  target_type: "general" | "product" | "lot";
  target_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type SurveyQuestion = {
  id: string;
  survey_id: string;
  sort_order: number;
  question_text: string;
  question_type: "text" | "radio" | "checkbox" | "rating";
  options: string[];
  is_required: boolean;
  created_at: string;
};

export type SurveyResponse = {
  id: string;
  survey_id: string;
  respondent_name: string | null;
  respondent_email: string | null;
  created_at: string;
};

export type SurveyAnswer = {
  id: string;
  response_id: string;
  question_id: string;
  answer_text: string | null;
  answer_options: string[];
  created_at: string;
};

// ====== 掲示板 ======

export type BoardThread = {
  id: string;
  target_type: "product" | "lot";
  target_id: string;
  title: string;
  author_name: string;
  author_email: string | null;
  created_at: string;
};

export type BoardPost = {
  id: string;
  thread_id: string;
  author_name: string;
  author_email: string | null;
  body: string;
  created_at: string;
};

// ====== Creator LP ======

export type Affiliate = {
  id: string;
  name: string;
  email: string;
  code: string;
  commission_rate: number;
  is_creator: boolean;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
};

export type BlockType =
  | "hero"
  | "product_info"
  | "lot_details"
  | "image"
  | "text"
  | "features"
  | "testimonial"
  | "faq"
  | "cta"
  | "divider";

export type LPBlock = {
  id: string;
  type: BlockType;
  props: Record<string, unknown>;
};

export type LPTheme = {
  primary_color: string;
  secondary_color: string;
  bg_color: string;
  font: string;
};

export type CreatorLPDesign = {
  id: string;
  affiliate_id: string;
  product_id: string | null;
  lot_id: string | null;
  slug: string;
  design_config: LPBlock[];
  theme: LPTheme;
  is_published: boolean;
  views_count: number;
  created_at: string;
  updated_at: string;
};

// ====== Creator LP コレクション ======

export type CollectionFilterConditions = {
  tag_ids?: string[];
  partner_ids?: string[];
  keyword?: string;
  include_design_ids?: string[];
  exclude_product_ids?: string[];
};

export type CollectionBlockType =
  | "hero"
  | "image"
  | "text"
  | "features"
  | "testimonial"
  | "faq"
  | "cta"
  | "divider"
  | "collection_grid"
  | "collection_filter_bar";

export type CollectionBlock = {
  id: string;
  type: CollectionBlockType;
  props: Record<string, unknown>;
};

export type CreatorLPCollection = {
  id: string;
  affiliate_id: string;
  slug: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  filter_conditions: CollectionFilterConditions;
  design_config: CollectionBlock[];
  theme: LPTheme;
  is_published: boolean;
  views_count: number;
  created_at: string;
  updated_at: string;
};

export type CollectionItem = {
  product: Product;
  lots: Lot[];
  partner: Partner | null;
  tags: Tag[];
  creatorDesigns: CreatorLPDesign[];
};

// ====== ステップメール ======

export type StepMailCampaign = {
  id: string;
  name: string;
  description: string | null;
  trigger_event: string;
  trigger_conditions: Record<string, unknown>;
  from_name: string;
  from_email: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type StepMailStep = {
  id: string;
  campaign_id: string;
  step_number: number;
  delay_hours: number;
  subject: string;
  body_html: string;
  body_text: string | null;
  created_at: string;
};

export type StepMailEnrollment = {
  id: string;
  campaign_id: string;
  user_email: string;
  user_name: string | null;
  metadata: Record<string, unknown>;
  current_step: number;
  status: "active" | "paused" | "completed" | "unsubscribed" | "bounced";
  enrolled_at: string;
  completed_at: string | null;
};

export type StepMailLog = {
  id: string;
  enrollment_id: string;
  step_id: string;
  scheduled_for: string;
  sent_at: string | null;
  status: "pending" | "sending" | "sent" | "failed" | "bounced" | "opened" | "clicked";
  resend_message_id: string | null;
  error_message: string | null;
  opened_at: string | null;
  clicked_at: string | null;
  created_at: string;
};

export type StepMailApiKey = {
  id: string;
  name: string;
  key_hash: string;
  key_prefix: string;
  permissions: string[];
  is_active: boolean;
  last_used_at: string | null;
  created_at: string;
};

export type StepMailEvent = {
  id: string;
  api_key_id: string | null;
  event_type: string;
  event_id: string | null;
  payload: Record<string, unknown>;
  status: "pending" | "processed" | "failed" | "ignored";
  processed_at: string | null;
  error_message: string | null;
  created_at: string;
};

// ====== メーカー紹介者報酬 ======

export type MakerReferralCommission = {
  id: string;
  referrer_affiliate_id: string;
  partner_id: string;
  commission_rate: number;
  is_active: boolean;
  created_at: string;
};

export type MakerReferralPayout = {
  id: string;
  commission_id: string;
  lot_purchase_id: string;
  purchase_amount: number;
  commission_amount: number;
  status: "pending" | "approved" | "paid" | "cancelled";
  calculated_at: string;
};
