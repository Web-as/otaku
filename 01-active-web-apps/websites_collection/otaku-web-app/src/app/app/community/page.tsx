// Server component — prevents static prerendering for this route
// The CommunityHub dependency chain uses window/localStorage at module evaluation time
export const dynamic = 'force-dynamic';

import CommunityClient from './client';

export default function Page() {
  return <CommunityClient />;
}
