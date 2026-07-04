import { getSupabase, isSupabaseConfigured } from '../supabase/config'
import type { ItemCatalogRow, UserInventoryRow } from './types'

const CARD_SLUG = 'library_admission_card'

export async function fetchItemCatalog(): Promise<ItemCatalogRow[]> {
  if (!isSupabaseConfigured()) return []
  const supabase = getSupabase()
  const { data, error } = await supabase.from('item_catalog').select('*').order('slug')
  if (error) throw error
  return (data ?? []) as ItemCatalogRow[]
}

export async function fetchUserInventory(userId: string): Promise<UserInventoryRow[]> {
  if (!isSupabaseConfigured()) return []
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('user_inventory')
    .select('*, item_catalog(*)')
    .eq('user_id', userId)
    .order('acquired_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map(row => ({
    ...row,
    item_catalog: (row as { item_catalog?: ItemCatalogRow }).item_catalog,
  })) as UserInventoryRow[]
}

export async function fetchAdmissionCard(userId: string): Promise<UserInventoryRow | null> {
  const items = await fetchUserInventory(userId)
  return (
    items.find(
      i =>
        i.item_catalog?.slug === CARD_SLUG ||
        (i.metadata as { slug?: string })?.slug === CARD_SLUG,
    ) ?? null
  )
}

export async function getCatalogBySlug(slug: string): Promise<ItemCatalogRow | null> {
  if (!isSupabaseConfigured()) return null
  const supabase = getSupabase()
  const { data, error } = await supabase.from('item_catalog').select('*').eq('slug', slug).maybeSingle()
  if (error) throw error
  return data as ItemCatalogRow | null
}

export const LIBRARY_PASS_SLUG = CARD_SLUG
