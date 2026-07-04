import type { LibraryCareer, MembershipStage } from './types'

export type CareerMilestone = {
  id: string
  label: string
  description: string
  requiredSeries: number
  /** Optional: days as pass holder — checked server-side when available */
  requiresMemberDays?: number
  unlocks: {
    badge?: string
    cardOverlay?: 'super_visitor'
    superUserEligible?: boolean
    grantRole?: 'super_user'
  }
}

export const CAREER_MILESTONES: CareerMilestone[] = [
  {
    id: 'tracker_25',
    label: 'Shelf Starter',
    description: 'Log 25 series in your tracker.',
    requiredSeries: 25,
    unlocks: { badge: 'shelf_starter' },
  },
  {
    id: 'tracker_50',
    label: 'Archive Regular',
    description: 'Log 50 series — Librarian indexes your taste.',
    requiredSeries: 50,
    unlocks: { badge: 'archive_regular' },
  },
  {
    id: 'super_visitor',
    label: 'Super Visitor',
    description: '100 series logged — unlock Super Visitor card overlay.',
    requiredSeries: 100,
    unlocks: { cardOverlay: 'super_visitor', badge: 'super_visitor' },
  },
  {
    id: 'super_user_eligible',
    label: 'Super User Candidate',
    description: '150 series + deep career — eligible for Super User (earn only, never sold).',
    requiredSeries: 150,
    unlocks: { superUserEligible: true, badge: 'super_user_candidate' },
  },
]

export function computeCareerProgress(
  career: LibraryCareer,
  seriesCount: number,
): { percent: number; unlocked: string[]; next: CareerMilestone | null } {
  const unlocked: string[] = []
  let next: CareerMilestone | null = null

  for (const m of CAREER_MILESTONES) {
    if (seriesCount >= m.requiredSeries) {
      unlocked.push(m.id)
    } else if (!next) {
      next = m
    }
  }

  const target = next?.requiredSeries ?? CAREER_MILESTONES[CAREER_MILESTONES.length - 1].requiredSeries
  const prev = unlocked.length
    ? CAREER_MILESTONES.find(x => x.id === unlocked[unlocked.length - 1])!.requiredSeries
    : 0
  const span = Math.max(1, target - prev)
  const percent = next ? Math.min(100, Math.round(((seriesCount - prev) / span) * 100)) : 100

  return {
    percent,
    unlocked: [...new Set([...career.milestones_unlocked, ...unlocked])],
    next,
  }
}

export function applyMilestoneUnlocks(
  milestoneIds: string[],
): { cardOverlay?: 'super_visitor'; superUserEligible?: boolean } {
  const out: { cardOverlay?: 'super_visitor'; superUserEligible?: boolean } = {}
  for (const id of milestoneIds) {
    const m = CAREER_MILESTONES.find(x => x.id === id)
    if (!m) continue
    if (m.unlocks.cardOverlay) out.cardOverlay = m.unlocks.cardOverlay
    if (m.unlocks.superUserEligible) out.superUserEligible = true
  }
  return out
}

export function nextStageHint(stage: MembershipStage): string | null {
  const map: Partial<Record<MembershipStage, string | null>> = {
    guest: 'Get a Library Pass (€2.50/mo) to enter the member stacks.',
    pass_holder: 'Optional: buy the Archivist desktop app for offline tooling.',
    app_owner: 'Upgrade to VIP for flair — or keep tracking to earn Super Visitor.',
    vip: 'Keep logging anime — Super User is earn-only at 150+ series.',
    super_user: null,
  }
  return map[stage] ?? null
}
