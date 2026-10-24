export function mailcowE2eRunId(): string {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "")
  const random = crypto.randomUUID().replaceAll("-", "").slice(0, 4)
  return `${date}-${random}`
}
