// src/lib/types/api.ts
// Auto-generated from backend Go domain models.
// DO NOT EDIT MANUALLY — run `make generate-types` to sync.

// ── Primitives ────────────────────────────────────────────────────────────────

/** UUID v4/v7 string */
export type UUID = string;

/** ISO-8601 date-time */
export type DateTime = string;

// ── Envelope ─────────────────────────────────────────────────────────────────

/** Standard API success envelope (status 2xx) */
export interface ApiEnvelope<T> {
  success: true;
  data: T;
}

/** Standard API error envelope (status 4xx / 5xx) */
export interface ApiErrorEnvelope {
  success: false;
  error: {
    error_code: string;
    message: string;
  };
}

/** Discriminated union for every API response */
export type ApiResponse<T> = ApiEnvelope<T> | ApiErrorEnvelope;

// ── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: UserProfile;
}

export interface RefreshTokenPayload {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  role: string;
  role_id?: string;
  avatar_url?: string | null;
  is_verified: boolean;
  user_xp: number;
  user_level: number;
  host_xp: number;
  host_level: number;
  is_private_profile: boolean;
  is_incognito: boolean;
  last_login_at?: string | null;
  created_at: string;
  updated_at: string;
}

// ── Stream ───────────────────────────────────────────────────────────────────

export interface Stream {
  id: string;
  host_id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  status: string;
  started_at?: string | null;
  ended_at?: string | null;
  viewer_peak: number;
  total_duration: number;
  room_id: string;
  created_at: string;
  updated_at: string;
  room_mode: string;
  room_password_hash?: string;
  entry_fee_idr: number;
  min_level_to_enter: number;
  category: string;
  tags: string;
  max_resolution: string;
  is_screen_share: boolean;
  is_co_host_enabled: boolean;
  max_co_hosts: number;
  viewer_count: number;
  total_gift_value_idr: number;
  like_count: number;
  share_count: number;
  current_pk_id?: string | null;
  is_pk_eligible: boolean;
  chat_mode: string;
  chat_slow_mode_seconds: number;
  country_code: string;
  language: string;
  stream_key?: string;
  playback_id?: string;
  mux_asset_id?: string;
  viewers?: number;
  mux_playback_url?: string;
  format?: "landscape" | "portrait" | "dual";
  interactive?: boolean;
  host?: UserProfile;
}

export interface CreateStreamInput {
  title: string;
  description: string;
  thumbnail_url?: string;
  room_mode: string;
  room_password?: string;
  entry_fee_idr?: number;
  min_level_to_enter?: number;
  category?: string;
  tags?: string;
  max_resolution?: string;
  is_screen_share?: boolean;
  is_co_host_enabled?: boolean;
  max_co_hosts?: number;
  chat_mode?: string;
  chat_slow_mode_seconds?: number;
  country_code?: string;
  language?: string;
}

// ── Chat ─────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  room_id: string;
  user_id: string;
  content: string;
  type: "text" | "image" | "system";
  reply_to_id?: string | null;
  created_at: string;
  updated_at: string;
  user?: UserProfile;
}

export interface ChatRoom {
  id: string;
  name: string;
  type: "stream" | "private" | "group";
  target_id?: string | null;
  participant_ids?: string[];
  created_at: string;
  updated_at: string;
}

// ── Story ────────────────────────────────────────────────────────────────────

export interface Story {
  id: string;
  user_id: string;
  content: string;
  media_type: "text" | "image" | "video";
  expires_at: string;
  view_count: number;
  created_at: string;
  updated_at: string;
  media_url: string;
  caption: string;
  is_expired: boolean;
  user?: UserProfile;
}

// ── Comment ──────────────────────────────────────────────────────────────────

export interface Comment {
  id: string;
  user_id: string;
  content_id: string;
  content_type: "stream" | "vod" | "story";
  parent_id?: string | null;
  content: string;
  text: string;
  like_count: number;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  user?: UserProfile;
  replies?: Comment[];
}

// ── Like ─────────────────────────────────────────────────────────────────────

export interface Like {
  id: string;
  user_id: string;
  content_id: string;
  content_type: "stream" | "vod" | "story" | "comment";
  created_at: string;
}

// ── Wallet & Payment ─────────────────────────────────────────────────────────

export interface Wallet {
  id: string;
  user_id: string;
  balance: number;   // in IDR (smallest unit, e.g. rupiah integer)
  frozen_balance: number;
  currency: string;
  updated_at: string;
}

export type TransactionType = "deposit" | "withdrawal" | "gift_send" | "gift_receive" | "payment" | "refund";

export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  currency: string;
  status: string;
  reference_id: string;
  payment_method?: string;
  metadata?: string;
  created_at: string;
}

// ── VOD ──────────────────────────────────────────────────────────────────────

export type VODStatus = "processing" | "ready" | "failed";
export type VODVisibility = "public" | "private" | "unlisted";

export interface VODMedia {
  id: string;
  user_id: string;
  title: string;
  description: string;
  original_url: string;
  hls_url: string;
  thumbnail_url: string;
  duration: number;      // seconds
  file_size: number;
  status: VODStatus;
  visibility: VODVisibility;
  created_at: string;
  updated_at: string;
  user?: UserProfile;
}

// ── Prediction / Betting ─────────────────────────────────────────────────────

export type PredictionStatus = "active" | "resolved" | "cancelled";
export type BetOutcome = "yes" | "no";

export interface Prediction {
  id: string;
  stream_id: string;
  question: string;
  status: PredictionStatus;
  resolved_outcome?: BetOutcome;
  total_yes_pool: number;
  total_no_pool: number;
  created_at: string;
  resolved_at?: string | null;
}

export type CurrencyType = "wallet" | "token";

export interface PredictionBet {
  id: string;
  prediction_id: string;
  user_id: string;
  outcome: BetOutcome;
  amount: number;
  currency_type: CurrencyType;
  creator_token_id?: string | null;
  created_at: string;
}

// ── Gift ─────────────────────────────────────────────────────────────────────

export interface Gift {
  id: string;
  name: string;
  icon_url: string;
  price: number;        // in IDR
  currency: string;
  animation_url?: string;
  is_active: boolean;
  created_at: string;
}

export interface SendGiftPayload {
  gift_id: string;
  quantity: number;
  stream_id: string;
}

export interface SendGiftResponse {
  success: boolean;
  transaction_id: string;
  new_balance: number;
}

// ── Push Notification ────────────────────────────────────────────────────────

export interface PushSubscription {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh_key: string;
  auth_key: string;
  topics: string[];
  created_at: string;
  updated_at: string;
}

// ── KYC / Agency ─────────────────────────────────────────────────────────────

export type KYCStatus = "pending" | "approved" | "rejected";
export type OnboardingStep = string;

export interface KYCSubmission {
  id: string;
  user_id: string;
  status: KYCStatus;
  id_number: string;
  full_name: string;
  selfie_url: string;
  id_card_url: string;
  submitted_at: string;
  reviewed_at?: string | null;
  rejection_reason?: string;
}

export interface OnboardingChecklist {
  role: string;
  steps: {
    key: OnboardingStep;
    label: string;
    completed: boolean;
    completed_at?: string | null;
  }[];
}

export interface Agency {
  id: string;
  name: string;
  description?: string;
  owner_id: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

// ── Private Chat ─────────────────────────────────────────────────────────────

export type ConversationType = "private" | "group";

export interface Conversation {
  id: string;
  type: ConversationType;
  participant_ids: string[];
  last_message_at?: string | null;
  created_at: string;
  updated_at: string;
  other_participant?: UserProfile;
}

export interface PrivateMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_expired: boolean;
  is_viewed: boolean;
  created_at: string;
  sender?: UserProfile;
}

// ── Stats ────────────────────────────────────────────────────────────────────

export interface AdminDashboardStats {
  total_users: number;
  total_streams: number;
  pending_kyc: number;
  total_revenue: number;
  pending_reports: number;
  revenue_graph: {
    date: string;
    amount: number;
  }[];
}

export interface HostDashboardStats {
  total_streams: number;
  total_viewers: number;
  total_gift_value: number;
  total_followers: number;
}

// ── Pagination ───────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
    has_more: boolean;
  };
}
