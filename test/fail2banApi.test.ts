import { afterEach, describe, expect, mock, test } from "bun:test"
import { mailcowClientConfig } from "../src/client/mailcowClientConfig.js"
import { fail2banBanlistEdit } from "../src/fail2ban/fail2banBanlistEdit.js"
import { fail2banEdit } from "../src/fail2ban/fail2banEdit.js"
import { fail2banGet } from "../src/fail2ban/fail2banGet.js"

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

function okEnvelope(body: unknown = [{ type: "success", msg: ["f2b_modified"] }]) {
  globalThis.fetch = mock(async () => new Response(JSON.stringify(body), { status: 200 })) as unknown as typeof fetch
}

describe("fail2banApi", () => {
  const originalFetch = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  test("fail2banGet returns the fail2ban state object", async () => {
    globalThis.fetch = mock(
      async () =>
        new Response(JSON.stringify({ ban_time: 3600, whitelist: "", blacklist: "", active_bans: [], perm_bans: [] }), {
          status: 200,
        }),
    ) as unknown as typeof fetch

    const r = await fail2banGet({ config: testConfig() })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.ban_time).toBe(3600)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/get/fail2ban`)
    expect(init.method).toBe("GET")
  })

  test("fail2banEdit POSTs {attr, items} with the network", async () => {
    okEnvelope()

    const r = await fail2banEdit({
      config: testConfig(),
      items: ["1.2.3.0/24"],
      attr: { ban_time: 3600, max_attempts: 5 },
    })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/edit/fail2ban`)
    expect(JSON.parse(init.body as string)).toEqual({
      attr: { ban_time: 3600, max_attempts: 5 },
      items: ["1.2.3.0/24"],
    })
  })

  test("fail2banEdit maps a danger envelope to err", async () => {
    okEnvelope([{ type: "danger", msg: "access_denied" }])

    const r = await fail2banEdit({ config: testConfig(), items: ["1.2.3.0/24"], attr: {} })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("fail2banEdit")
  })

  test("fail2banBanlistEdit POSTs {items} with the banlist id", async () => {
    okEnvelope()

    const r = await fail2banBanlistEdit({ config: testConfig(), items: ["banlist-1"] })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/edit/fail2ban/banlist`)
    expect(JSON.parse(init.body as string)).toEqual({ items: ["banlist-1"] })
  })
})
