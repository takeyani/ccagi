-- 2026-07-03: creator-assets バケットに動画対応の上限とMIME whitelist を設定
--
-- 経緯:
--   クリエイターLPエディター（0718eb3）で動画ブロック / 背景動画 / MediaUpload UI を追加し、
--   /api/creator/upload 側では動画 100MB まで受け付ける実装にしたが、
--   Supabase の creator-assets バケット側は file_size_limit=null（＝プロジェクトのデフォルト）
--   のままだったため、実際は Free tier デフォルト 50MB で弾かれる可能性があった。
--
-- 変更:
--   - file_size_limit = 100MB (104857600 バイト)
--   - allowed_mime_types = 画像4種 + 動画4種 の whitelist
--     （whitelist にすることで悪意ある任意ファイルの混入を防ぐ）
--
-- 本番DBには Management API 経由で適用済み（2026-07-03）。

UPDATE storage.buckets
SET file_size_limit = 104857600,  -- 100MB
    allowed_mime_types = ARRAY[
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/webm', 'video/quicktime', 'video/ogg'
    ]
WHERE id = 'creator-assets';
