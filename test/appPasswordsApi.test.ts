import { afterEach, describe, expect, mock, test } from "bun:test"
import { appPasswordAdd } from "../src/appPasswords/appPasswordAdd.js"
import { appPasswordDelete } from "../src/appPasswords/appPasswordDelete.js"
import { appPasswordEdit } from "../src/appPasswords/appPasswordEdit.js"
import { appPasswordGet } from "../src/appPasswords/appPasswordGet.js"
import { appPasswordList } from "../src/appPasswords/appPasswordList.js"
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

function okEnvelope(body: unknown = [{ type: "success", msg: ["app_passwd_added"] }]) {
  globalThis.fetch = mock(async () => new Response(JSON.stringify(body), { status: 200 })) as unknown as typeof fetch
}

describe("appPasswordsApi", () => {
  const originalFetch = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  test("appPasswordAdd POSTs raw attr object top-level with protocols", async () => {
    okEnvelope()

    const r = await appPasswordAdd({
      config: testConfig(),
      attr: {
        username: "u@example.com",
        app_name: "phone",
        app_passwd: "pw",
        app_passwd2: "pw",
        protocols: ["imap_access", "smtp_access"],
      },
    })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/add/app-passwd`)
    expect(init.method).toBe("POST")
    expect(JSON.parse(init.body as string)).toEqual({
      username: "u@example.com",
      app_name: "phone",
      app_passwd: "pw",
      app_passwd2: "pw",
      protocols: ["imap_access", "smtp_access"],
    })
  })

  test("appPasswordAdd rejects short protocol names with op (server reads *_access)", async () => {
    const r = await appPasswordAdd({
      config: testConfig(),
      attr: {
        username: "u@example.com",
        app_name: "phone",
        app_passwd: "pw",
        app_passwd2: "pw",
        protocols: ["imap"],
      },
    } as never)
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("appPasswordAdd")
  })

  test("appPasswordAdd maps envelope danger to ResultErr with op", async () => {
    okEnvelope([{ type: "danger", msg: "access_denied" }])

    const r = await appPasswordAdd({
      config: testConfig(),
      attr: { username: "u@example.com", app_name: "phone", app_passwd: "pw", app_passwd2: "pw" },
    })
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(r.op).toBe("appPasswordAdd")
      expect(r.errorMessage).toContain("access_denied")
    }
  })

  test("appPasswordAdd rejects invalid options with op", async () => {
    const r = await appPasswordAdd({ config: testConfig(), attr: { username: "u@example.com" } } as never)
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("appPasswordAdd")
  })

  test("appPasswordList GETs /get/app-passwd/all and normalizes {} to []", async () => {
    globalThis.fetch = mock(async () => new Response("{}", { status: 200 })) as unknown as typeof fetch

    const r = await appPasswordList({ config: testConfig() })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual([])

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/get/app-passwd/all`)
    expect(init.method).toBe("GET")
  })

  test("appPasswordList scopes to /get/app-passwd/all/{mailbox}", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify([{ id: 1, mailbox: "u@example.com" }]), { status: 200 })
    }) as unknown as typeof fetch

    const r = await appPasswordList({ config: testConfig(), mailbox: "u@example.com" })
    expect(r.success).toBe(true)

    const [url] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/get/app-passwd/all/u%40example.com`)
  })

  test("appPasswordGet pins the /get/app-passwd/{id} path despite the router bug", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify({ id: 1, mailbox: "u@example.com" }), { status: 200 })
    }) as unknown as typeof fetch

    const r = await appPasswordGet({ config: testConfig(), id: 1 })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/get/app-passwd/1`)
    expect(init.method).toBe("GET")
  })

  test("appPasswordEdit POSTs {attr, items} with username + app_name", async () => {
    okEnvelope([{ type: "success", msg: ["object_modified", "1"] }])

    const r = await appPasswordEdit({
      config: testConfig(),
      items: [1],
      attr: { username: "u@example.com", app_name: "tablet" },
    })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/edit/app-passwd`)
    expect(JSON.parse(init.body as string)).toEqual({
      attr: { username: "u@example.com", app_name: "tablet" },
      items: [1],
    })
  })

  test("appPasswordEdit rejects attr without username with op (server falls back to pseudo-user API)", async () => {
    okEnvelope([{ type: "success", msg: ["object_modified", "1"] }])

    const r = await appPasswordEdit({ config: testConfig(), items: [1], attr: { app_name: "tablet" } } as never)
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("appPasswordEdit")
  })

  test("appPasswordDelete POSTs the raw items array", async () => {
    okEnvelope()

    const r = await appPasswordDelete({ config: testConfig(), items: [1] })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/delete/app-passwd`)
    expect(JSON.parse(init.body as string)).toEqual([1])
  })
})
