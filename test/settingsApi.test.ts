import { afterEach, describe, expect, mock, test } from "bun:test"
import { mailcowClientConfig } from "../src/client/mailcowClientConfig.js"
import { appLinksEdit } from "../src/settings/appLinksEdit.js"
import { corsEdit } from "../src/settings/corsEdit.js"
import { customLoginEdit } from "../src/settings/customLoginEdit.js"
import { fido2FnEdit } from "../src/settings/fido2FnEdit.js"
import { identityProviderDelete } from "../src/settings/identityProviderDelete.js"
import { identityProviderEdit } from "../src/settings/identityProviderEdit.js"
import { identityProviderTestEdit } from "../src/settings/identityProviderTestEdit.js"
import { ipCheckEdit } from "../src/settings/ipCheckEdit.js"
import { passwordPolicyEdit } from "../src/settings/passwordPolicyEdit.js"
import { passwordPolicyGet } from "../src/settings/passwordPolicyGet.js"
import { passwordPolicyHtmlGet } from "../src/settings/passwordPolicyHtmlGet.js"
import { quotaNotificationBccEdit } from "../src/settings/quotaNotificationBccEdit.js"
import { quotaNotificationEdit } from "../src/settings/quotaNotificationEdit.js"
import { resetPasswordNotificationEdit } from "../src/settings/resetPasswordNotificationEdit.js"
import { uiTextsEdit } from "../src/settings/uiTextsEdit.js"
import { uiThemeEdit } from "../src/settings/uiThemeEdit.js"
import { userSelfEdit } from "../src/settings/userSelfEdit.js"

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

function okEnvelope(body: unknown = [{ type: "success", msg: ["settings_saved"] }]) {
  globalThis.fetch = mock(async () => new Response(JSON.stringify(body), { status: 200 })) as unknown as typeof fetch
}

async function expectAttrOnlyEdit(
  run: (config: ReturnType<typeof testConfig>) => Promise<{ success: boolean }>,
  path: string,
  attr: Record<string, unknown>,
) {
  okEnvelope()
  const r = await run(testConfig())
  expect(r.success).toBe(true)
  const [url, init] = lastCall()
  expect(url).toBe(`${baseUrl}/api/v1${path}`)
  expect(JSON.parse(init.body as string)).toEqual({ attr })
}

describe("settingsApi", () => {
  const originalFetch = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  test("appLinksEdit POSTs {attr}", async () => {
    await expectAttrOnlyEdit((config) => appLinksEdit({ config, attr: { app: ["Webmail"] } }), "/edit/app_links", {
      app: ["Webmail"],
    })
  })

  test("uiTextsEdit POSTs {attr}", async () => {
    await expectAttrOnlyEdit((config) => uiTextsEdit({ config, attr: { title_name: "Mail" } }), "/edit/ui_texts", {
      title_name: "Mail",
    })
  })

  test("ipCheckEdit POSTs {attr}", async () => {
    await expectAttrOnlyEdit((config) => ipCheckEdit({ config, attr: { ip_check_opt_in: 1 } }), "/edit/ip_check", {
      ip_check_opt_in: 1,
    })
  })

  test("customLoginEdit POSTs {attr} with quicklink fields", async () => {
    await expectAttrOnlyEdit((config) => customLoginEdit({ config, attr: { force_sso: 1 } }), "/edit/custom_login", {
      force_sso: 1,
    })
  })

  test("uiThemeEdit POSTs {attr}", async () => {
    await expectAttrOnlyEdit((config) => uiThemeEdit({ config, attr: { ui_theme: "lumen" } }), "/edit/ui_theme", {
      ui_theme: "lumen",
    })
  })

  test("passwordPolicyEdit POSTs {attr}", async () => {
    await expectAttrOnlyEdit(
      (config) => passwordPolicyEdit({ config, attr: { length: 12, numbers: 1 } }),
      "/edit/passwordpolicy",
      { length: 12, numbers: 1 },
    )
  })

  test("passwordPolicyGet fetches the rules", async () => {
    globalThis.fetch = mock(
      async () => new Response(JSON.stringify({ length: 12 }), { status: 200 }),
    ) as unknown as typeof fetch

    const r = await passwordPolicyGet({ config: testConfig() })
    expect(r.success).toBe(true)

    const [url] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/get/passwordpolicy`)
  })

  test("passwordPolicyHtmlGet reads the html fragment as text", async () => {
    globalThis.fetch = mock(
      async () => new Response("<ul><li>12 chars</li></ul>", { status: 200 }),
    ) as unknown as typeof fetch

    const r = await passwordPolicyHtmlGet({ config: testConfig() })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toContain("12 chars")

    const [url] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/get/passwordpolicy/html`)
  })

  test("quotaNotificationEdit POSTs {attr}", async () => {
    await expectAttrOnlyEdit(
      (config) => quotaNotificationEdit({ config, attr: { sender: "a@test" } }),
      "/edit/quota_notification",
      { sender: "a@test" },
    )
  })

  test("quotaNotificationBccEdit POSTs {attr}", async () => {
    await expectAttrOnlyEdit(
      (config) => quotaNotificationBccEdit({ config, attr: { bcc_rcpt: "b@test" } }),
      "/edit/quota_notification_bcc",
      { bcc_rcpt: "b@test" },
    )
  })

  test("corsEdit POSTs {attr} with origins and methods", async () => {
    await expectAttrOnlyEdit(
      (config) => corsEdit({ config, attr: { allowed_origins: ["https://a.test"], allowed_methods: ["GET"] } }),
      "/edit/cors",
      { allowed_origins: ["https://a.test"], allowed_methods: ["GET"] },
    )
  })

  test("corsEdit rejects an invalid method with op", async () => {
    const r = await corsEdit({
      config: testConfig(),
      attr: { allowed_methods: ["PATCH"] },
    } as never)
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("corsEdit")
  })

  test("identityProviderEdit POSTs {attr}", async () => {
    await expectAttrOnlyEdit(
      (config) => identityProviderEdit({ config, attr: { host: "ldap.test" } }),
      "/edit/identity-provider",
      { host: "ldap.test" },
    )
  })

  test("identityProviderTestEdit POSTs {attr}", async () => {
    await expectAttrOnlyEdit(
      (config) => identityProviderTestEdit({ config, attr: { host: "ldap.test" } }),
      "/edit/identity-provider-test",
      { host: "ldap.test" },
    )
  })

  test("identityProviderDelete POSTs and maps the envelope", async () => {
    okEnvelope([{ type: "success", msg: ["item_deleted", ""] }])

    const r = await identityProviderDelete({ config: testConfig() })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/delete/identity-provider`)
    expect(init.method).toBe("POST")
  })

  test("resetPasswordNotificationEdit POSTs {attr}", async () => {
    await expectAttrOnlyEdit(
      (config) => resetPasswordNotificationEdit({ config, attr: { subject: "Reset" } }),
      "/edit/reset-password-notification",
      { subject: "Reset" },
    )
  })

  test("fido2FnEdit POSTs {attr}", async () => {
    await expectAttrOnlyEdit(
      (config) => fido2FnEdit({ config, attr: { fido2_attrs: { label: "key-1" } } }),
      "/edit/fido2-fn",
      { fido2_attrs: { label: "key-1" } },
    )
  })

  test("userSelfEdit POSTs {attr} to /edit/self", async () => {
    await expectAttrOnlyEdit(
      (config) => userSelfEdit({ config, attr: { pw_recovery_email: "me@test" } }),
      "/edit/self",
      { pw_recovery_email: "me@test" },
    )
  })

  test("userSelfEdit maps a danger envelope to err", async () => {
    okEnvelope([{ type: "danger", msg: "access_denied" }])

    const r = await userSelfEdit({ config: testConfig(), attr: {} })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("userSelfEdit")
  })
})
