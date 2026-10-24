import { mailcowClientConfig } from "../dist/client/mailcowClientConfig.js"
import type { MailcowClientConfig } from "../dist/client/mailcowClientConfigSchema.js"
import { mailcowE2eFetchCreate } from "./mailcowE2eFetchCreate.js"

const queuedFetch = mailcowE2eFetchCreate()
let fetchInstalled = false

function mailcowE2eFetchInstall(): void {
  if (fetchInstalled) return
  const originalFetch = globalThis.fetch
  const tracedFetch: typeof globalThis.fetch = async (input, init) => {
    const response = await queuedFetch(input, init)
    const rawUrl = typeof input === "string" ? input : input instanceof URL ? input.href : input.url
    const path = new URL(rawUrl).pathname
    console.info(`Live E2E endpoint outcome: ${init?.method ?? "GET"} ${path} -> HTTP ${response.status}`)
    return response
  }
  globalThis.fetch = tracedFetch
  void originalFetch
  fetchInstalled = true
}

export function mailcowE2eSetup(): MailcowClientConfig {
  const baseUrl = Bun.env.MAILCOW_BASE_URL?.trim()
  if (!baseUrl) {
    throw new Error("MAILCOW_BASE_URL is required for live E2E; add it to .env before running bun run test:e2e")
  }
  const apiKey = Bun.env.MAILCOW_API_KEY?.trim()
  if (!apiKey) {
    throw new Error("MAILCOW_API_KEY is required for live E2E; add it to .env before running bun run test:e2e")
  }

  mailcowE2eFetchInstall()

  const configured = mailcowClientConfig({ baseUrl, apiKey, timeoutMs: 30_000, retries: 0 })
  if (!configured.success) throw new Error("Unable to initialize the live mailcow E2E config")
  return configured.data
}
