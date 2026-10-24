import { afterEach, describe, expect, mock, test } from "bun:test"
import { aliasDomainAdd } from "../src/aliasDomains/aliasDomainAdd.js"
import { aliasDomainDelete } from "../src/aliasDomains/aliasDomainDelete.js"
import { aliasDomainEdit } from "../src/aliasDomains/aliasDomainEdit.js"
import { aliasDomainGet } from "../src/aliasDomains/aliasDomainGet.js"
import { aliasDomainList } from "../src/aliasDomains/aliasDomainList.js"
import { mailcowClientConfig } from "../src/client/mailcowClientConfig.js"
import { resourceAdd } from "../src/resources/resourceAdd.js"
import { resourceDelete } from "../src/resources/resourceDelete.js"
import { resourceEdit } from "../src/resources/resourceEdit.js"
import { resourceGet } from "../src/resources/resourceGet.js"
import { resourceList } from "../src/resources/resourceList.js"

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

describe("aliasDomainsApi", () => {
  const originalFetch = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  test("aliasDomainAdd POSTs raw attr object top-level", async () => {
    globalThis.fetch = mock(async () => envelopeOk()) as unknown as typeof fetch

    const r = await aliasDomainAdd({
      config: testConfig(),
      attr: { alias_domain: "alias.example.com", target_domain: "example.com" },
    })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/add/alias-domain`)
    expect(JSON.parse(init.body as string)).toEqual({
      alias_domain: "alias.example.com",
      target_domain: "example.com",
    })
  })

  test("aliasDomainAdd rejects missing target_domain with op", async () => {
    const r = await aliasDomainAdd({ config: testConfig(), attr: { alias_domain: "a.example.com" } } as never)
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("aliasDomainAdd")
  })

  test("aliasDomainList normalizes {} to []", async () => {
    globalThis.fetch = mock(async () => new Response("{}", { status: 200 })) as unknown as typeof fetch

    const r = await aliasDomainList({ config: testConfig() })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual([])

    const [url] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/get/alias-domain/all`)
  })

  test("aliasDomainGet encodes the domain", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify({ alias_domain: "alias.example.com" }), { status: 200 })
    }) as unknown as typeof fetch

    const r = await aliasDomainGet({ config: testConfig(), domain: "alias.example.com" })
    expect(r.success).toBe(true)

    const [url] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/get/alias-domain/alias.example.com`)
  })

  test("aliasDomainEdit POSTs {attr, items}", async () => {
    globalThis.fetch = mock(async () => envelopeOk()) as unknown as typeof fetch

    const r = await aliasDomainEdit({
      config: testConfig(),
      items: ["alias.example.com"],
      attr: { active: "0" },
    })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/edit/alias-domain`)
    expect(JSON.parse(init.body as string)).toEqual({ attr: { active: "0" }, items: ["alias.example.com"] })
  })

  test("aliasDomainDelete POSTs the raw items array", async () => {
    globalThis.fetch = mock(async () => envelopeOk()) as unknown as typeof fetch

    const r = await aliasDomainDelete({ config: testConfig(), items: ["alias.example.com"] })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/delete/alias-domain`)
    expect(JSON.parse(init.body as string)).toEqual(["alias.example.com"])
  })
})

describe("resourcesApi", () => {
  const originalFetch = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  test("resourceAdd POSTs description (server derives name, attr.name is unread upstream)", async () => {
    globalThis.fetch = mock(async () => envelopeOk()) as unknown as typeof fetch

    const r = await resourceAdd({
      config: testConfig(),
      attr: { domain: "example.com", kind: "location", description: "Room 1" },
    })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/add/resource`)
    expect(JSON.parse(init.body as string)).toEqual({
      domain: "example.com",
      kind: "location",
      description: "Room 1",
    })
  })

  test("resourceAdd rejects missing kind with op", async () => {
    const r = await resourceAdd({ config: testConfig(), attr: { name: "room-1" } } as never)
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("resourceAdd")
  })

  test("resourceList normalizes {} to []", async () => {
    globalThis.fetch = mock(async () => new Response("{}", { status: 200 })) as unknown as typeof fetch

    const r = await resourceList({ config: testConfig() })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual([])

    const [url] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/get/resource/all`)
  })

  test("resourceGet encodes the name", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify({ name: "room 1" }), { status: 200 })
    }) as unknown as typeof fetch

    const r = await resourceGet({ config: testConfig(), name: "room 1" })
    expect(r.success).toBe(true)

    const [url] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/get/resource/room%201`)
  })

  test("resourceEdit POSTs {attr, items}", async () => {
    globalThis.fetch = mock(async () => envelopeOk()) as unknown as typeof fetch

    const r = await resourceEdit({ config: testConfig(), items: ["room-1"], attr: { active: "0" } })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/edit/resource`)
    expect(JSON.parse(init.body as string)).toEqual({ attr: { active: "0" }, items: ["room-1"] })
  })

  test("resourceDelete POSTs the raw items array and maps danger", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify([{ type: "danger", msg: "access_denied" }]), { status: 200 })
    }) as unknown as typeof fetch

    const r = await resourceDelete({ config: testConfig(), items: ["room-1"] })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("resourceDelete")
  })
})
