import { afterEach, describe, expect, mock, test } from "bun:test"
import { mailcowClientConfig } from "../src/client/mailcowClientConfig.js"
import { domainAdd } from "../src/domains/domainAdd.js"
import { domainDelete } from "../src/domains/domainDelete.js"
import { domainEdit } from "../src/domains/domainEdit.js"
import { domainFooterEdit } from "../src/domains/domainFooterEdit.js"
import { domainGet } from "../src/domains/domainGet.js"
import { domainList } from "../src/domains/domainList.js"
import { domainSearch } from "../src/domains/domainSearch.js"
import { domainTagDelete } from "../src/domains/domainTagDelete.js"
import { domainTemplateAdd } from "../src/domains/domainTemplateAdd.js"
import { domainTemplateDelete } from "../src/domains/domainTemplateDelete.js"
import { domainTemplateEdit } from "../src/domains/domainTemplateEdit.js"
import { domainTemplateGet } from "../src/domains/domainTemplateGet.js"
import { domainTemplateList } from "../src/domains/domainTemplateList.js"

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

describe("domainsApi", () => {
  const originalFetch = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  test("domainAdd POSTs raw attr object top-level", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify([{ type: "success", msg: ["domain_added", "example.com"] }]), {
        status: 200,
      })
    }) as unknown as typeof fetch

    const r = await domainAdd({ config: testConfig(), attr: { domain: "example.com", active: "1" } })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/add/domain`)
    expect(init.method).toBe("POST")
    expect((init.headers as Record<string, string>)["X-API-Key"]).toBe("secret")
    expect(JSON.parse(init.body as string)).toEqual({ domain: "example.com", active: "1" })
  })

  test("domainAdd maps envelope danger to ResultErr with op", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify([{ type: "danger", msg: ["object_exists", "example.com"] }]), {
        status: 200,
      })
    }) as unknown as typeof fetch

    const r = await domainAdd({ config: testConfig(), attr: { domain: "example.com" } })
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(r.op).toBe("domainAdd")
      expect(r.errorMessage).toContain("object_exists")
    }
  })

  test("domainAdd rejects invalid options with op", async () => {
    const r = await domainAdd({ config: testConfig(), attr: {} } as never)
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("domainAdd")
  })

  test("domainTemplateAdd POSTs /add/domain/template", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify([{ type: "success", msg: "Task completed" }]), { status: 200 })
    }) as unknown as typeof fetch

    const r = await domainTemplateAdd({ config: testConfig(), attr: { template: "default" } })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/add/domain/template`)
    expect(JSON.parse(init.body as string)).toEqual({ template: "default" })
  })

  test("domainList GETs /get/domain/all and normalizes {} to []", async () => {
    globalThis.fetch = mock(async () => new Response("{}", { status: 200 })) as unknown as typeof fetch

    const r = await domainList({ config: testConfig() })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual([])

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/get/domain/all`)
    expect(init.method).toBe("GET")
  })

  test("domainList passes tags as CSV query", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify([{ domain_name: "example.com" }]), { status: 200 })
    }) as unknown as typeof fetch

    const r = await domainList({ config: testConfig(), tags: ["a", "b"] })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data[0]?.domain_name).toBe("example.com")

    const [url] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/get/domain/all?tags=a%2Cb`)
  })

  test("domainTemplateList GETs /get/domain/template/all", async () => {
    globalThis.fetch = mock(async () => new Response("{}", { status: 200 })) as unknown as typeof fetch

    const r = await domainTemplateList({ config: testConfig() })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual([])

    const [url] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/get/domain/template/all`)
  })

  test("domainTemplateGet encodes the id path param", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify({ id: 3, template: "t" }), { status: 200 })
    }) as unknown as typeof fetch

    const r = await domainTemplateGet({ config: testConfig(), id: 3 })
    expect(r.success).toBe(true)

    const [url] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/get/domain/template/3`)
  })

  test("domainGet reads the live domain_name key", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify({ domain_name: "example.com" }), { status: 200 })
    }) as unknown as typeof fetch

    const r = await domainGet({ config: testConfig(), domain: "example.com" })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.domain_name).toBe("example.com")

    const [url] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/get/domain/example.com`)
  })

  test("domainEdit POSTs {attr, items}", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify([{ type: "success", msg: "Task completed" }]), { status: 200 })
    }) as unknown as typeof fetch

    const r = await domainEdit({ config: testConfig(), items: ["example.com"], attr: { active: "1" } })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/edit/domain`)
    expect(JSON.parse(init.body as string)).toEqual({ attr: { active: "1" }, items: ["example.com"] })
  })

  test("domainTemplateEdit POSTs /edit/domain/template", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify([{ type: "success", msg: "Task completed" }]), { status: 200 })
    }) as unknown as typeof fetch

    const r = await domainTemplateEdit({ config: testConfig(), items: [1], attr: { active: "0" } })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/edit/domain/template`)
    expect(JSON.parse(init.body as string)).toEqual({ attr: { active: "0" }, items: [1] })
  })

  test("domainFooterEdit POSTs /edit/domain/footer", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify([{ type: "success", msg: "Task completed" }]), { status: 200 })
    }) as unknown as typeof fetch

    const r = await domainFooterEdit({ config: testConfig(), items: ["example.com"], attr: { html: "<p>f</p>" } })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/edit/domain/footer`)
    expect(JSON.parse(init.body as string)).toEqual({ attr: { html: "<p>f</p>" }, items: ["example.com"] })
  })

  test("domainDelete POSTs the raw items array", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify([{ type: "success", msg: "Task completed" }]), { status: 200 })
    }) as unknown as typeof fetch

    const r = await domainDelete({ config: testConfig(), items: ["example.com"] })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/delete/domain`)
    expect(JSON.parse(init.body as string)).toEqual(["example.com"])
  })

  test("domainTemplateDelete POSTs raw items to /delete/domain/template", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify([{ type: "success", msg: "Task completed" }]), { status: 200 })
    }) as unknown as typeof fetch

    const r = await domainTemplateDelete({ config: testConfig(), items: [2] })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/delete/domain/template`)
    expect(JSON.parse(init.body as string)).toEqual([2])
  })

  test("domainTagDelete encodes domain and sends tag items array", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify([{ type: "success", msg: "Task completed" }]), { status: 200 })
    }) as unknown as typeof fetch

    const r = await domainTagDelete({ config: testConfig(), domain: "example.com", items: ["vip"] })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/delete/domain/tag/example.com`)
    expect(JSON.parse(init.body as string)).toEqual(["vip"])
  })

  test("domainSearch POSTs DataTables body to /search/domain", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify({ draw: 1, recordsTotal: 0, recordsFiltered: 0, data: [] }), { status: 200 })
    }) as unknown as typeof fetch

    const r = await domainSearch({ config: testConfig(), draw: 1, start: 0, length: 10 })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/search/domain`)
    expect(init.method).toBe("POST")
    expect(JSON.parse(init.body as string)).toEqual({ draw: 1, start: 0, length: 10 })
  })
})
