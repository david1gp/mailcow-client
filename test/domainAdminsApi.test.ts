import { afterEach, describe, expect, mock, test } from "bun:test"
import { mailcowClientConfig } from "../src/client/mailcowClientConfig.js"
import { domainAdminAclEdit } from "../src/domainAdmins/domainAdminAclEdit.js"
import { domainAdminAdd } from "../src/domainAdmins/domainAdminAdd.js"
import { domainAdminDelete } from "../src/domainAdmins/domainAdminDelete.js"
import { domainAdminEdit } from "../src/domainAdmins/domainAdminEdit.js"
import { domainAdminGet } from "../src/domainAdmins/domainAdminGet.js"
import { domainAdminList } from "../src/domainAdmins/domainAdminList.js"
import { domainAdminSelfEdit } from "../src/domainAdmins/domainAdminSelfEdit.js"
import { domainAdminSsoAdd } from "../src/domainAdmins/domainAdminSsoAdd.js"

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

describe("domainAdminsApi", () => {
  const originalFetch = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  test("domainAdminAdd POSTs raw attr object top-level", async () => {
    okEnvelope([{ type: "success", msg: ["domain_admin_added", "da1"] }])

    const r = await domainAdminAdd({
      config: testConfig(),
      attr: { username: "da1", password: "pw", password2: "pw", domains: ["example.com"] },
    })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/add/domain-admin`)
    expect(init.method).toBe("POST")
    expect((init.headers as Record<string, string>)["X-API-Key"]).toBe("secret")
    expect(JSON.parse(init.body as string)).toEqual({
      username: "da1",
      password: "pw",
      password2: "pw",
      domains: ["example.com"],
    })
  })

  test("domainAdminAdd maps envelope danger to ResultErr with op", async () => {
    okEnvelope([{ type: "danger", msg: ["object_exists", "da1"] }])

    const r = await domainAdminAdd({
      config: testConfig(),
      attr: { username: "da1", password: "pw", password2: "pw", domains: ["example.com"] },
    })
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(r.op).toBe("domainAdminAdd")
      expect(r.errorMessage).toContain("object_exists")
    }
  })

  test("domainAdminAdd rejects invalid options with op", async () => {
    const r = await domainAdminAdd({ config: testConfig(), attr: { username: "da1" } } as never)
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("domainAdminAdd")
  })

  test("domainAdminList GETs /get/domain-admin/all and normalizes {} to []", async () => {
    globalThis.fetch = mock(async () => new Response("{}", { status: 200 })) as unknown as typeof fetch

    const r = await domainAdminList({ config: testConfig() })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual([])

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/get/domain-admin/all`)
    expect(init.method).toBe("GET")
  })

  test("domainAdminGet encodes the username path param", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify({ username: "da1" }), { status: 200 })
    }) as unknown as typeof fetch

    const r = await domainAdminGet({ config: testConfig(), username: "da1" })
    expect(r.success).toBe(true)

    const [url] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/get/domain-admin/da1`)
  })

  test("domainAdminEdit POSTs {attr, items}", async () => {
    okEnvelope()

    const r = await domainAdminEdit({ config: testConfig(), items: ["da1"], attr: { active: "1" } })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/edit/domain-admin`)
    expect(JSON.parse(init.body as string)).toEqual({ attr: { active: "1" }, items: ["da1"] })
  })

  test("domainAdminAclEdit POSTs {attr, items} with da_acl list", async () => {
    okEnvelope()

    const r = await domainAdminAclEdit({
      config: testConfig(),
      items: ["da1"],
      attr: { da_acl: ["syncjobs", "filters"] },
    })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/edit/da-acl`)
    expect(JSON.parse(init.body as string)).toEqual({ attr: { da_acl: ["syncjobs", "filters"] }, items: ["da1"] })
  })

  test("domainAdminSsoAdd returns the bare token payload without envelope mapping", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify({ token: "AAA-BBB" }), { status: 200 })
    }) as unknown as typeof fetch

    const r = await domainAdminSsoAdd({ config: testConfig(), attr: { username: "da1" } })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual({ token: "AAA-BBB" })

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/add/sso/domain-admin`)
    expect(init.method).toBe("POST")
    expect(JSON.parse(init.body as string)).toEqual({ username: "da1" })
  })

  test("domainAdminSelfEdit POSTs {attr} with no items", async () => {
    okEnvelope()

    const r = await domainAdminSelfEdit({
      config: testConfig(),
      attr: { user_new_pass: "n", user_new_pass2: "n" },
    })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/edit/self`)
    expect(JSON.parse(init.body as string)).toEqual({ attr: { user_new_pass: "n", user_new_pass2: "n" } })
  })

  test("domainAdminDelete POSTs the raw items array", async () => {
    okEnvelope()

    const r = await domainAdminDelete({ config: testConfig(), items: ["da1"] })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/delete/domain-admin`)
    expect(JSON.parse(init.body as string)).toEqual(["da1"])
  })
})
