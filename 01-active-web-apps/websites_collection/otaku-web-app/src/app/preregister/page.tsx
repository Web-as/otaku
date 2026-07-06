import React from 'react';
import { supabaseAdmin } from '@/shared/supabase/admin';
import PreregisterClient from './PreregisterClient';

export const revalidate = 60; // Revalidate stats every minute

export default async function PreregisterPage() {
  // Fetch real stats from Supabase
  let emailCount = 0;
  let supporterCount = 0;

  if (supabaseAdmin) {
    try {
      // Get total pre-registrations (emails + supporters)
      const { count: totalEmails } = await supabaseAdmin
        .from('pre_registrations')
        .select('*', { count: 'exact', head: true });
        
      if (totalEmails !== null) emailCount = totalEmails;

      // Get supporters (Card Holders + Program Buyers)
      const { count: totalSupporters } = await supabaseAdmin
        .from('pre_registrations')
        .select('*', { count: 'exact', head: true })
        .neq('tier', 'email_only');

      if (totalSupporters !== null) supporterCount = totalSupporters;
    } catch (e) {
      console.warn('Could not fetch pre_registrations count. Did you run the SQL migration?');
    }
  }

  return (
    <PreregisterClient 
      initialEmailCount={emailCount} 
      initialSupporterCount={supporterCount} 
    />
  );
}
