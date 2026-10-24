import { afterEach, describe, expect, mock, test } from "bun:test"
import { mailcowClientConfig } from "../src/client/mailcowClientConfig.js"
import { domainPolicyAdd } from "../src/spamPolicy/domainPolicyAdd.js"
import { domainPolicyBlList } from "../src/spamPolicy/domainPolicyBlList.js"
import { domainPolicyDelete } from "../src/spamPolicy/domainPolicyDelete.js"
import { domainPolicyWlList } from "../src/spamPolicy/domainPolicyWlList.js"
import { mailboxPolicyAdd } from "../src/spamPolicy/mailboxPolicyAdd.js"
import { mailboxPolicyBlList } from "../src/spamPolicy/mailboxPolicyBlList.js"
import { mailboxPolicyDelete } from "../src/spamPolicy/mailboxPolicyDelete.js"
import { mailboxPolicyWlList } from "../src/spamPolicy/mailboxPolicyWlList.js"
import { rspamdActionsGet } from "../src/spamPolicy/rspamdActionsGet.js"
import { rspamdMapEdit } from "../src/spamPolicy/rspamdMapEdit.js"
import { rsettingAdd } from "../src/spamPolicy/rsettingAdd.js"
import { rsettingDelete } from "../src/spamPolicy/rsettingDelete.js"
import { rsettingEdit } from "../src/spamPolicy/rsettingEdit.js"
import { rsettingGet } from "../src/spamPolicy/rsettingGet.js"
import { rsettingList } from "../src/spamPolicy/rsettingList.js"

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

describe("spamPolicyApi", () => {
  const originalFetch = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  test("domainPolicyAdd POSTs raw attr object top-level", async () => {
    okEnvelope()

    const r = await domainPolicyAdd({
      config: testConfig(),
      attr: { domain: "example.com", object_from: "*@spam.test", object_list: "bl" },
    })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/add/domain-policy`)
    expect(init.method).toBe("POST")
    expect(JSON.parse(init.body as string)).toEqual({
      domain: "example.com",
      object_from: "*@spam.test",
      object_list: "bl",
    })
  })

  test("domainPolicyAdd rejects an invalid object_list with op", async () => {
    const r = await domainPolicyAdd({
      config: testConfig(),
      attr: { domain: "example.com", object_from: "a", object_list: "xx" },
    } as never)
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("domainPolicyAdd")
  })

  test("mailboxPolicyAdd POSTs /add/mailbox-policy", async () => {
    okEnvelope()

    const r = await mailboxPolicyAdd({
      config: testConfig(),
      attr: { username: "u@example.com", object_from: "friend@test", object_list: "wl" },
    })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/add/mailbox-policy`)
    expect(JSON.parse(init.body as string)).toEqual({
      username: "u@example.com",
      object_from: "friend@test",
      object_list: "wl",
    })
  })

  test("domainPolicyWlList GETs /get/policy_wl_domain/{domain}", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify([{ object: "example.com", value: "a@test", prefid: 7 }]), { status: 200 })
    }) as unknown as typeof fetch

    const r = await domainPolicyWlList({ config: testConfig(), domain: "example.com" })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/get/policy_wl_domain/example.com`)
    expect(init.method).toBe("GET")
  })

  test("domainPolicyBlList GETs /get/policy_bl_domain/{domain}", async () => {
    globalThis.fetch = mock(async () => new Response("{}", { status: 200 })) as unknown as typeof fetch

    const r = await domainPolicyBlList({ config: testConfig(), domain: "example.com" })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual([])

    const [url] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/get/policy_bl_domain/example.com`)
  })

  test("mailboxPolicyWlList encodes the mailbox path param", async () => {
    globalThis.fetch = mock(async () => new Response("[]", { status: 200 })) as unknown as typeof fetch

    const r = await mailboxPolicyWlList({ config: testConfig(), mailbox: "u@example.com" })
    expect(r.success).toBe(true)

    const [url] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/get/policy_wl_mailbox/u%40example.com`)
  })

  test("mailboxPolicyBlList GETs /get/policy_bl_mailbox/{mailbox}", async () => {
    globalThis.fetch = mock(async () => new Response("[]", { status: 200 })) as unknown as typeof fetch

    const r = await mailboxPolicyBlList({ config: testConfig(), mailbox: "u@example.com" })
    expect(r.success).toBe(true)

    const [url] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/get/policy_bl_mailbox/u%40example.com`)
  })

  test("domainPolicyDelete POSTs the raw prefid items array", async () => {
    okEnvelope()

    const r = await domainPolicyDelete({ config: testConfig(), items: [7, 8] })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/delete/domain-policy`)
    expect(JSON.parse(init.body as string)).toEqual([7, 8])
  })

  test("mailboxPolicyDelete POSTs raw items to /delete/mailbox-policy", async () => {
    okEnvelope()

    const r = await mailboxPolicyDelete({ config: testConfig(), items: [9] })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/delete/mailbox-policy`)
    expect(JSON.parse(init.body as string)).toEqual([9])
  })

  test("rspamdActionsGet returns [action, count] pairs", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(
        JSON.stringify([
          ["reject", 3],
          ["no action", 10],
        ]),
        { status: 200 },
      )
    }) as unknown as typeof fetch

    const r = await rspamdActionsGet({ config: testConfig() })
    expect(r.success).toBe(true)
    if (r.success)
      expect(r.data).toEqual([
        ["reject", 3],
        ["no action", 10],
      ])

    const [url] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/get/rspamd/actions`)
  })

  test("rspamdActionsGet normalizes '{}' to []", async () => {
    globalThis.fetch = mock(async () => new Response("{}", { status: 200 })) as unknown as typeof fetch

    const r = await rspamdActionsGet({ config: testConfig() })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual([])
  })

  test("rspamdMapEdit POSTs {attr, items} with map names", async () => {
    okEnvelope()

    const r = await rspamdMapEdit({ config: testConfig(), items: ["blacklist"], attr: { rspamd_map_data: "a@test" } })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/edit/rspamd-map`)
    expect(JSON.parse(init.body as string)).toEqual({ attr: { rspamd_map_data: "a@test" }, items: ["blacklist"] })
  })

  test("rsettingAdd POSTs raw attr top-level", async () => {
    okEnvelope()

    const r = await rsettingAdd({ config: testConfig(), attr: { content: "x", desc: "d", active: "1" } })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/add/rsetting`)
    expect(JSON.parse(init.body as string)).toEqual({ content: "x", desc: "d", active: "1" })
  })

  test("rsettingList GETs /get/rsetting/all and normalizes {} to []", async () => {
    globalThis.fetch = mock(async () => new Response("{}", { status: 200 })) as unknown as typeof fetch

    const r = await rsettingList({ config: testConfig() })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual([])

    const [url] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/get/rsetting/all`)
  })

  test("rsettingGet GETs /get/rsetting/{id}", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify({ id: 1, desc: "d", content: "x", active: 1 }), { status: 200 })
    }) as unknown as typeof fetch

    const r = await rsettingGet({ config: testConfig(), id: 1 })
    expect(r.success).toBe(true)

    const [url] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/get/rsetting/1`)
  })

  test("rsettingEdit POSTs {attr, items}", async () => {
    okEnvelope()

    const r = await rsettingEdit({ config: testConfig(), items: [1], attr: { active: "0" } })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/edit/rsetting`)
    expect(JSON.parse(init.body as string)).toEqual({ attr: { active: "0" }, items: [1] })
  })

  test("rsettingDelete POSTs the raw items array", async () => {
    okEnvelope()

    const r = await rsettingDelete({ config: testConfig(), items: [1] })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/delete/rsetting`)
    expect(JSON.parse(init.body as string)).toEqual([1])
  })

  test("domainPolicyAdd maps envelope danger to ResultErr with op", async () => {
    okEnvelope([{ type: "danger", msg: "access_denied" }])

    const r = await domainPolicyAdd({
      config: testConfig(),
      attr: { domain: "example.com", object_from: "a", object_list: "wl" },
    })
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(r.op).toBe("domainPolicyAdd")
      expect(r.errorMessage).toContain("access_denied")
    }
  })
})
