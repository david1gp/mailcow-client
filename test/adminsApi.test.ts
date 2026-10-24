import { afterEach, describe, expect, mock, test } from "bun:test"
import { adminAdd } from "../src/admins/adminAdd.js"
import { adminDelete } from "../src/admins/adminDelete.js"
import { adminEdit } from "../src/admins/adminEdit.js"
import { adminGet } from "../src/admins/adminGet.js"
import { adminList } from "../src/admins/adminList.js"
import { mailcowClientConfig } from "../src/client/mailcowClientConfig.js"

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

describe("adminsApi", () => {
  const originalFetch = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  test("adminAdd POSTs raw attr object top-level", async () => {
    okEnvelope([{ type: "success", msg: ["admin_added", "root"] }])

    const r = await adminAdd({ config: testConfig(), attr: { username: "root", password: "pw", password2: "pw" } })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/add/admin`)
    expect(init.method).toBe("POST")
    expect((init.headers as Record<string, string>)["X-API-Key"]).toBe("secret")
    expect(JSON.parse(init.body as string)).toEqual({ username: "root", password: "pw", password2: "pw" })
  })

  test("adminAdd maps envelope danger to ResultErr with op", async () => {
    okEnvelope([{ type: "danger", msg: ["object_exists", "root"] }])

    const r = await adminAdd({ config: testConfig(), attr: { username: "root", password: "pw", password2: "pw" } })
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(r.op).toBe("adminAdd")
      expect(r.errorMessage).toContain("object_exists")
    }
  })

  test("adminAdd rejects invalid options with op", async () => {
    const r = await adminAdd({ config: testConfig(), attr: { username: "root" } } as never)
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("adminAdd")
  })

  test("adminList GETs /get/admin/all and normalizes {} to []", async () => {
    globalThis.fetch = mock(async () => new Response("{}", { status: 200 })) as unknown as typeof fetch

    const r = await adminList({ config: testConfig() })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual([])

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/get/admin/all`)
    expect(init.method).toBe("GET")
  })

  test("adminGet encodes the username path param", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify({ username: "root" }), { status: 200 })
    }) as unknown as typeof fetch

    const r = await adminGet({ config: testConfig(), username: "root" })
    expect(r.success).toBe(true)

    const [url] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/get/admin/root`)
  })

  test("adminEdit POSTs {attr, items}", async () => {
    okEnvelope()

    const r = await adminEdit({ config: testConfig(), items: ["root"], attr: { active: "1" } })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/edit/admin`)
    expect(JSON.parse(init.body as string)).toEqual({ attr: { active: "1" }, items: ["root"] })
  })

  test("adminDelete POSTs the raw items array", async () => {
    okEnvelope()

    const r = await adminDelete({ config: testConfig(), items: ["root"] })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/delete/admin`)
    expect(JSON.parse(init.body as string)).toEqual(["root"])
  })
})
