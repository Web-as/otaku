import type { UserProfile } from '../supabase/database'
import {
  applyMilestoneUnlocks,
  computeCareerProgress,
  nextStageHint,
} from './milestones'
import type {
  LibraryCareer,
  MembershipStage,
  MembershipStatus,
  UserInventoryRow,
  UserRole,
} from './types'

function parseCareer(raw: unknown): LibraryCareer {
  if (raw && typeof raw === 'object' && 'series_logged' in (raw as object)) {
    const c = raw as LibraryCareer
    return {
      series_logged: Number(c.series_logged) || 0,
      milestones_unlocked: Array.isArray(c.milestones_unlocked) ? c.milestones_unlocked : [],
    }
  }
  return { series_logged: 0, milestones_unlocked: [] }
}

function isPassValid(
  profile: Partial<UserProfile>,
  card: UserInventoryRow | null,
): boolean {
  if (profile.library_subscription_active === true) return true
  if (!card || card.state !== 'active') return false
  const exp = card.metadata?.expires_at
  if (!exp) return true
  return new Date(exp).getTime() > Date.now()
}

export function resolveMembershipStage(
  profile: Partial<UserProfile> | null,
  card: UserInventoryRow | null,
  seriesCount: number,
  isAuthenticated: boolean,
): MembershipStatus {
  const career = parseCareer(profile?.library_career)
  const careerCalc = computeCareerProgress(career, seriesCount)
  const milestoneFx = applyMilestoneUnlocks(careerCalc.unlocked)

  const role = (profile?.role as UserRole) || (isAuthenticated ? 'user' : 'guest')
  const hasValidPass = isPassValid(profile ?? {}, card)
  const hasProgram =
    profile?.program_access === true || profile?.purchase_type === 'program_download'
  const isVip = role === 'vip' || card?.metadata?.card_overlay === 'vip'
  const isSuperUser = role === 'super_user'
  const superUserEligible =
    profile?.super_user_eligible === true || milestoneFx.superUserEligible === true

  let stage: MembershipStage = 'guest'
  if (!isAuthenticated) {
    stage = 'guest'
  } else if (isSuperUser) {
    stage = 'super_user'
  } else if (isVip) {
    stage = 'vip'
  } else if (hasProgram && hasValidPass) {
    stage = 'app_owner'
  } else if (hasProgram) {
    stage = 'app_owner'
  } else if (hasValidPass) {
    stage = 'pass_holder'
  } else if (isAuthenticated) {
    stage = 'guest'
  }

  return {
    stage,
    role,
    isGuest: !isAuthenticated || !hasValidPass,
    hasValidPass,
    hasProgram,
    isVip,
    isSuperUser,
    superUserEligible,
    careerPercent: careerCalc.percent,
    nextStageLabel: nextStageHint(stage),
    admissionCard: card,
    subscriptionEndDate: profile?.subscription_end_date ?? card?.metadata?.expires_at ?? null,
    cancelAtPeriodEnd:
      profile?.subscription_cancel_at_period_end === true ||
      card?.metadata?.cancel_at_period_end === true,
  }
}

export function canAccessMemberLibrary(status: MembershipStatus): boolean {
  return status.hasValidPass || status.isVip || status.isSuperUser
}
