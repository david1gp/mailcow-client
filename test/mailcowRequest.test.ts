import { afterEach, describe, expect, mock, test } from "bun:test"
import { mailcowClientConfig } from "../src/client/mailcowClientConfig.js"
import type { MailcowClientConfigInput } from "../src/client/mailcowClientConfigSchema.js"
import { mailcowClientFromEnv } from "../src/client/mailcowClientFromEnv.js"
import { mailcowEnvelope } from "../src/client/mailcowEnvelope.js"
import { mailcowPathApi } from "../src/client/mailcowPathApi.js"
import { mailcowRequest } from "../src/client/mailcowRequest.js"
import { mailcowRequestQueryString } from "../src/client/mailcowRequestQueryString.js"
import { mailcowRequestUrl } from "../src/client/mailcowRequestUrl.js"

describe("mailcowRequestQueryString / mailcowRequestUrl build exact URLs", () => {
  test("builds query and skips null/undefined", () => {
    expect(mailcowRequestQueryString({ a: 1, b: true, c: "x", d: null, e: undefined })).toBe("?a=1&b=true&c=x")
  })

  test("empty query", () => {
    expect(mailcowRequestQueryString()).toBe("")
    expect(mailcowRequestQueryString({})).toBe("")
  })

  test("joins base + path + query", () => {
    expect(mailcowRequestUrl("https://email.contentoren.de", "/api/v1/get/domain/all", { limit: 10 })).toBe(
      "https://email.contentoren.de/api/v1/get/domain/all?limit=10",
    )
  })
})

describe("mailcowPathApi prefixes /api/v1", () => {
  test("prefixes rest path", () => {
    expect(mailcowPathApi("/get/domain/all")).toBe("/api/v1/get/domain/all")
  })
})

describe("mailcowClientConfig trims and validates", () => {
  test("strips trailing slash on baseUrl", () => {
    const r = mailcowClientConfig({ baseUrl: "https://email.contentoren.de/" })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.baseUrl).toBe("https://email.contentoren.de")
  })

  test("accepts timeoutMs and retries", () => {
    const r = mailcowClientConfig({
      baseUrl: "https://email.contentoren.de",
      timeoutMs: 5000,
      retries: 2,
    })
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data.timeoutMs).toBe(5000)
      expect(r.data.retries).toBe(2)
    }
  })

  test("returns a ResultErr for invalid input", () => {
    const input = { baseUrl: "not a url" } as MailcowClientConfigInput & Record<string, unknown>
    input.self = input

    const r = mailcowClientConfig(input)
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("mailcowClientConfig")
  })
})

describe("mailcowClientFromEnv reads MAILCOW_ vars", () => {
  test("requires MAILCOW_BASE_URL", () => {
    const r = mailcowClientFromEnv({})
    expect(r.success).toBe(false)
  })

  test("loads env keys", () => {
    const r = mailcowClientFromEnv({
      MAILCOW_BASE_URL: "https://email.contentoren.de/",
      MAILCOW_API_KEY: "key",
      MAILCOW_TIMEOUT_MS: "10000",
      MAILCOW_RETRIES: "2",
    })
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data.baseUrl).toBe("https://email.contentoren.de")
      expect(r.data.apiKey).toBe("key")
      expect(r.data.timeoutMs).toBe(10000)
      expect(r.data.retries).toBe(2)
    }
  })
})

describe("mailcowEnvelope maps the mutation envelope to Result", () => {
  test("all-success entries resolve ok with msgs", () => {
    const r = mailcowEnvelope([{ type: "success", msg: ["domain_added", "example.com"] }])
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual(["domain_added example.com"])
  })

  test("plain-string msgs pass through", () => {
    const r = mailcowEnvelope([{ type: "success", msg: "queue_command_success" }])
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual(["queue_command_success"])
  })

  test("danger entries resolve err with joined msgs", () => {
    const r = mailcowEnvelope([
      { type: "success", msg: "one_ok" },
      { type: "danger", msg: ["mailbox_invalid", "bad@example.com"] },
    ])
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(r.op).toBe("mailcowEnvelope")
      expect(r.errorMessage).toContain("mailbox_invalid")
    }
  })

  test("error entries resolve err", () => {
    const r = mailcowEnvelope([{ type: "error", msg: "only POST method is allowed" }])
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("mailcowEnvelope")
  })

  test("warning alongside success resolves ok (live delete garbage-collector pin)", () => {
    const r = mailcowEnvelope([
      { type: "warning", msg: "Could not move maildir to garbage collector: docker down" },
      { type: "success", msg: ["mailbox_removed", "u@example.com"] },
    ])
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual(["mailbox_removed u@example.com"])
  })

  test("warning-only entries resolve ok (warnings are non-fatal upstream)", () => {
    const r = mailcowEnvelope([{ type: "warning", msg: "Could not move maildir to garbage collector: x" }])
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual([])
  })

  test("non-envelope input resolves err", () => {
    const r = mailcowEnvelope({ type: "success", msg: "not-an-array" })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("mailcowEnvelope")
  })
})

describe("mailcowRequest fetch sends X-API-Key and parses JSON", () => {
  const originalFetch = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  test("success json path with /api/v1 URL and X-API-Key header", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify({ version: "2026-07b" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    }) as unknown as typeof fetch

    const configR = mailcowClientConfig({ baseUrl: "https://email.contentoren.de", apiKey: "secret" })
    expect(configR.success).toBe(true)
    if (!configR.success) return

    const r = await mailcowRequest({
      config: configR.data,
      method: "GET",
      path: mailcowPathApi("/get/status/version"),
    })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual({ version: "2026-07b" })

    const calls = (globalThis.fetch as unknown as ReturnType<typeof mock>).mock.calls
    expect(calls.length).toBe(1)
    const [url, init] = calls[0] as [string, RequestInit]
    expect(url).toBe("https://email.contentoren.de/api/v1/get/status/version")
    expect(init.method).toBe("GET")
    expect((init.headers as Record<string, string>)["X-API-Key"]).toBe("secret")
  })

  test("omits X-API-Key header when apiKey is unset", async () => {
    globalThis.fetch = mock(async () => {
      return new Response("[]", { status: 200 })
    }) as unknown as typeof fetch

    const configR = mailcowClientConfig({ baseUrl: "https://email.contentoren.de" })
    if (!configR.success) return

    await mailcowRequest({
      config: configR.data,
      method: "GET",
      path: mailcowPathApi("/get/domain/all"),
    })

    const calls = (globalThis.fetch as unknown as ReturnType<typeof mock>).mock.calls
    const [, init] = calls[0] as [string, RequestInit]
    expect((init.headers as Record<string, string>)["X-API-Key"]).toBeUndefined()
  })

  test("sends raw JSON body with Content-Type application/json", async () => {
    let sentBody: string | undefined
    let sentContentType: string | undefined
    globalThis.fetch = mock(async (_url, init) => {
      sentBody = init?.body as string
      sentContentType = (init?.headers as Record<string, string>)["Content-Type"]
      return new Response(JSON.stringify([{ type: "success", msg: ["domain_added", "example.com"] }]), {
        status: 200,
      })
    }) as unknown as typeof fetch

    const configR = mailcowClientConfig({ baseUrl: "https://email.contentoren.de", apiKey: "secret" })
    if (!configR.success) return

    const r = await mailcowRequest({
      config: configR.data,
      method: "POST",
      path: mailcowPathApi("/add/domain"),
      body: { attr: { domain: "example.com" }, items: [] },
    })
    expect(r.success).toBe(true)
    expect(JSON.parse(sentBody!)).toEqual({ attr: { domain: "example.com" }, items: [] })
    expect(sentContentType).toBe("application/json")
    if (r.success) {
      const envelope = mailcowEnvelope(r.data)
      expect(envelope.success).toBe(true)
    }
  })

  test("returns a ResultErr for a circular body instead of rejecting", async () => {
    globalThis.fetch = mock(async () => new Response("{}", { status: 200 })) as unknown as typeof fetch
    const configR = mailcowClientConfig({ baseUrl: "https://email.contentoren.de" })
    if (!configR.success) return

    const body: Record<string, unknown> = {}
    body.self = body
    const r = await mailcowRequest({
      config: configR.data,
      method: "POST",
      path: mailcowPathApi("/add/domain"),
      body,
    })

    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("mailcowRequest")
  })

  test("4xx is not retried", async () => {
    let attempts = 0
    globalThis.fetch = mock(async () => {
      attempts++
      return new Response("nope", { status: 400, statusText: "Bad Request" })
    }) as unknown as typeof fetch

    const configR = mailcowClientConfig({
      baseUrl: "https://email.contentoren.de",
      retries: 3,
    })
    if (!configR.success) return

    const r = await mailcowRequest({
      config: configR.data,
      method: "GET",
      path: mailcowPathApi("/get/domain/all"),
    })
    expect(r.success).toBe(false)
    expect(attempts).toBe(1)
  })

  test("5xx is retried", async () => {
    let attempts = 0
    globalThis.fetch = mock(async () => {
      attempts++
      if (attempts < 3) {
        return new Response("err", { status: 503, statusText: "Unavailable" })
      }
      return new Response(JSON.stringify({ ok: 1 }), { status: 200 })
    }) as unknown as typeof fetch

    const configR = mailcowClientConfig({
      baseUrl: "https://email.contentoren.de",
      retries: 2,
    })
    if (!configR.success) return

    const r = await mailcowRequest({
      config: configR.data,
      method: "GET",
      path: mailcowPathApi("/get/domain/all"),
    })
    expect(r.success).toBe(true)
    expect(attempts).toBe(3)
  })

  test("void / 204", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(null, { status: 204 })
    }) as unknown as typeof fetch

    const configR = mailcowClientConfig({ baseUrl: "https://email.contentoren.de" })
    if (!configR.success) return

    const r = await mailcowRequest({
      config: configR.data,
      method: "DELETE",
      path: mailcowPathApi("/delete/domain"),
      responseType: "void",
    })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toBeUndefined()
  })
})
