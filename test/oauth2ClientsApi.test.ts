import { afterEach, describe, expect, mock, test } from "bun:test"
import { mailcowClientConfig } from "../src/client/mailcowClientConfig.js"
import { oauth2ClientAdd } from "../src/oauth2Clients/oauth2ClientAdd.js"
import { oauth2ClientDelete } from "../src/oauth2Clients/oauth2ClientDelete.js"
import { oauth2ClientEdit } from "../src/oauth2Clients/oauth2ClientEdit.js"
import { oauth2ClientGet } from "../src/oauth2Clients/oauth2ClientGet.js"
import { oauth2ClientList } from "../src/oauth2Clients/oauth2ClientList.js"

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

function okEnvelope(body: unknown = [{ type: "success", msg: ["Added client access"] }]) {
  globalThis.fetch = mock(async () => new Response(JSON.stringify(body), { status: 200 })) as unknown as typeof fetch
}

describe("oauth2ClientsApi", () => {
  const originalFetch = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  test("oauth2ClientAdd POSTs raw attr object top-level", async () => {
    okEnvelope()

    const r = await oauth2ClientAdd({ config: testConfig(), attr: { redirect_uri: "https://app.example.com/cb" } })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/add/oauth2-client`)
    expect(init.method).toBe("POST")
    expect((init.headers as Record<string, string>)["X-API-Key"]).toBe("secret")
    expect(JSON.parse(init.body as string)).toEqual({ redirect_uri: "https://app.example.com/cb" })
  })

  test("oauth2ClientAdd returns the envelope as-is without logging secrets", async () => {
    okEnvelope([{ type: "success", msg: ["Added client access", "id", "secret"] }])

    const r = await oauth2ClientAdd({ config: testConfig(), attr: { redirect_uri: "https://app.example.com/cb" } })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.join(" ")).toContain("Added client access")
  })

  test("oauth2ClientAdd maps envelope danger to ResultErr with op", async () => {
    okEnvelope([{ type: "danger", msg: "access_denied" }])

    const r = await oauth2ClientAdd({ config: testConfig(), attr: { redirect_uri: "https://app.example.com/cb" } })
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(r.op).toBe("oauth2ClientAdd")
      expect(r.errorMessage).toContain("access_denied")
    }
  })

  test("oauth2ClientAdd rejects invalid options with op", async () => {
    const r = await oauth2ClientAdd({ config: testConfig(), attr: {} } as never)
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("oauth2ClientAdd")
  })

  test("oauth2ClientList GETs /get/oauth2-client/all and normalizes {} to []", async () => {
    globalThis.fetch = mock(async () => new Response("{}", { status: 200 })) as unknown as typeof fetch

    const r = await oauth2ClientList({ config: testConfig() })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual([])

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/get/oauth2-client/all`)
    expect(init.method).toBe("GET")
  })

  test("oauth2ClientGet encodes the id path param", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify({ id: 2, redirect_uri: "https://app.example.com/cb" }), { status: 200 })
    }) as unknown as typeof fetch

    const r = await oauth2ClientGet({ config: testConfig(), id: 2 })
    expect(r.success).toBe(true)

    const [url] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/get/oauth2-client/2`)
  })

  test("oauth2ClientEdit POSTs {attr, items}", async () => {
    okEnvelope([{ type: "success", msg: ["object_modified", "2"] }])

    const r = await oauth2ClientEdit({
      config: testConfig(),
      items: [2],
      attr: { redirect_uri: "https://app.example.com/other" },
    })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/edit/oauth2-client`)
    expect(JSON.parse(init.body as string)).toEqual({
      attr: { redirect_uri: "https://app.example.com/other" },
      items: [2],
    })
  })

  test("oauth2ClientDelete POSTs the raw items array", async () => {
    okEnvelope()

    const r = await oauth2ClientDelete({ config: testConfig(), items: [2] })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/delete/oauth2-client`)
    expect(JSON.parse(init.body as string)).toEqual([2])
  })
})
