'use client';

import React, { useEffect, useState } from 'react';
import NeonCubeInventory, { XRItem } from './NeonCubeInventory';
import { useSupabaseRealtime } from '@/hooks/useSupabaseRealtime';
import { useAuth } from '@/contexts/AuthContext';
import { gamificationAPI } from '@/services/api';
import { AlertCircle } from 'lucide-react';
import { getSupabase } from '@/shared/supabase/config';

export default function XRInventoryPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<XRItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useSupabaseRealtime({ 
    table: 'user_inventory',
    filter: user?.id ? `user_id=eq.${user.id}` : undefined
  }, () => {
    fetchInventory();
  });

  useEffect(() => {
    if (user) {
      fetchInventory();
    }
  }, [user]);

  // Re-fetch when real-time triggers a change
  // For production, we'd optimistically merge the payload from useSupabaseRealtime
  // But since we want to be sure, we just refetch the inventory list on any ping.
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    const channel = supabase
      .channel('inventory_ping')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_inventory' }, () => {
        fetchInventory();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchInventory = async () => {
    try {
      if (!user) return;
      
      const supabase = getSupabase();
      if (!supabase) throw new Error("Supabase client not initialized");
      
      const { data, error: dbError } = await supabase
        .from('user_inventory')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (dbError) throw dbError;
      
      // Map DB row to XRItem
      const xrItems: XRItem[] = (data || []).map((row: any) => ({
        id: row.item_id,
        name: row.name,
        description: row.description,
        rarity: row.rarity,
        quantity: row.quantity,
        model_glb_url: row.model_glb_url,
        model_usdz_url: row.model_usdz_url,
        image_url: row.image_url,
        asset_type: row.asset_type,
      }));
      
      setItems(xrItems);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleSendToXR = (item: XRItem) => {
    // In the future, this triggers a WebXR session or sends an event to the local engine
    alert(`Sending ${item.name} (${item.model_glb_url}) to XR Glasses...`);
  };

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg flex items-center gap-2">
        <AlertCircle className="w-5 h-5" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8">
      <NeonCubeInventory 
        items={items} 
        loading={loading} 
        onSendToXR={handleSendToXR} 
      />
    </div>
  );
}
