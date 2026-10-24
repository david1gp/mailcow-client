import type { Result } from "#result"
import type { MailcowClientConfig } from "../client/mailcowClientConfigSchema.js"
import { mailcowClientFromEnv } from "../client/mailcowClientFromEnv.js"
import type { CliConfigFlags } from "./cliConfigFlags.js"

/** Load config from env with optional flag overrides. */
export function cliConfigLoad(flags: CliConfigFlags = {}): Result<MailcowClientConfig> {
  const env: Record<string, string | undefined> = { ...process.env }
  if (flags.baseUrl !== undefined) env.MAILCOW_BASE_URL = flags.baseUrl
  if (flags.apiKey !== undefined) env.MAILCOW_API_KEY = flags.apiKey
  return mailcowClientFromEnv(env)
}
