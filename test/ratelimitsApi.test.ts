import { afterEach, describe, expect, mock, test } from "bun:test"
import { mailcowClientConfig } from "../src/client/mailcowClientConfig.js"
import { ratelimitDomainEdit } from "../src/ratelimits/ratelimitDomainEdit.js"
import { ratelimitDomainGet } from "../src/ratelimits/ratelimitDomainGet.js"
import { ratelimitDomainList } from "../src/ratelimits/ratelimitDomainList.js"
import { ratelimitHashDelete } from "../src/ratelimits/ratelimitHashDelete.js"
import { ratelimitMailboxEdit } from "../src/ratelimits/ratelimitMailboxEdit.js"
import { ratelimitMailboxGet } from "../src/ratelimits/ratelimitMailboxGet.js"
import { ratelimitMailboxList } from "../src/ratelimits/ratelimitMailboxList.js"

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

function okEnvelope(body: unknown = [{ type: "success", msg: ["rl_saved"] }]) {
  globalThis.fetch = mock(async () => new Response(JSON.stringify(body), { status: 200 })) as unknown as typeof fetch
}

describe("ratelimitsApi", () => {
  const originalFetch = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  test("ratelimitDomainList normalizes '{}' to []", async () => {
    globalThis.fetch = mock(async () => new Response("{}", { status: 200 })) as unknown as typeof fetch

    const r = await ratelimitDomainList({ config: testConfig() })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual([])

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/get/rl-domain/all`)
    expect(init.method).toBe("GET")
  })

  test("ratelimitDomainList returns rule entries", async () => {
    globalThis.fetch = mock(
      async () => new Response(JSON.stringify([{ rl_value: 10, rl_frame: "s", domain: "a.test" }]), { status: 200 }),
    ) as unknown as typeof fetch

    const r = await ratelimitDomainList({ config: testConfig() })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual([{ rl_value: 10, rl_frame: "s", domain: "a.test" }])
  })

  test("ratelimitDomainGet fetches one domain rule", async () => {
    globalThis.fetch = mock(
      async () => new Response(JSON.stringify({ rl_value: 5, rl_frame: "m" }), { status: 200 }),
    ) as unknown as typeof fetch

    const r = await ratelimitDomainGet({ config: testConfig(), domain: "a.test" })
    expect(r.success).toBe(true)

    const [url] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/get/rl-domain/a.test`)
  })

  test("ratelimitDomainEdit POSTs {attr, items}", async () => {
    okEnvelope()

    const r = await ratelimitDomainEdit({
      config: testConfig(),
      items: ["a.test"],
      attr: { rl_value: 10, rl_frame: "s" },
    })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/edit/rl-domain`)
    expect(JSON.parse(init.body as string)).toEqual({
      attr: { rl_value: 10, rl_frame: "s" },
      items: ["a.test"],
    })
  })

  test("ratelimitDomainEdit rejects an invalid rl_frame with op", async () => {
    const r = await ratelimitDomainEdit({
      config: testConfig(),
      items: ["a.test"],
      attr: { rl_frame: "fortnight" },
    } as never)
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("ratelimitDomainEdit")
  })

  test("ratelimitDomainEdit maps a danger envelope to err", async () => {
    okEnvelope([{ type: "danger", msg: ["rl_timeframe"] }])

    const r = await ratelimitDomainEdit({
      config: testConfig(),
      items: ["a.test"],
      attr: { rl_frame: "s" },
    })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("ratelimitDomainEdit")
  })

  test("ratelimitMailboxList normalizes '{}' to []", async () => {
    globalThis.fetch = mock(async () => new Response("{}", { status: 200 })) as unknown as typeof fetch

    const r = await ratelimitMailboxList({ config: testConfig() })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual([])

    const [url] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/get/rl-mbox/all`)
  })

  test("ratelimitMailboxGet fetches one mailbox rule", async () => {
    globalThis.fetch = mock(
      async () => new Response(JSON.stringify({ rl_value: 5, rl_frame: "h" }), { status: 200 }),
    ) as unknown as typeof fetch

    const r = await ratelimitMailboxGet({ config: testConfig(), mailbox: "u@a.test" })
    expect(r.success).toBe(true)

    const [url] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/get/rl-mbox/u%40a.test`)
  })

  test("ratelimitMailboxEdit POSTs {attr, items}", async () => {
    okEnvelope()

    const r = await ratelimitMailboxEdit({
      config: testConfig(),
      items: ["u@a.test"],
      attr: { rl_value: 3, rl_frame: "d" },
    })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/edit/rl-mbox`)
    expect(JSON.parse(init.body as string)).toEqual({
      attr: { rl_value: 3, rl_frame: "d" },
      items: ["u@a.test"],
    })
  })

  test("ratelimitHashDelete POSTs the bare items array and returns raw text", async () => {
    globalThis.fetch = mock(async () => new Response("1", { status: 200 })) as unknown as typeof fetch

    const r = await ratelimitHashDelete({ config: testConfig(), items: ["RLabc123"] })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toBe("1")

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/delete/rlhash`)
    expect(JSON.parse(init.body as string)).toEqual(["RLabc123"])
  })
})
