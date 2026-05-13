import { useQuery } from '@tanstack/react-query'
import { getRole, getSession } from './auth'
import { queryKeys } from './queryKeys'

export function useSessionQuery() {
  const query = useQuery({
    queryKey: queryKeys.session,
    queryFn: getSession,
    staleTime: Infinity,
  })

  const session = query.data ?? null
  const role = session ? getRole(session) : null

  return { ...query, session, role }
}
