import { afterEach, describe, expect, mock, test } from "bun:test"
import { mailcowClientConfig } from "../src/client/mailcowClientConfig.js"
import { dkimAdd } from "../src/dkim/dkimAdd.js"
import { dkimDelete } from "../src/dkim/dkimDelete.js"
import { dkimDuplicateAdd } from "../src/dkim/dkimDuplicateAdd.js"
import { dkimGet } from "../src/dkim/dkimGet.js"
import { dkimImportAdd } from "../src/dkim/dkimImportAdd.js"

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

function okEnvelope(body: unknown = [{ type: "success", msg: ["dkim_added", "example.com"] }]) {
  globalThis.fetch = mock(async () => new Response(JSON.stringify(body), { status: 200 })) as unknown as typeof fetch
}

describe("dkimApi", () => {
  const originalFetch = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  test("dkimAdd POSTs raw attr top-level", async () => {
    okEnvelope()

    const r = await dkimAdd({
      config: testConfig(),
      attr: { domains: "example.com", dkim_selector: "dkim", key_size: 2048 },
    })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/add/dkim`)
    expect(init.method).toBe("POST")
    expect(JSON.parse(init.body as string)).toEqual({ domains: "example.com", dkim_selector: "dkim", key_size: 2048 })
  })

  test("dkimAdd maps envelope danger to ResultErr with op", async () => {
    okEnvelope([{ type: "danger", msg: ["dkim_domain_or_sel_invalid", "example.com"] }])

    const r = await dkimAdd({ config: testConfig(), attr: { domains: "example.com" } })
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(r.op).toBe("dkimAdd")
      expect(r.errorMessage).toContain("dkim_domain_or_sel_invalid")
    }
  })

  test("dkimDuplicateAdd POSTs /add/dkim_duplicate", async () => {
    okEnvelope([{ type: "success", msg: ["dkim_duplicated", "a.test", "b.test"] }])

    const r = await dkimDuplicateAdd({
      config: testConfig(),
      attr: { from_domain: "a.test", to_domain: "b.test" },
    })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/add/dkim_duplicate`)
    expect(JSON.parse(init.body as string)).toEqual({ from_domain: "a.test", to_domain: "b.test" })
  })

  test("dkimImportAdd POSTs the key string as private_key_file", async () => {
    okEnvelope()

    const r = await dkimImportAdd({
      config: testConfig(),
      attr: { domain: "example.com", private_key_file: "-----BEGIN PRIVATE KEY-----\n..." },
    })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/add/dkim_import`)
    expect(JSON.parse(init.body as string)).toEqual({
      domain: "example.com",
      private_key_file: "-----BEGIN PRIVATE KEY-----\n...",
    })
  })

  test("dkimGet GETs /get/dkim/{domain}", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify({ pubkey: "abc", length: "2048", dkim_txt: "v=DKIM1..." }), { status: 200 })
    }) as unknown as typeof fetch

    const r = await dkimGet({ config: testConfig(), domain: "example.com" })
    expect(r.success).toBe(true)

    const [url] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/get/dkim/example.com`)
  })

  test("dkimDelete POSTs the raw domain items array", async () => {
    okEnvelope([{ type: "success", msg: ["dkim_removed", "example.com"] }])

    const r = await dkimDelete({ config: testConfig(), items: ["example.com"] })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/delete/dkim`)
    expect(JSON.parse(init.body as string)).toEqual(["example.com"])
  })
})
