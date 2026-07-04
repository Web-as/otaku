'use client';



import React, { useEffect, useState } from 'react';

import { useMembership } from '@/hooks/useMembership';

import { fetchUserInventory } from '@/shared/membership/inventory';

import { useRealtimeInventory } from '@/shared/hooks/useRealtimeInventory';

import AdmissionCard from '@/components/membership/AdmissionCard';

import LibraryPassCTA from '@/components/membership/LibraryPassCTA';

import Card from '@/components/ui/Card';

import { QuestInventoryPanel } from '@/components/inventory/QuestInventoryPanel';

import '@/shared/styles/landing-anime.css';



type Tab = 'membership' | 'quest';



export default function InventoryPage() {

  const { uid, status, loading, runInventoryAction } = useMembership();

  const { inventory, syncStatus } = useRealtimeInventory(uid);

  const [items, setItems] = useState<Awaited<ReturnType<typeof fetchUserInventory>>>([]);

  const [busy, setBusy] = useState(false);

  const [tab, setTab] = useState<Tab>('membership');



  useEffect(() => {

    if (inventory.length) setItems(inventory);

    else if (uid) fetchUserInventory(uid).then(setItems).catch(console.error);

  }, [uid, status, inventory]);



  const syncLabel =

    syncStatus === 'connected' ? 'Live sync' : syncStatus === 'offline' ? 'Offline' : 'Syncing…';

  const syncColor =

    syncStatus === 'connected' ? 'text-emerald-400' : 'text-zinc-500';



  const onCardAction = async (action: string) => {

    if (!status?.admissionCard?.id) return;

    setBusy(true);

    try {

      await runInventoryAction(status.admissionCard.id, action);

    } finally {

      setBusy(false);

    }

  };



  if (loading) return <div className="p-8 text-gray-400">Loading inventory…</div>;



  return (

    <div className="max-w-4xl mx-auto p-6 space-y-6">

      <div className="flex flex-wrap items-center justify-between gap-2">

        <h1 className="text-3xl font-bold anime-display">Inventory</h1>

        <span className={`text-xs font-mono uppercase tracking-widest ${syncColor}`} aria-live="polite">

          {syncLabel}

        </span>

      </div>



      <div className="flex gap-2 border-b border-white/10 pb-2">

        {(['membership', 'quest'] as Tab[]).map((t) => (

          <button

            key={t}

            type="button"

            onClick={() => setTab(t)}

            className={`px-4 py-2 min-h-[44px] rounded-lg text-sm font-bold uppercase tracking-wide anime-focus-ring ${

              tab === t ? 'bg-violet-600 text-white' : 'text-zinc-400 hover:bg-white/5'

            }`}

          >

            {t === 'membership' ? 'Membership' : 'Quest items'}

          </button>

        ))}

      </div>



      {tab === 'quest' && uid ? (

        <div className="hud-panel p-6" data-tour-id="quest-inventory">

          <h2 className="anime-display text-lg font-bold mb-2">Hybrid MMO / D&D bag</h2>

          <p className="text-sm text-zinc-400 mb-4">

            Attunement, action economy, and fuzzy text commands — from advanced research blueprints.

          </p>

          <QuestInventoryPanel userId={uid} />

        </div>

      ) : null}



      {tab === 'membership' && (

        <>

          <p className="text-gray-400">Interactive items — use your admission card as your subscription key.</p>



          {status && !status.hasValidPass && (

            <LibraryPassCTA variant="inline" context="inventory" hasPass={status.hasValidPass} />

          )}



          {status?.admissionCard ? (

            <AdmissionCard status={status} onAction={onCardAction} busy={busy} />

          ) : status && !status.hasValidPass ? (

            <Card className="p-6 text-center text-gray-500 text-sm">

              No card yet — subscribe to mint your Library Admission Card here.

            </Card>

          ) : null}



          {items.length > 1 && (

            <Card>

              <h2 className="font-bold mb-3">Other items</h2>

              <ul className="space-y-2 text-sm text-gray-300">

                {items

                  .filter(i => i.item_catalog?.slug !== 'library_admission_card')

                  .map(i => (

                    <li key={i.id}>

                      {i.item_catalog?.name ?? i.id} — {i.state}

                    </li>

                  ))}

              </ul>

            </Card>

          )}

        </>

      )}

    </div>

  );

}


