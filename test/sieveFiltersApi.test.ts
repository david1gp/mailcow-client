import { afterEach, describe, expect, mock, test } from "bun:test"
import { mailcowClientConfig } from "../src/client/mailcowClientConfig.js"
import { filterAdd } from "../src/sieveFilters/filterAdd.js"
import { filterDelete } from "../src/sieveFilters/filterDelete.js"
import { filterEdit } from "../src/sieveFilters/filterEdit.js"
import { filterList } from "../src/sieveFilters/filterList.js"
import { globalFilterAdd } from "../src/sieveFilters/globalFilterAdd.js"
import { globalFilterGet } from "../src/sieveFilters/globalFilterGet.js"
import { rspamdPresetList } from "../src/sieveFilters/rspamdPresetList.js"
import { sievePresetList } from "../src/sieveFilters/sievePresetList.js"

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

describe("sieveFiltersApi", () => {
  const originalFetch = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  test("filterAdd POSTs raw attr object top-level", async () => {
    okEnvelope()

    const r = await filterAdd({
      config: testConfig(),
      attr: { username: "u@example.com", filter_type: "prefilter", script_data: "require [];" },
    })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/add/filter`)
    expect(init.method).toBe("POST")
    expect(JSON.parse(init.body as string)).toEqual({
      username: "u@example.com",
      filter_type: "prefilter",
      script_data: "require [];",
    })
  })

  test("filterAdd rejects filter_type outside prefilter|postfilter with op", async () => {
    okEnvelope()

    const r = await filterAdd({
      config: testConfig(),
      attr: { username: "u@example.com", filter_type: "block", script_data: "require [];" },
    } as never)
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("filterAdd")
  })

  test("filterAdd maps envelope danger to ResultErr with op", async () => {
    okEnvelope([{ type: "danger", msg: "access_denied" }])

    const r = await filterAdd({
      config: testConfig(),
      attr: { username: "u@example.com", filter_type: "prefilter", script_data: "x" },
    })
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(r.op).toBe("filterAdd")
      expect(r.errorMessage).toContain("access_denied")
    }
  })

  test("filterAdd rejects invalid options with op", async () => {
    const r = await filterAdd({ config: testConfig(), attr: { username: "u@example.com" } } as never)
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("filterAdd")
  })

  test("globalFilterAdd POSTs /add/global-filter and rejects other filter_type values", async () => {
    okEnvelope([{ type: "success", msg: "global_filter_written" }])

    const r = await globalFilterAdd({
      config: testConfig(),
      attr: { filter_type: "prefilter", script_data: "require [];" },
    })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/add/global-filter`)
    expect(JSON.parse(init.body as string)).toEqual({ filter_type: "prefilter", script_data: "require [];" })

    const bad = await globalFilterAdd({
      config: testConfig(),
      attr: { filter_type: "other", script_data: "x" },
    } as never)
    expect(bad.success).toBe(false)
    if (!bad.success) expect(bad.op).toBe("globalFilterAdd")
  })

  test("filterList GETs /get/filters/all without mailbox and normalizes {} to []", async () => {
    globalThis.fetch = mock(async () => new Response("{}", { status: 200 })) as unknown as typeof fetch

    const r = await filterList({ config: testConfig() })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual([])

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/get/filters/all`)
    expect(init.method).toBe("GET")
  })

  test("filterList GETs /get/filters/{mailbox} with mailbox", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify([{ id: 1, username: "u@example.com" }]), { status: 200 })
    }) as unknown as typeof fetch

    const r = await filterList({ config: testConfig(), mailbox: "u@example.com" })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toHaveLength(1)

    const [url] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/get/filters/u%40example.com`)
  })

  test("globalFilterGet defaults to /get/global_filters/all", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify({ prefilter: "a", postfilter: "b" }), { status: 200 })
    }) as unknown as typeof fetch

    const r = await globalFilterGet({ config: testConfig() })
    expect(r.success).toBe(true)

    const [url] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/get/global_filters/all`)
  })

  test("globalFilterGet routes scope to /get/global_filters/{scope}", async () => {
    globalThis.fetch = mock(
      async () => new Response(JSON.stringify("require [];"), { status: 200 }),
    ) as unknown as typeof fetch

    const r = await globalFilterGet({ config: testConfig(), scope: "prefilter" })
    expect(r.success).toBe(true)

    const [url] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/get/global_filters/prefilter`)
  })

  test("sievePresetList GETs /get/presets/sieve and normalizes {} to []", async () => {
    globalThis.fetch = mock(async () => new Response("{}", { status: 200 })) as unknown as typeof fetch

    const r = await sievePresetList({ config: testConfig() })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual([])

    const [url] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/get/presets/sieve`)
  })

  test("rspamdPresetList GETs /get/presets/rspamd", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify([{ name: "x" }]), { status: 200 })
    }) as unknown as typeof fetch

    const r = await rspamdPresetList({ config: testConfig() })
    expect(r.success).toBe(true)

    const [url] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/get/presets/rspamd`)
  })

  test("filterEdit POSTs {attr, items}", async () => {
    okEnvelope()

    const r = await filterEdit({ config: testConfig(), items: [1], attr: { active: "0" } })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/edit/filter`)
    expect(JSON.parse(init.body as string)).toEqual({ attr: { active: "0" }, items: [1] })
  })

  test("filterDelete POSTs the raw items array", async () => {
    okEnvelope()

    const r = await filterDelete({ config: testConfig(), items: [1] })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/delete/filter`)
    expect(JSON.parse(init.body as string)).toEqual([1])
  })
})
