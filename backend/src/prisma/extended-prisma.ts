// Extended Prisma types
import { PrismaClient } from '@prisma/client'
import * as TempTypes from './temp-types'

declare module '@prisma/client' {
  interface PrismaClient {
    returnRequest: any
    refund: any
    systemAlert: any
    contentBlock: any
    media: any
    auditLog: any
    wishlistItem: any
    user: any
    offer: any
    category: any
    product: any
    productVariant: any
    review: any
    order: any
    orderItem: any
    banner: any
    uiSettings: any
    transportConfig: any
    stockNotify: any
    cartItem: any
    searchHistory: any
    refreshToken: any
    passwordResetToken: any
    newsletterSubscriber: any
    emailCampaign: any
    emailCampaignSend: any
    marketingEmailLog: any
    comboItem: any
    reviewSettings: any
  }

  // Export enums
  export import UserRole = TempTypes.UserRole
  export import ReturnStatus = TempTypes.ReturnStatus
  export import RefundStatus = TempTypes.RefundStatus
  export import AlertType = TempTypes.AlertType
  export import AlertStatus = TempTypes.AlertStatus
  export import OrderStatus = TempTypes.OrderStatus
  export import PaymentStatus = TempTypes.PaymentStatus
  export import OfferType = TempTypes.OfferType
  export import SiteMode = TempTypes.SiteMode
  export import Currency = TempTypes.Currency

  // Export interfaces
  export import ReturnRequest = TempTypes.ReturnRequest
  export import Refund = TempTypes.Refund
  export import SystemAlert = TempTypes.SystemAlert
  export import ContentBlock = TempTypes.ContentBlock
  export import Media = TempTypes.Media
  export import AuditLog = TempTypes.AuditLog
  export import WishlistItem = TempTypes.WishlistItem
}