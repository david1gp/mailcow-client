import { afterEach, describe, expect, mock, test } from "bun:test"
import { mailcowClientConfig } from "../src/client/mailcowClientConfig.js"
import { mailqDelete } from "../src/queue/mailqDelete.js"
import { mailqEdit } from "../src/queue/mailqEdit.js"
import { mailqList } from "../src/queue/mailqList.js"
import { postcatGet } from "../src/queue/postcatGet.js"

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

function okEnvelope(body: unknown = [{ type: "success", msg: ["queue_command_success"] }]) {
  globalThis.fetch = mock(async () => new Response(JSON.stringify(body), { status: 200 })) as unknown as typeof fetch
}

describe("queueApi", () => {
  const originalFetch = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  test("mailqList parses the raw queue JSON string into entries", async () => {
    globalThis.fetch = mock(async () => {
      return new Response('[{"queue_name":"q1","sender":"a@test"}]', { status: 200 })
    }) as unknown as typeof fetch

    const r = await mailqList({ config: testConfig() })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual([{ queue_name: "q1", sender: "a@test" }])

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/get/mailq/all`)
    expect(init.method).toBe("GET")
  })

  test("mailqList returns '[]' as an empty array", async () => {
    globalThis.fetch = mock(async () => new Response("[]", { status: 200 })) as unknown as typeof fetch

    const r = await mailqList({ config: testConfig() })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual([])
  })

  test("postcatGet reads raw bytes for a qid", async () => {
    const raw = new TextEncoder().encode("From: a@test\r\n\r\nbody")
    globalThis.fetch = mock(async () => new Response(raw, { status: 200 })) as unknown as typeof fetch

    const r = await postcatGet({ config: testConfig(), qid: "ABC123" })
    expect(r.success).toBe(true)
    if (r.success) expect(Array.from(r.data)).toEqual(Array.from(raw))

    const [url] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/get/postcat/ABC123`)
  })

  test("mailqEdit POSTs {attr, items} for hold", async () => {
    okEnvelope()

    const r = await mailqEdit({ config: testConfig(), items: ["ABC123"], attr: { action: "hold" } })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/edit/mailq`)
    expect(JSON.parse(init.body as string)).toEqual({ attr: { action: "hold" }, items: ["ABC123"] })
  })

  test("mailqEdit rejects an invalid action with op", async () => {
    const r = await mailqEdit({ config: testConfig(), items: [], attr: { action: "explode" } } as never)
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("mailqEdit")
  })

  test("mailqDelete POSTs the raw qid items array", async () => {
    okEnvelope()

    const r = await mailqDelete({ config: testConfig(), items: ["ABC123"] })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/delete/mailq`)
    expect(JSON.parse(init.body as string)).toEqual(["ABC123"])
  })

  test("mailqDelete sends {action: super_delete} for a whole-queue delete", async () => {
    okEnvelope()

    const r = await mailqDelete({ config: testConfig(), action: "super_delete" })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/delete/mailq`)
    expect(JSON.parse(init.body as string)).toEqual({ action: "super_delete" })
  })
})
