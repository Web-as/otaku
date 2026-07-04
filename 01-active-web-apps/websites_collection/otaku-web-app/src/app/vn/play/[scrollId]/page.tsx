import { VnPlayClient } from '@/vn/components/VnPlayClient'

interface Props {
  params: Promise<{ scrollId: string }>
  searchParams: Promise<{ episode?: string; book?: string }>
}

export default async function VnPlayPage({ params, searchParams }: Props) {
  const { scrollId } = await params
  const sp = await searchParams
  const episode = sp.episode ? parseInt(sp.episode, 10) : 1
  const questBookId = sp.book ?? scrollId

  return (
    <VnPlayClient
      scrollId={scrollId}
      episodeNumber={episode}
      questBookId={questBookId}
    />
  )
}
