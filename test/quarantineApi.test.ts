import { afterEach, describe, expect, mock, test } from "bun:test"
import { mailcowClientConfig } from "../src/client/mailcowClientConfig.js"
import { qitemDelete } from "../src/quarantine/qitemDelete.js"
import { qitemEdit } from "../src/quarantine/qitemEdit.js"
import { quarantineGet } from "../src/quarantine/quarantineGet.js"
import { quarantineList } from "../src/quarantine/quarantineList.js"
import { quarantineSettingsEdit } from "../src/quarantine/quarantineSettingsEdit.js"

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

function okEnvelope(body: unknown = [{ type: "success", msg: ["ok"] }]) {
  globalThis.fetch = mock(async () => new Response(JSON.stringify(body), { status: 200 })) as unknown as typeof fetch
}

describe("quarantineApi", () => {
  const originalFetch = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  test("quarantineList GETs /get/quarantine/all and normalizes to []", async () => {
    globalThis.fetch = mock(async () => new Response("[]", { status: 200 })) as unknown as typeof fetch

    const r = await quarantineList({ config: testConfig() })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual([])

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/get/quarantine/all`)
    expect(init.method).toBe("GET")
  })

  test("quarantineGet GETs /get/quarantine/{id}", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify({ id: 3, qid: "Q1", subject: "hi" }), { status: 200 })
    }) as unknown as typeof fetch

    const r = await quarantineGet({ config: testConfig(), id: 3 })
    expect(r.success).toBe(true)

    const [url] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/get/quarantine/3`)
  })

  test("qitemEdit POSTs {attr, items} for release", async () => {
    okEnvelope()

    const r = await qitemEdit({ config: testConfig(), items: [3], attr: { action: "release" } })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/edit/qitem`)
    expect(JSON.parse(init.body as string)).toEqual({ attr: { action: "release" }, items: [3] })
  })

  test("qitemEdit rejects an invalid action with op", async () => {
    const r = await qitemEdit({ config: testConfig(), items: [3], attr: { action: "drop" } } as never)
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("qitemEdit")
  })

  test("quarantineSettingsEdit injects action settings into attr", async () => {
    okEnvelope()

    const r = await quarantineSettingsEdit({ config: testConfig(), attr: { retention_size: 100 } })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/edit/quarantine`)
    expect(JSON.parse(init.body as string)).toEqual({ attr: { retention_size: 100, action: "settings" } })
  })

  test("qitemDelete POSTs the raw items array", async () => {
    okEnvelope()

    const r = await qitemDelete({ config: testConfig(), items: [3] })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/delete/qitem`)
    expect(JSON.parse(init.body as string)).toEqual([3])
  })
})
