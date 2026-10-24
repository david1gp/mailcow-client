import { createResultError, type Result } from "#result"
import type { MailcowClientConfig } from "./mailcowClientConfigSchema.js"
import { mailcowClientConfig } from "./mailcowClientConfig.js"

/**
 * Load mailcow client config from process.env (Bun auto-loads `.env` into process.env).
 *
 * - `MAILCOW_BASE_URL` (required) — instance root, e.g. `https://email.contentoren.de`
 * - `MAILCOW_API_KEY` (optional in the schema, required by mailcow in practice)
 * - `MAILCOW_TIMEOUT_MS` (optional)
 * - `MAILCOW_RETRIES` (optional)
 */
export function mailcowClientFromEnv(
  env: Record<string, string | undefined> = process.env,
): Result<MailcowClientConfig> {
  const op = "mailcowClientFromEnv"
  const baseUrl = env.MAILCOW_BASE_URL
  if (!baseUrl) {
    return createResultError(op, "MAILCOW_BASE_URL is required")
  }

  const timeoutRaw = env.MAILCOW_TIMEOUT_MS
  const retriesRaw = env.MAILCOW_RETRIES
  const timeoutMs = timeoutRaw !== undefined && timeoutRaw !== "" ? Number(timeoutRaw) : undefined
  const retries = retriesRaw !== undefined && retriesRaw !== "" ? Number(retriesRaw) : undefined

  return mailcowClientConfig({
    baseUrl,
    apiKey: env.MAILCOW_API_KEY || undefined,
    timeoutMs: timeoutMs !== undefined && !Number.isNaN(timeoutMs) ? timeoutMs : undefined,
    retries: retries !== undefined && !Number.isNaN(retries) ? retries : undefined,
  })
}
