const BASE_URL = '/api/v1'
const TOKEN_KEY = 'tt_token'

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
    this.name = 'ApiError'
  }
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

async function request(path, options = {}) {
  const { auth = true, headers, ...rest } = options

  const requestHeaders = {
    Accept: 'application/json',
    ...headers,
  }

  if (rest.body && typeof rest.body === 'string') {
    requestHeaders['Content-Type'] = 'application/json'
  }

  if (auth) {
    const token = getToken()
    if (token) requestHeaders.Authorization = `Bearer ${token}`
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...rest, headers: requestHeaders })

  if (res.status === 204) return undefined

  const isJson = res.headers.get('content-type')?.includes('application/json')
  const body = isJson ? await res.json().catch(() => ({})) : await res.text()

  if (!res.ok) {
    const message =
      body?.message ||
      (Array.isArray(body?.errors)
        ? Object.values(body.errors).flat().join(' • ')
        : `Erreur ${res.status}`)
    throw new ApiError(message, res.status)
  }

  return body
}

function unwrapList(body) {
  if (Array.isArray(body)) return body
  if (body && typeof body === 'object' && Array.isArray(body.data)) {
    return body.data
  }
  return []
}

function prepareBody(body) {
  if (body instanceof FormData) return body
  return JSON.stringify(body)
}

export const api = {
  request,
  get: (path, options) => request(path, { method: 'GET', ...options }),
  post: (path, body, options) =>
    request(path, { method: 'POST', body: body !== undefined ? prepareBody(body) : undefined, ...options }),
  patch: (path, body, options) =>
    request(path, { method: 'PATCH', body: body !== undefined ? prepareBody(body) : undefined, ...options }),
  del: (path, options) => request(path, { method: 'DELETE', ...options }),
  unwrapList,
}
