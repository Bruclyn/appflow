interface ApiEnvelope<T> {
  success: boolean
  data?: T
  error?: string
}

/**
 * Client-side fetch helper for the `{ success, data | error }` API envelope.
 * Resolves with `data` on success, throws an `Error` with the server message
 * otherwise.
 */
export async function apiRequest<T>(
  method: string,
  url: string,
  body?: unknown,
): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  let json: ApiEnvelope<T> | null = null
  try {
    json = (await res.json()) as ApiEnvelope<T>
  } catch {
    // fall through to generic error below
  }

  if (!res.ok || !json?.success) {
    throw new Error(json?.error ?? 'Something went wrong. Please try again.')
  }

  return json.data as T
}
