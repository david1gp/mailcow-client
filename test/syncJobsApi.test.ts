import { afterEach, describe, expect, mock, test } from "bun:test"
import { mailcowClientConfig } from "../src/client/mailcowClientConfig.js"
import { syncJobAdd } from "../src/syncJobs/syncJobAdd.js"
import { syncJobDelete } from "../src/syncJobs/syncJobDelete.js"
import { syncJobEdit } from "../src/syncJobs/syncJobEdit.js"
import { syncJobGet } from "../src/syncJobs/syncJobGet.js"
import { syncJobList } from "../src/syncJobs/syncJobList.js"

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

describe("syncJobsApi", () => {
  const originalFetch = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  test("syncJobAdd POSTs raw attr object top-level", async () => {
    okEnvelope()

    const r = await syncJobAdd({
      config: testConfig(),
      attr: {
        username: "u@example.com",
        host1: "imap.example.com",
        port1: 993,
        user1: "u2@example.com",
        password1: "pw",
        mins_interval: 20,
      },
    })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/add/syncjob`)
    expect(init.method).toBe("POST")
    expect((init.headers as Record<string, string>)["X-API-Key"]).toBe("secret")
    expect(JSON.parse(init.body as string)).toEqual({
      username: "u@example.com",
      host1: "imap.example.com",
      port1: 993,
      user1: "u2@example.com",
      password1: "pw",
      mins_interval: 20,
      exclude: "",
      subfolder2: "",
      custom_params: "",
    })
  })

  test("syncJobAdd maps envelope danger to ResultErr with op", async () => {
    okEnvelope([{ type: "danger", msg: "access_denied" }])

    const r = await syncJobAdd({
      config: testConfig(),
      attr: {
        username: "u@example.com",
        host1: "imap.example.com",
        port1: 993,
        user1: "u2@example.com",
        password1: "pw",
        mins_interval: 20,
      },
    })
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(r.op).toBe("syncJobAdd")
      expect(r.errorMessage).toContain("access_denied")
    }
  })

  test("syncJobAdd rejects invalid options with op", async () => {
    const r = await syncJobAdd({ config: testConfig(), attr: { username: "u@example.com" } } as never)
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("syncJobAdd")
  })

  test("syncJobList GETs /get/syncjobs/all and normalizes {} to []", async () => {
    globalThis.fetch = mock(async () => new Response("{}", { status: 200 })) as unknown as typeof fetch

    const r = await syncJobList({ config: testConfig() })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual([])

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/get/syncjobs/all`)
    expect(init.method).toBe("GET")
  })

  test("syncJobGet GETs /get/syncjobs/{mailbox} without fields", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify([{ id: 1, user2: "u@example.com" }]), { status: 200 })
    }) as unknown as typeof fetch

    const r = await syncJobGet({ config: testConfig(), mailbox: "u@example.com" })
    expect(r.success).toBe(true)

    const [url] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/get/syncjobs/u%40example.com`)
  })

  test("syncJobGet appends fields CSV including opt-in with_password", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify([{ id: 1, password1: "pw" }]), { status: 200 })
    }) as unknown as typeof fetch

    const r = await syncJobGet({ config: testConfig(), mailbox: "u@example.com", fields: ["with_password"] })
    expect(r.success).toBe(true)

    const [url] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/get/syncjobs/u%40example.com/with_password`)
  })

  test("syncJobGet encodes fields so separators stay in-segment", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify([{ id: 1 }]), { status: 200 })
    }) as unknown as typeof fetch

    const r = await syncJobGet({ config: testConfig(), mailbox: "u@example.com", fields: ["with_password", "a/b"] })
    expect(r.success).toBe(true)

    const [url] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/get/syncjobs/u%40example.com/with_password,a%2Fb`)
  })

  test("syncJobEdit POSTs {attr, items}", async () => {
    okEnvelope()

    const r = await syncJobEdit({ config: testConfig(), items: [1], attr: { active: "0" } })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/edit/syncjob`)
    expect(JSON.parse(init.body as string)).toEqual({ attr: { active: "0" }, items: [1] })
  })

  test("syncJobDelete POSTs the raw items array", async () => {
    okEnvelope()

    const r = await syncJobDelete({ config: testConfig(), items: [1] })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/delete/syncjob`)
    expect(JSON.parse(init.body as string)).toEqual([1])
  })
})
