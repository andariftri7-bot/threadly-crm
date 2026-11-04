// ==============================================================================
// THREADLY - Omnichannel ChannelAdapter Architecture Scaffolding
// ==============================================================================
// Persiapan arsitektur masa depan untuk integrasi omnichannel tanpa merombak skema.
// Jangan implementasikan webhook/inbox aktif saat ini sesuai batasan spesifikasi.

export type SupportedChannel = 'whatsapp' | 'shopee' | 'tokopedia' | 'tiktok_shop' | 'direct';

export interface ChannelCredentials {
  apiKey?: string;
  apiSecret?: string;
  accessToken?: string;
  webhookSecret?: string;
  storeId: string;
}

export interface IncomingChannelMessage {
  externalMessageId: string;
  channel: SupportedChannel;
  senderExternalId: string;
  senderName?: string;
  content: string;
  timestamp: Date;
  rawPayload: Record<string, unknown>;
}

export interface SendMessagePayload {
  recipientExternalId: string;
  content: string;
  mediaUrl?: string;
  replyToMessageId?: string;
}

export interface SendMessageResult {
  success: boolean;
  externalMessageId?: string;
  error?: string;
}

/**
 * Clean ChannelAdapter interface standardizing future channel integrations:
 * - WhatsApp Business API / Cloud API
 * - Shopee Chat Open Platform
 * - Tokopedia Chat Open Platform
 * - TikTok Shop Open Platform
 */
export interface ChannelAdapter {
  readonly channelType: SupportedChannel;

  /**
   * Connect and validate connection credentials with channel API
   */
  connect(credentials: ChannelCredentials): Promise<boolean>;

  /**
   * Verify signature of incoming HTTP webhook to prevent spoofing
   */
  verifyWebhook(headers: Record<string, string | string[]>, rawBody: string, secret: string): Promise<boolean>;

  /**
   * Parse vendor-specific incoming webhook payload into unified IncomingChannelMessage
   */
  parseIncoming(rawBody: string | Record<string, unknown>): Promise<IncomingChannelMessage | null>;

  /**
   * Send outgoing message through the channel
   */
  sendMessage(payload: SendMessagePayload): Promise<SendMessageResult>;
}

/**
 * Base abstract class providing default validation and error handling templates
 */
export abstract class BaseChannelAdapter implements ChannelAdapter {
  abstract readonly channelType: SupportedChannel;

  abstract connect(credentials: ChannelCredentials): Promise<boolean>;
  abstract verifyWebhook(headers: Record<string, string | string[]>, rawBody: string, secret: string): Promise<boolean>;
  abstract parseIncoming(rawBody: string | Record<string, unknown>): Promise<IncomingChannelMessage | null>;
  abstract sendMessage(payload: SendMessagePayload): Promise<SendMessageResult>;
}
