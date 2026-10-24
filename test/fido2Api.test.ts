import { afterEach, describe, expect, mock, test } from "bun:test"
import { mailcowClientConfig } from "../src/client/mailcowClientConfig.js"
import { fido2GetArgsGet } from "../src/fido2/fido2GetArgsGet.js"
import { fido2RegistrationAdd } from "../src/fido2/fido2RegistrationAdd.js"
import { fido2RegistrationArgsGet } from "../src/fido2/fido2RegistrationArgsGet.js"
import { webauthnTfaGetArgsGet } from "../src/fido2/webauthnTfaGetArgsGet.js"
import { webauthnTfaRegistrationAdd } from "../src/fido2/webauthnTfaRegistrationAdd.js"
import { webauthnTfaRegistrationArgsGet } from "../src/fido2/webauthnTfaRegistrationArgsGet.js"

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

describe("fido2Api", () => {
  const originalFetch = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  test("fido2RegistrationArgsGet fetches creation args", async () => {
    okJson({ publicKey: { challenge: "abc" } })

    const r = await fido2RegistrationArgsGet({ config: testConfig() })
    expect(r.success).toBe(true)

    const [url] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/get/fido2-registration`)
  })

  test("fido2GetArgsGet fetches login args", async () => {
    okJson({ publicKey: { challenge: "abc" } })

    const r = await fido2GetArgsGet({ config: testConfig() })
    expect(r.success).toBe(true)

    const [url] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/get/fido2-get-args`)
  })

  test("webauthnTfaRegistrationArgsGet fetches TFA creation args", async () => {
    okJson({ publicKey: { challenge: "abc" } })

    const r = await webauthnTfaRegistrationArgsGet({ config: testConfig() })
    expect(r.success).toBe(true)

    const [url] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/get/webauthn-tfa-registration`)
  })

  test("webauthnTfaGetArgsGet fetches TFA login args", async () => {
    okJson({ publicKey: { challenge: "abc" } })

    const r = await webauthnTfaGetArgsGet({ config: testConfig() })
    expect(r.success).toBe(true)

    const [url] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/get/webauthn-tfa-get-args`)
  })

  test("fido2RegistrationAdd POSTs the raw ceremony body", async () => {
    okJson({ success: true })

    const r = await fido2RegistrationAdd({
      config: testConfig(),
      clientDataJSON: "Y2xpZW50",
      attestationObject: "YXR0ZXN0",
    })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/add/fido2-registration`)
    expect(JSON.parse(init.body as string)).toEqual({
      clientDataJSON: "Y2xpZW50",
      attestationObject: "YXR0ZXN0",
    })
  })

  test("fido2RegistrationAdd maps success:false to err", async () => {
    okJson({ success: false, msg: "bad challenge" })

    const r = await fido2RegistrationAdd({
      config: testConfig(),
      clientDataJSON: "Y2xpZW50",
      attestationObject: "YXR0ZXN0",
    })
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(r.op).toBe("fido2RegistrationAdd")
      expect(r.errorMessage).toContain("bad challenge")
    }
  })

  test("fido2RegistrationAdd rejects a non-{success} body with op", async () => {
    okJson([{ type: "success", msg: ["nope"] }])

    const r = await fido2RegistrationAdd({
      config: testConfig(),
      clientDataJSON: "Y2xpZW50",
      attestationObject: "YXR0ZXN0",
    })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("fido2RegistrationAdd")
  })

  test("webauthnTfaRegistrationAdd POSTs the raw ceremony body with extras", async () => {
    okJson({ success: true })

    const r = await webauthnTfaRegistrationAdd({
      config: testConfig(),
      clientDataJSON: "Y2xpZW50",
      attestationObject: "YXR0ZXN0",
      tfa_method: "webauthn",
      key_id: "key-1",
      confirm_password: "secret",
    })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/add/webauthn-tfa-registration`)
    expect(JSON.parse(init.body as string)).toEqual({
      clientDataJSON: "Y2xpZW50",
      attestationObject: "YXR0ZXN0",
      tfa_method: "webauthn",
      key_id: "key-1",
      confirm_password: "secret",
    })
  })

  test("webauthnTfaRegistrationAdd maps success:false to err", async () => {
    okJson({ success: false })

    const r = await webauthnTfaRegistrationAdd({
      config: testConfig(),
      clientDataJSON: "Y2xpZW50",
      attestationObject: "YXR0ZXN0",
    })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("webauthnTfaRegistrationAdd")
  })
})
