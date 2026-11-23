import staticContent from '../mocks/getStaticContent.json'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function getApiErrorMessage(error: unknown): string {
  if (isRecord(error) && isRecord(error.response)) {
    const response = error.response
    const data = isRecord(response.data) ? response.data : null
    if (response.status === 429 || data?.status === 429) {
      return staticContent.error.rateLimitMessage
    }

    if (typeof data?.error === 'string' && data.error.trim() !== '') {
      return data.error
    }
    if (typeof data?.message === 'string' && data.message.trim() !== '') {
      return data.message
    }
  }

  return error instanceof Error ? error.message : 'Unknown error'
}
