import { afterEach, describe, expect, mock, test } from "bun:test"
import { mailcowClientConfig } from "../src/client/mailcowClientConfig.js"
import { identityProviderGet } from "../src/status/identityProviderGet.js"
import { statusContainerGet } from "../src/status/statusContainerGet.js"
import { statusContainersList } from "../src/status/statusContainersList.js"
import { statusHostGet } from "../src/status/statusHostGet.js"
import { statusHostIpGet } from "../src/status/statusHostIpGet.js"
import { statusVersionGet } from "../src/status/statusVersionGet.js"
import { statusVmailGet } from "../src/status/statusVmailGet.js"

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

function okJson(body: unknown) {
  globalThis.fetch = mock(async () => new Response(JSON.stringify(body), { status: 200 })) as unknown as typeof fetch
}

describe("statusApi", () => {
  const originalFetch = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  test("statusContainersList returns the per-container map", async () => {
    okJson({ "postfix-mailcow": { type: "info", container: "postfix-mailcow", state: "running" } })

    const r = await statusContainersList({ config: testConfig() })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data["postfix-mailcow"]?.state).toBe("running")

    const [url] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/get/status/containers`)
  })

  test("statusContainerGet fetches one container by name", async () => {
    okJson({ cpu: "1%" })

    const r = await statusContainerGet({ config: testConfig(), name: "dovecot-mailcow" })
    expect(r.success).toBe(true)

    const [url] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/get/status/container/dovecot-mailcow`)
  })

  test("statusVmailGet returns disk usage", async () => {
    okJson({ type: "info", disk: "/var/vmail", used_percent: "10%" })

    const r = await statusVmailGet({ config: testConfig() })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.used_percent).toBe("10%")

    const [url] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/get/status/vmail`)
  })

  test("statusHostGet returns host stats", async () => {
    okJson({ cpu: "2%" })

    const r = await statusHostGet({ config: testConfig() })
    expect(r.success).toBe(true)

    const [url] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/get/status/host`)
  })

  test("statusHostIpGet returns public ips", async () => {
    okJson({ ipv4: "1.2.3.4", ipv6: "::1" })

    const r = await statusHostIpGet({ config: testConfig() })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.ipv4).toBe("1.2.3.4")

    const [url] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/get/status/host/ip`)
  })

  test("statusVersionGet returns the version", async () => {
    okJson({ version: "2026-10" })

    const r = await statusVersionGet({ config: testConfig() })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.version).toBe("2026-10")

    const [url] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/get/status/version`)
  })

  test("identityProviderGet returns settings or null", async () => {
    okJson(null)

    const r = await identityProviderGet({ config: testConfig() })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toBeNull()

    const [url] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/get/identity-provider`)
  })
})
