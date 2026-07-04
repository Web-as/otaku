import { QuestLogBuilder } from '@/vn/components/QuestLogBuilder'
import Link from 'next/link'

export default function VnBuilderPage() {
  return (
    <div className="min-h-screen bg-[#050508] text-white">
      <div className="border-b border-white/10 px-6 py-4 flex items-center gap-4">
        <Link href="/vn" className="text-sm text-gray-500 hover:text-white">← VN Hub</Link>
        <span className="text-xs uppercase tracking-widest text-amber-400">Campaign Builder</span>
      </div>
      <QuestLogBuilder />
    </div>
  )
}
