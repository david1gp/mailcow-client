import { afterEach, describe, expect, mock, test } from "bun:test"
import { mailcowClientConfig } from "../src/client/mailcowClientConfig.js"
import { bccAdd } from "../src/routing/bccAdd.js"
import { bccDelete } from "../src/routing/bccDelete.js"
import { bccEdit } from "../src/routing/bccEdit.js"
import { bccGet } from "../src/routing/bccGet.js"
import { bccList } from "../src/routing/bccList.js"
import { fwdhostAdd } from "../src/routing/fwdhostAdd.js"
import { fwdhostDelete } from "../src/routing/fwdhostDelete.js"
import { fwdhostEdit } from "../src/routing/fwdhostEdit.js"
import { fwdhostGet } from "../src/routing/fwdhostGet.js"
import { fwdhostList } from "../src/routing/fwdhostList.js"
import { recipientMapAdd } from "../src/routing/recipientMapAdd.js"
import { recipientMapDelete } from "../src/routing/recipientMapDelete.js"
import { recipientMapEdit } from "../src/routing/recipientMapEdit.js"
import { recipientMapGet } from "../src/routing/recipientMapGet.js"
import { recipientMapList } from "../src/routing/recipientMapList.js"
import { relayhostAdd } from "../src/routing/relayhostAdd.js"
import { relayhostDelete } from "../src/routing/relayhostDelete.js"
import { relayhostEdit } from "../src/routing/relayhostEdit.js"
import { relayhostGet } from "../src/routing/relayhostGet.js"
import { relayhostList } from "../src/routing/relayhostList.js"
import { transportAdd } from "../src/routing/transportAdd.js"
import { transportDelete } from "../src/routing/transportDelete.js"
import { transportEdit } from "../src/routing/transportEdit.js"
import { transportGet } from "../src/routing/transportGet.js"
import { transportList } from "../src/routing/transportList.js"

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

describe("routingApi", () => {
  const originalFetch = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  test("relayhostAdd POSTs raw attr top-level", async () => {
    okEnvelope()

    const r = await relayhostAdd({
      config: testConfig(),
      attr: { hostname: "smtp.test:587", username: "u", password: "pw" },
    })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/add/relayhost`)
    expect(JSON.parse(init.body as string)).toEqual({ hostname: "smtp.test:587", username: "u", password: "pw" })
  })

  test("relayhostList GETs /get/relayhost/all and normalizes {} to []", async () => {
    globalThis.fetch = mock(async () => new Response("{}", { status: 200 })) as unknown as typeof fetch

    const r = await relayhostList({ config: testConfig() })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual([])

    const [url] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/get/relayhost/all`)
  })

  test("relayhostGet GETs /get/relayhost/{id}", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify({ id: 1, hostname: "smtp.test:587" }), { status: 200 })
    }) as unknown as typeof fetch

    const r = await relayhostGet({ config: testConfig(), id: 1 })
    expect(r.success).toBe(true)

    const [url] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/get/relayhost/1`)
  })

  test("relayhostEdit POSTs {attr, items}", async () => {
    okEnvelope()

    const r = await relayhostEdit({ config: testConfig(), items: [1], attr: { active: "0" } })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/edit/relayhost`)
    expect(JSON.parse(init.body as string)).toEqual({ attr: { active: "0" }, items: [1] })
  })

  test("relayhostDelete POSTs the raw items array", async () => {
    okEnvelope()

    const r = await relayhostDelete({ config: testConfig(), items: [1] })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/delete/relayhost`)
    expect(JSON.parse(init.body as string)).toEqual([1])
  })

  test("transportAdd POSTs /add/transport", async () => {
    okEnvelope()

    const r = await transportAdd({
      config: testConfig(),
      attr: { destination: "example.com", nexthop: "smtp:test", active: "1" },
    })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/add/transport`)
    expect(JSON.parse(init.body as string)).toEqual({ destination: "example.com", nexthop: "smtp:test", active: "1" })
  })

  test("transportList GETs /get/transport/all", async () => {
    globalThis.fetch = mock(async () => new Response("{}", { status: 200 })) as unknown as typeof fetch

    const r = await transportList({ config: testConfig() })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual([])

    const [url] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/get/transport/all`)
  })

  test("transportGet GETs /get/transport/{id}", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify({ id: 1, destination: "example.com" }), { status: 200 })
    }) as unknown as typeof fetch

    const r = await transportGet({ config: testConfig(), id: 1 })
    expect(r.success).toBe(true)

    const [url] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/get/transport/1`)
  })

  test("transportEdit POSTs {attr, items}", async () => {
    okEnvelope()

    const r = await transportEdit({ config: testConfig(), items: [1], attr: { nexthop: "smtp:x" } })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/edit/transport`)
    expect(JSON.parse(init.body as string)).toEqual({ attr: { nexthop: "smtp:x" }, items: [1] })
  })

  test("transportDelete POSTs the raw items array", async () => {
    okEnvelope()

    const r = await transportDelete({ config: testConfig(), items: [1] })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/delete/transport`)
    expect(JSON.parse(init.body as string)).toEqual([1])
  })

  test("recipientMapAdd POSTs /add/recipient_map", async () => {
    okEnvelope()

    const r = await recipientMapAdd({
      config: testConfig(),
      attr: { recipient_map_old: "old@test", recipient_map_new: "new@test" },
    })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/add/recipient_map`)
    expect(JSON.parse(init.body as string)).toEqual({ recipient_map_old: "old@test", recipient_map_new: "new@test" })
  })

  test("recipientMapList GETs /get/recipient_map/all", async () => {
    globalThis.fetch = mock(async () => new Response("{}", { status: 200 })) as unknown as typeof fetch

    const r = await recipientMapList({ config: testConfig() })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual([])

    const [url] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/get/recipient_map/all`)
  })

  test("recipientMapGet GETs /get/recipient_map/{id}", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify({ id: 1, recipient_map_old: "old@test" }), { status: 200 })
    }) as unknown as typeof fetch

    const r = await recipientMapGet({ config: testConfig(), id: 1 })
    expect(r.success).toBe(true)

    const [url] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/get/recipient_map/1`)
  })

  test("recipientMapEdit POSTs {attr, items}", async () => {
    okEnvelope()

    const r = await recipientMapEdit({ config: testConfig(), items: [1], attr: { active: "0" } })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/edit/recipient_map`)
    expect(JSON.parse(init.body as string)).toEqual({ attr: { active: "0" }, items: [1] })
  })

  test("recipientMapDelete POSTs the raw items array", async () => {
    okEnvelope()

    const r = await recipientMapDelete({ config: testConfig(), items: [1] })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/delete/recipient_map`)
    expect(JSON.parse(init.body as string)).toEqual([1])
  })

  test("bccAdd POSTs /add/bcc with sender|rcpt type", async () => {
    okEnvelope()

    const r = await bccAdd({
      config: testConfig(),
      attr: { type: "sender", local_dest: "u@example.com", bcc_dest: "arch@test" },
    })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/add/bcc`)
    expect(JSON.parse(init.body as string)).toEqual({
      type: "sender",
      local_dest: "u@example.com",
      bcc_dest: "arch@test",
    })
  })

  test("bccAdd rejects an invalid type with op", async () => {
    const r = await bccAdd({
      config: testConfig(),
      attr: { type: "both", local_dest: "a", bcc_dest: "b" },
    } as never)
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("bccAdd")
  })

  test("bccList GETs /get/bcc/all", async () => {
    globalThis.fetch = mock(async () => new Response("{}", { status: 200 })) as unknown as typeof fetch

    const r = await bccList({ config: testConfig() })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual([])

    const [url] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/get/bcc/all`)
  })

  test("bccGet GETs /get/bcc/{id}", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify({ id: 1, type: "sender" }), { status: 200 })
    }) as unknown as typeof fetch

    const r = await bccGet({ config: testConfig(), id: 1 })
    expect(r.success).toBe(true)

    const [url] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/get/bcc/1`)
  })

  test("bccEdit POSTs {attr, items}", async () => {
    okEnvelope()

    const r = await bccEdit({ config: testConfig(), items: [1], attr: { bcc_dest: "x@test" } })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/edit/bcc`)
    expect(JSON.parse(init.body as string)).toEqual({ attr: { bcc_dest: "x@test" }, items: [1] })
  })

  test("bccDelete POSTs the raw items array", async () => {
    okEnvelope()

    const r = await bccDelete({ config: testConfig(), items: [1] })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/delete/bcc`)
    expect(JSON.parse(init.body as string)).toEqual([1])
  })

  test("fwdhostAdd POSTs /add/fwdhost", async () => {
    okEnvelope()

    const r = await fwdhostAdd({ config: testConfig(), attr: { hostname: "fwd.test", filter_spam: "1" } })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/add/fwdhost`)
    expect(JSON.parse(init.body as string)).toEqual({ hostname: "fwd.test", filter_spam: "1" })
  })

  test("fwdhostList GETs /get/fwdhost/all", async () => {
    globalThis.fetch = mock(async () => new Response("{}", { status: 200 })) as unknown as typeof fetch

    const r = await fwdhostList({ config: testConfig() })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual([])

    const [url] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/get/fwdhost/all`)
  })

  test("fwdhostGet reads the live host key", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify({ host: "fwd.test", source: "ui", keep_spam: "no" }), {
        status: 200,
      })
    }) as unknown as typeof fetch

    const r = await fwdhostGet({ config: testConfig(), hostname: "fwd.test" })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.host).toBe("fwd.test")

    const [url] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/get/fwdhost/fwd.test`)
  })

  test("fwdhostEdit POSTs {attr, items} with hostname items", async () => {
    okEnvelope()

    const r = await fwdhostEdit({ config: testConfig(), items: ["fwd.test"], attr: { keep_spam: "1" } })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/edit/fwdhost`)
    expect(JSON.parse(init.body as string)).toEqual({ attr: { keep_spam: "1" }, items: ["fwd.test"] })
  })

  test("fwdhostDelete POSTs hostname items array", async () => {
    okEnvelope()

    const r = await fwdhostDelete({ config: testConfig(), items: ["fwd.test"] })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/delete/fwdhost`)
    expect(JSON.parse(init.body as string)).toEqual(["fwd.test"])
  })
})
