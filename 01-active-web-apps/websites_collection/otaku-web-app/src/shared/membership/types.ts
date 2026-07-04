/** Membership ladder + interactive inventory types */

export type MembershipStage =
  | 'guest'
  | 'pass_holder'
  | 'app_owner'
  | 'vip'
  | 'super_user'

export type UserRole =
  | 'guest'
  | 'user'
  | 'vip'
  | 'early_access'
  | 'op'
  | 'super_user'

export type InventoryItemState = 'active' | 'expired' | 'cancelled'

export type ItemType = 'consumable' | 'key' | 'cosmetic' | 'upgrade_token'

export type ItemPurpose = 'access_key' | 'renewal' | 'upgrade' | 'display'

export type InventoryAction =
  | 'view'
  | 'renew'
  | 'cancel'
  | 'use_key'
  | 'upgrade_vip'
  | 'apply'

export type CardOverlay = 'pass' | 'vip' | 'super_visitor'

export interface ItemCatalogRow {
  id: string
  slug: string
  name: string
  description: string
  item_type: ItemType
  purpose: ItemPurpose
  interact_actions: InventoryAction[]
  grants: Record<string, unknown>
  shop_price_id?: string | null
  renewal_interval?: string | null
}

export interface UserInventoryRow {
  id: string
  user_id: string
  item_id: string
  state: InventoryItemState
  metadata: {
    expires_at?: string
    stripe_subscription_id?: string
    stripe_customer_id?: string
    card_overlay?: CardOverlay
    cancel_at_period_end?: boolean
    [key: string]: unknown
  }
  acquired_at: string
  updated_at: string
  item_catalog?: ItemCatalogRow
}

export interface LibraryCareer {
  series_logged: number
  milestones_unlocked: string[]
}

export interface MembershipStatus {
  stage: MembershipStage
  role: UserRole
  isGuest: boolean
  hasValidPass: boolean
  hasProgram: boolean
  isVip: boolean
  isSuperUser: boolean
  superUserEligible: boolean
  careerPercent: number
  nextStageLabel: string | null
  admissionCard: UserInventoryRow | null
  subscriptionEndDate: string | null
  cancelAtPeriodEnd: boolean
}

export const STAGE_ORDER: MembershipStage[] = [
  'guest',
  'pass_holder',
  'app_owner',
  'vip',
  'super_user',
]

export const STAGE_LABELS: Record<MembershipStage, string> = {
  guest: 'Guest',
  pass_holder: 'Library Pass',
  app_owner: 'App Owner',
  vip: 'VIP Member',
  super_user: 'Super User',
}
