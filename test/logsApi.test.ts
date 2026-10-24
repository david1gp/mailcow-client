import { afterEach, describe, expect, mock, test } from "bun:test"
import { mailcowClientConfig } from "../src/client/mailcowClientConfig.js"
import { logList } from "../src/logs/logList.js"
import { rspamdStatsGet } from "../src/logs/rspamdStatsGet.js"

const baseUrl = "https://mail.example.com"

function testConfig() {
  const r = mailcowClientConfig({ baseUrl, apiKey: "secret" })
  if (!r.success) throw new Error("config must parse")
  return r.data
}

function lastCall() {
  const calls = (globalThis.fetch as unknown as ReturnType<typeof mock>).mock.calls
  return calls[calls.length - 1] as [string, RequestInit]
}

describe("logsApi", () => {
  const originalFetch = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  test("logList fetches a service log without count", async () => {
    globalThis.fetch = mock(
      async () => new Response(JSON.stringify(["line one", "line two"]), { status: 200 }),
    ) as unknown as typeof fetch

    const r = await logList({ config: testConfig(), service: "postfix" })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual(["line one", "line two"])

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/get/logs/postfix`)
    expect(init.method).toBe("GET")
  })

  test("logList appends the count segment", async () => {
    globalThis.fetch = mock(
      async () => new Response(JSON.stringify(["only line"]), { status: 200 }),
    ) as unknown as typeof fetch

    const r = await logList({ config: testConfig(), service: "dovecot", count: 5 })
    expect(r.success).toBe(true)

    const [url] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/get/logs/dovecot/5`)
  })

  test("logList normalizes '{}' to []", async () => {
    globalThis.fetch = mock(async () => new Response("{}", { status: 200 })) as unknown as typeof fetch

    const r = await logList({ config: testConfig(), service: "api" })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual([])
  })

  test("logList rejects an unknown service with op", async () => {
    const r = await logList({ config: testConfig(), service: "unknown-svc" } as never)
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("logList")
  })

  test("rspamdStatsGet returns the stats object", async () => {
    globalThis.fetch = mock(
      async () => new Response(JSON.stringify({ scanned: 42 }), { status: 200 }),
    ) as unknown as typeof fetch

    const r = await rspamdStatsGet({ config: testConfig() })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual({ scanned: 42 })

    const [url] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/get/logs/rspamd-stats`)
  })
})
