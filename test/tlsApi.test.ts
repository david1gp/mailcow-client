import { afterEach, describe, expect, mock, test } from "bun:test"
import { mailcowClientConfig } from "../src/client/mailcowClientConfig.js"
import { mtaStsAdd } from "../src/tls/mtaStsAdd.js"
import { mtaStsEdit } from "../src/tls/mtaStsEdit.js"
import { tlsPolicyMapAdd } from "../src/tls/tlsPolicyMapAdd.js"
import { tlsPolicyMapDelete } from "../src/tls/tlsPolicyMapDelete.js"
import { tlsPolicyMapEdit } from "../src/tls/tlsPolicyMapEdit.js"
import { tlsPolicyMapGet } from "../src/tls/tlsPolicyMapGet.js"
import { tlsPolicyMapList } from "../src/tls/tlsPolicyMapList.js"

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

describe("tlsApi", () => {
  const originalFetch = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  test("tlsPolicyMapAdd POSTs raw attr object top-level", async () => {
    okEnvelope()

    const r = await tlsPolicyMapAdd({
      config: testConfig(),
      attr: { dest: "example.com", policy: "encrypt", active: "1" },
    })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/add/tls-policy-map`)
    expect(init.method).toBe("POST")
    expect(JSON.parse(init.body as string)).toEqual({ dest: "example.com", policy: "encrypt", active: "1" })
  })

  test("tlsPolicyMapAdd maps envelope danger to ResultErr with op", async () => {
    okEnvelope([{ type: "danger", msg: "tls_policy_map_dest_invalid" }])

    const r = await tlsPolicyMapAdd({ config: testConfig(), attr: { dest: ".", policy: "encrypt" } })
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(r.op).toBe("tlsPolicyMapAdd")
      expect(r.errorMessage).toContain("tls_policy_map_dest_invalid")
    }
  })

  test("tlsPolicyMapAdd rejects invalid options with op", async () => {
    const r = await tlsPolicyMapAdd({ config: testConfig(), attr: { dest: "x" } } as never)
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("tlsPolicyMapAdd")
  })

  test("tlsPolicyMapList GETs /get/tls-policy-map/all and normalizes {} to []", async () => {
    globalThis.fetch = mock(async () => new Response("{}", { status: 200 })) as unknown as typeof fetch

    const r = await tlsPolicyMapList({ config: testConfig() })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual([])

    const [url] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/get/tls-policy-map/all`)
  })

  test("tlsPolicyMapGet GETs /get/tls-policy-map/{id}", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify({ id: 1, dest: "example.com", policy: "encrypt" }), { status: 200 })
    }) as unknown as typeof fetch

    const r = await tlsPolicyMapGet({ config: testConfig(), id: 1 })
    expect(r.success).toBe(true)

    const [url] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/get/tls-policy-map/1`)
  })

  test("tlsPolicyMapEdit POSTs {attr, items}", async () => {
    okEnvelope()

    const r = await tlsPolicyMapEdit({ config: testConfig(), items: [1], attr: { policy: "may" } })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/edit/tls-policy-map`)
    expect(JSON.parse(init.body as string)).toEqual({ attr: { policy: "may" }, items: [1] })
  })

  test("tlsPolicyMapDelete POSTs the raw items array", async () => {
    okEnvelope()

    const r = await tlsPolicyMapDelete({ config: testConfig(), items: [1] })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/delete/tls-policy-map`)
    expect(JSON.parse(init.body as string)).toEqual([1])
  })

  test("mtaStsAdd POSTs /add/mta-sts with stsv1 version", async () => {
    okEnvelope()

    const r = await mtaStsAdd({
      config: testConfig(),
      attr: { domain: "example.com", version: "stsv1", mode: "enforce", max_age: 86400 },
    })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/add/mta-sts`)
    expect(JSON.parse(init.body as string)).toEqual({
      domain: "example.com",
      version: "stsv1",
      mode: "enforce",
      max_age: 86400,
    })
  })

  test("mtaStsAdd rejects a non-stsv1 version with op", async () => {
    okEnvelope()

    const r = await mtaStsAdd({
      config: testConfig(),
      attr: { domain: "example.com", version: "stsv2", mode: "enforce", max_age: 86400 },
    } as never)
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("mtaStsAdd")
  })

  test("mtaStsEdit POSTs {attr, items} with domain items", async () => {
    okEnvelope()

    const r = await mtaStsEdit({ config: testConfig(), items: ["example.com"], attr: { mode: "testing" } })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/edit/mta-sts`)
    expect(JSON.parse(init.body as string)).toEqual({ attr: { mode: "testing" }, items: ["example.com"] })
  })

  test("mtaStsEdit rejects a non-stsv1 version with op", async () => {
    okEnvelope()

    const r = await mtaStsEdit({
      config: testConfig(),
      items: ["example.com"],
      attr: { version: "stsv2" },
    } as never)
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("mtaStsEdit")
  })
})
