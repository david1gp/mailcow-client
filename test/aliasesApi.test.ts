import { afterEach, describe, expect, mock, test } from "bun:test"
import { mailcowClientConfig } from "../src/client/mailcowClientConfig.js"
import { aliasAdd } from "../src/aliases/aliasAdd.js"
import { aliasDelete } from "../src/aliases/aliasDelete.js"
import { aliasEdit } from "../src/aliases/aliasEdit.js"
import { aliasGet } from "../src/aliases/aliasGet.js"
import { aliasList } from "../src/aliases/aliasList.js"
import { timeLimitedAliasAdd } from "../src/aliases/timeLimitedAliasAdd.js"
import { timeLimitedAliasDelete } from "../src/aliases/timeLimitedAliasDelete.js"
import { timeLimitedAliasEdit } from "../src/aliases/timeLimitedAliasEdit.js"
import { timeLimitedAliasList } from "../src/aliases/timeLimitedAliasList.js"

const baseUrl = "https://mail.example.com"

function testConfig() {
  const r = mailcowClientConfig({ baseUrl, apiKey: "secret" })
  if (!r.success) throw new Error("config must parse")
  return r.data
}

function envelopeOk() {
  return new Response(JSON.stringify([{ type: "success", msg: "Task completed" }]), { status: 200 })
}

function lastCall() {
  const calls = (globalThis.fetch as unknown as ReturnType<typeof mock>).mock.calls
  return calls[calls.length - 1] as [string, RequestInit]
}

describe("aliasesApi", () => {
  const originalFetch = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  test("aliasAdd POSTs raw attr object top-level", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify([{ type: "success", msg: ["alias_added", "a@example.com"] }]), {
        status: 200,
      })
    }) as unknown as typeof fetch

    const r = await aliasAdd({ config: testConfig(), attr: { address: "a@example.com", goto: "j@example.com" } })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/add/alias`)
    expect(JSON.parse(init.body as string)).toEqual({ address: "a@example.com", goto: "j@example.com" })
  })

  test("aliasAdd rejects missing goto with op", async () => {
    const r = await aliasAdd({ config: testConfig(), attr: { address: "a@example.com" } } as never)
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("aliasAdd")
  })

  test("aliasList normalizes {} to [] and scopes domains", async () => {
    globalThis.fetch = mock(async () => new Response("{}", { status: 200 })) as unknown as typeof fetch

    const r = await aliasList({ config: testConfig(), domains: ["example.com"] })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual([])

    const [url] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/get/alias/all/example.com`)
  })

  test("aliasGet encodes the address", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify({ address: "a@example.com" }), { status: 200 })
    }) as unknown as typeof fetch

    const r = await aliasGet({ config: testConfig(), address: "a@example.com" })
    expect(r.success).toBe(true)

    const [url] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/get/alias/a%40example.com`)
  })

  test("aliasEdit POSTs {attr, items}", async () => {
    globalThis.fetch = mock(async () => envelopeOk()) as unknown as typeof fetch

    const r = await aliasEdit({ config: testConfig(), items: [7], attr: { active: "0" } })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/edit/alias`)
    expect(JSON.parse(init.body as string)).toEqual({ attr: { active: "0" }, items: [7] })
  })

  test("aliasDelete POSTs the raw items array", async () => {
    globalThis.fetch = mock(async () => envelopeOk()) as unknown as typeof fetch

    const r = await aliasDelete({ config: testConfig(), items: [7] })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/delete/alias`)
    expect(JSON.parse(init.body as string)).toEqual([7])
  })

  test("timeLimitedAliasAdd POSTs /add/time_limited_alias", async () => {
    globalThis.fetch = mock(async () => envelopeOk()) as unknown as typeof fetch

    const r = await timeLimitedAliasAdd({
      config: testConfig(),
      attr: { username: "jane", domain: "example.com", validity: "24" },
    })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/add/time_limited_alias`)
    expect(JSON.parse(init.body as string)).toEqual({ username: "jane", domain: "example.com", validity: "24" })
  })

  test("timeLimitedAliasList GETs /get/time_limited_aliases/{mailbox}", async () => {
    globalThis.fetch = mock(async () => new Response("{}", { status: 200 })) as unknown as typeof fetch

    const r = await timeLimitedAliasList({ config: testConfig(), mailbox: "jane@example.com" })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual([])

    const [url] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/get/time_limited_aliases/jane%40example.com`)
  })

  test("timeLimitedAliasEdit POSTs /edit/time_limited_alias", async () => {
    globalThis.fetch = mock(async () => envelopeOk()) as unknown as typeof fetch

    const r = await timeLimitedAliasEdit({
      config: testConfig(),
      items: ["tmp@example.com"],
      attr: { validity: "48" },
    })
    expect(r.success).toBe(true)

    const [url] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/edit/time_limited_alias`)
  })

  test("timeLimitedAliasDelete POSTs raw items", async () => {
    globalThis.fetch = mock(async () => envelopeOk()) as unknown as typeof fetch

    const r = await timeLimitedAliasDelete({ config: testConfig(), items: ["tmp@example.com"] })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/delete/time_limited_alias`)
    expect(JSON.parse(init.body as string)).toEqual(["tmp@example.com"])
  })

  test("aliasDelete maps envelope danger to ResultErr", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify([{ type: "danger", msg: "access_denied" }]), { status: 200 })
    }) as unknown as typeof fetch

    const r = await aliasDelete({ config: testConfig(), items: [7] })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("aliasDelete")
  })
})
