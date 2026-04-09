export const dynamic = 'force-dynamic'

import { getMembers, getPolls } from './actions'
import Dashboard from '@/components/Dashboard'

export default async function Home() {
  const members = await getMembers()
  const { activePolls, pastPolls } = await getPolls()

  return (
    <main>
      <Dashboard members={members} initialPolls={activePolls} pastPolls={pastPolls} />
    </main>
  )
}
