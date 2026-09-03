import { authApi, type UserResponse } from '../api/client'

let cachedUser: UserResponse | null = null
let inflight: Promise<UserResponse> | null = null

export function getCachedUser() {
  return cachedUser
}

export async function fetchCurrentUser(force = false) {
  if (cachedUser && !force) {
    return cachedUser
  }
  if (inflight) {
    return inflight
  }

  inflight = authApi
    .me()
    .then(({ data }) => {
      cachedUser = data
      return data
    })
    .finally(() => {
      inflight = null
    })

  return inflight
}

export function clearSession() {
  cachedUser = null
  inflight = null
  localStorage.removeItem('access_token')
}
