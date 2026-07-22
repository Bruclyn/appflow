export interface GitHubUser {
  login: string
  name: string | null
  avatar_url: string
  html_url: string
  bio: string | null
  public_repos: number
  followers: number
  following: number
}

export interface GitHubRepo {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  language: string | null
  stargazers_count: number
  forks_count: number
  watchers_count: number
  open_issues_count: number
  topics: string[]
  fork: boolean
  archived: boolean
  created_at: string
  updated_at: string
  pushed_at: string
}

const GITHUB_API = 'https://api.github.com'
const GITHUB_OAUTH_AUTHORIZE = 'https://github.com/login/oauth/authorize'
const GITHUB_OAUTH_TOKEN = 'https://github.com/login/oauth/access_token'

async function githubFetch<T>(accessToken: string, path: string): Promise<T> {
  const res = await fetch(`${GITHUB_API}${path}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'AppFlow',
    },
  })

  if (res.status === 401) {
    throw new Error('GitHub authorization failed. Please reconnect your account.')
  }
  if (res.status === 403 && res.headers.get('x-ratelimit-remaining') === '0') {
    throw new Error('GitHub API rate limit exceeded. Please try again later.')
  }
  if (!res.ok) {
    throw new Error(`GitHub API error (${res.status})`)
  }

  return res.json() as Promise<T>
}

export async function fetchUserProfile(accessToken: string): Promise<GitHubUser> {
  return githubFetch<GitHubUser>(accessToken, '/user')
}

export async function fetchUserRepositories(
  accessToken: string,
): Promise<GitHubRepo[]> {
  return githubFetch<GitHubRepo[]>(
    accessToken,
    '/user/repos?sort=updated&per_page=50&affiliation=owner',
  )
}

export async function fetchRepositoryLanguages(
  accessToken: string,
  owner: string,
  repo: string,
): Promise<Record<string, number>> {
  return githubFetch<Record<string, number>>(
    accessToken,
    `/repos/${owner}/${repo}/languages`,
  )
}

/** Build the GitHub OAuth authorize URL (pure — safe to unit test). */
export function buildGitHubAuthorizeUrl(
  clientId: string,
  state: string,
  redirectUri: string,
): string {
  const params = new URLSearchParams({
    client_id: clientId,
    scope: 'read:user,repo',
    state,
    redirect_uri: redirectUri,
    allow_signup: 'true',
  })
  return `${GITHUB_OAUTH_AUTHORIZE}?${params.toString()}`
}

/** Exchange an OAuth code for an access token. */
export async function exchangeCodeForToken(
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string,
): Promise<string> {
  const res = await fetch(GITHUB_OAUTH_TOKEN, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': 'AppFlow',
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    }),
  })

  if (!res.ok) {
    throw new Error('Failed to exchange the GitHub code for an access token.')
  }

  const data = (await res.json()) as {
    access_token?: string
    error_description?: string
    error?: string
  }
  if (!data.access_token) {
    throw new Error(
      data.error_description ?? data.error ?? 'GitHub did not return an access token.',
    )
  }
  return data.access_token
}
