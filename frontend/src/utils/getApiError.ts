export const getApiError = (e: unknown): string => {
  const error = JSON.parse((e as Error).message) as Record<string, string>
  return `[${error.statusCode}] ${error.message}`
}
