// Temporary types for Prisma models until proper generation works
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  OPERATOR = 'OPERATOR',
  LOGISTICS = 'LOGISTICS',
  SUPPORT = 'SUPPORT'
}

export enum ReturnStatus {
  REQUESTED = 'REQUESTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  REFUNDED = 'REFUNDED'
}

export enum RefundStatus {
  PENDING = 'PENDING',
  PROCESSED = 'PROCESSED',
  FAILED = 'FAILED'
}

export enum AlertType {
  LOW_STOCK = 'LOW_STOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  ORDER_STUCK = 'ORDER_STUCK',
  PAYMENT_ISSUE = 'PAYMENT_ISSUE',
  SYSTEM_ERROR = 'SYSTEM_ERROR'
}

export enum AlertStatus {
  NEW = 'NEW',
  VIEWED = 'VIEWED',
  RESOLVED = 'RESOLVED'
}

export interface ReturnRequest {
  id: string
  orderId: string
  userId: string
  status: ReturnStatus
  reason: string
  notes?: string
  refundAmount?: any // Decimal
  createdAt: Date
  updatedAt: Date
}

export interface Refund {
  id: string
  returnRequestId?: string
  orderId?: string
  amount: any // Decimal
  reason?: string
  status: RefundStatus
  method?: string
  processedAt?: Date
  processedBy?: string
  createdAt: Date
  updatedAt: Date
}

export interface SystemAlert {
  id: string
  type: AlertType
  message: string
  details?: any
  status: AlertStatus
  createdAt: Date
  updatedAt: Date
}

export interface ContentBlock {
  id: string
  slug: string
  title: string
  content: string
  section?: string
  isActive: boolean
  updatedBy?: string
  createdAt: Date
  updatedAt: Date
}

export interface Media {
  id: string
  filename?: string
  mimeType: string
  sizeBytes: number
  data: Buffer
  createdAt: Date
}

export interface AuditLog {
  id: string
  userId: string
  user: any // User relation
  action: string
  resource: string
  resourceId?: string
  changes?: { before?: any; after?: any }
  ipAddress?: string
  userAgent?: string
  createdAt: Date
}

export interface WishlistItem {
  id: string
  userId: string
  productId: string
  createdAt: Date
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

export enum OfferType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED = 'FIXED'
}

export enum SiteMode {
  LIVE = 'LIVE',
  MAINTENANCE = 'MAINTENANCE',
  COMING_SOON = 'COMING_SOON'
}

export enum Currency {
  USD = 'USD',
  MNs = 'MNs'
}

export interface User {
  id: string
  email: string
  password: string
  firstName?: string
  lastName?: string
  phone?: string
  address?: string
  city?: string
  zipCode?: string
  country?: string
  role: UserRole
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Offer {
  id: string
  name: string
  code: string
  type: OfferType
  value: any // Decimal
  minPurchase?: any // Decimal
  usageLimit?: number
  usageCount: number
  startDate: Date
  endDate: Date
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
  isActive: boolean
  order: number
  createdAt: Date
  updatedAt: Date
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string
  shortDescription?: string
  priceUSD?: any // Decimal
  priceMNs?: any // Decimal
  comparePriceUSD?: any // Decimal
  comparePriceMNs?: any // Decimal
  sku?: string
  stock: number
  isActive: boolean
  isFeatured: boolean
  isCombo: boolean
  adultsOnly: boolean
  images: string[]
  allergens: string[]
  nutritionalInfo?: any
  weight?: any // Decimal
  averageRating?: any // Decimal
  reviewCount: number
  categoryId: string
  createdAt: Date
  updatedAt: Date
}

export interface ProductVariant {
  id: string
  productId: string
  name: string
  priceUSD?: any // Decimal
  priceMNs?: any // Decimal
  comparePriceUSD?: any // Decimal
  comparePriceMNs?: any // Decimal
  sku?: string
  stock: number
  weight?: any // Decimal
  unit?: string
  isActive: boolean
  order: number
  createdAt: Date
  updatedAt: Date
}

export interface Review {
  id: string
  productId: string
  userId?: string
  authorName: string
  authorEmail?: string
  rating: number
  title?: string
  content: string
  isApproved: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Order {
  id: string
  orderNumber: string
  userId: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  subtotal: any // Decimal
  tax: any // Decimal
  shipping: any // Decimal
  total: any // Decimal
  shippingAddress: any
  billingAddress: any
  paymentIntentId?: string
  offerId?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  productVariantId?: string
  variantName?: string
  quantity: number
  price: any // Decimal
  createdAt: Date
}

export interface Banner {
  id: string
  title: string
  description?: string
  image: string
  link?: string
  isActive: boolean
  order: number
  startDate?: Date
  endDate?: Date
  createdAt: Date
  updatedAt: Date
}

export interface UiSettings {
  id: string
  headerAnnouncement: string
  headerHighlights?: any
  headerNavCategories?: any
  benefits?: any
  siteMode: SiteMode
  createdAt: Date
  updatedAt: Date
}

export interface TransportConfig {
  id: string
  baseCost: any // Decimal
  discountsEnabled: boolean
  rules?: any
  noDiscountMessage?: string
  freeShippingThresholdUSD?: any // Decimal
  createdAt: Date
  updatedAt: Date
}

export interface StockNotify {
  id: string
  productId: string
  email: string
  notifiedAt?: Date
  createdAt: Date
}

export interface CartItem {
  id: string
  quantity: number
  userId: string
  productId: string
  productVariantId?: string
  createdAt: Date
  updatedAt: Date
}

export interface SearchHistory {
  id: string
  userId?: string
  searchTerm: string
  resultsCount: number
  createdAt: Date
}

export interface RefreshToken {
  id: string
  tokenHash: string
  userId: string
  expiresAt: Date
  createdAt: Date
}

export interface PasswordResetToken {
  id: string
  userId: string
  token: string
  expiresAt: Date
  used: boolean
}

export interface NewsletterSubscriber {
  id: string
  email: string
  firstName?: string
  lastName?: string
  status: any // NewsletterSubscriberStatus
  source?: string
  subscribedAt: Date
  unsubscribedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface EmailCampaign {
  id: string
  name?: string
  subject: string
  preheader?: string
  html: string
  text?: string
  status: any // EmailCampaignStatus
  sentAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface EmailCampaignSend {
  id: string
  campaignId: string
  subscriberId?: string
  email: string
  status: any // EmailCampaignSendStatus
  error?: string
  sentAt: Date
}

export interface MarketingEmailLog {
  id: string
  userId?: string
  email: string
  type: any // MarketingEmailType
  dedupeKey: string
  sentAt: Date
}

export interface ComboItem {
  id: string
  comboId: string
  productId: string
  quantity: number
  createdAt: Date
  updatedAt: Date
}

export interface ReviewSettings {
  id: string
  autoApproveReviews: boolean
  createdAt: Date
  updatedAt: Date
}