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
  description: string | null;
  image_url: string | null;
  base_price: number;
  stripe_price_id: string | null;
  slug: string;
  is_active: boolean;
  min_order_quantity: number | null;
  min_order_amount: number | null;
  order_notes: string | null;
  created_at: string;
  updated_at: string;
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
