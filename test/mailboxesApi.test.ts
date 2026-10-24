import { afterEach, describe, expect, mock, test } from "bun:test"
import { bccDestinationOptionsGet } from "../src/mailboxes/bccDestinationOptionsGet.js"
import { mailboxActiveUserSieveGet } from "../src/mailboxes/mailboxActiveUserSieveGet.js"
import { mailboxAdd } from "../src/mailboxes/mailboxAdd.js"
import { mailboxCustomAttributeEdit } from "../src/mailboxes/mailboxCustomAttributeEdit.js"
import { mailboxDelete } from "../src/mailboxes/mailboxDelete.js"
import { mailboxDelimiterActionEdit } from "../src/mailboxes/mailboxDelimiterActionEdit.js"
import { mailboxEasCacheDelete } from "../src/mailboxes/mailboxEasCacheDelete.js"
import { mailboxEdit } from "../src/mailboxes/mailboxEdit.js"
import { mailboxGet } from "../src/mailboxes/mailboxGet.js"
import { mailboxLastLoginGet } from "../src/mailboxes/mailboxLastLoginGet.js"
import { mailboxLastLoginReset } from "../src/mailboxes/mailboxLastLoginReset.js"
import { mailboxList } from "../src/mailboxes/mailboxList.js"
import { mailboxPushoverEdit } from "../src/mailboxes/mailboxPushoverEdit.js"
import { mailboxPushoverTestEdit } from "../src/mailboxes/mailboxPushoverTestEdit.js"
import { mailboxQuarantineCategoryEdit } from "../src/mailboxes/mailboxQuarantineCategoryEdit.js"
import { mailboxQuarantineNotificationEdit } from "../src/mailboxes/mailboxQuarantineNotificationEdit.js"
import { mailboxReducedList } from "../src/mailboxes/mailboxReducedList.js"
import { mailboxRename } from "../src/mailboxes/mailboxRename.js"
import { mailboxSearch } from "../src/mailboxes/mailboxSearch.js"
import { mailboxSogoProfileDelete } from "../src/mailboxes/mailboxSogoProfileDelete.js"
import { mailboxSpamScoreEdit } from "../src/mailboxes/mailboxSpamScoreEdit.js"
import { mailboxSpamScoreGet } from "../src/mailboxes/mailboxSpamScoreGet.js"
import { mailboxTagDelete } from "../src/mailboxes/mailboxTagDelete.js"
import { mailboxTemplateAdd } from "../src/mailboxes/mailboxTemplateAdd.js"
import { mailboxTemplateDelete } from "../src/mailboxes/mailboxTemplateDelete.js"
import { mailboxTemplateEdit } from "../src/mailboxes/mailboxTemplateEdit.js"
import { mailboxTemplateGet } from "../src/mailboxes/mailboxTemplateGet.js"
import { mailboxTemplateList } from "../src/mailboxes/mailboxTemplateList.js"
import { mailboxTlsPolicyEdit } from "../src/mailboxes/mailboxTlsPolicyEdit.js"
import { mailboxUserAclEdit } from "../src/mailboxes/mailboxUserAclEdit.js"
import { mailcowClientConfig } from "../src/client/mailcowClientConfig.js"

const baseUrl = "https://mail.example.com"

function testConfig() {
  const r = mailcowClientConfig({ baseUrl, apiKey: "secret" })
  if (!r.success) throw new Error("config must parse")
  return r.data
}

function envelopeOk() {
  return new Response(JSON.stringify([{ type: "success", msg: "Task completed" }]), { status: 200 })
}

function lastCall() {
  const calls = (globalThis.fetch as unknown as ReturnType<typeof mock>).mock.calls
  return calls[calls.length - 1] as [string, RequestInit]
}

describe("mailboxesApi", () => {
  const originalFetch = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  test("mailboxAdd POSTs raw attr object top-level", async () => {
    globalThis.fetch = mock(async () => envelopeOk()) as unknown as typeof fetch

    const r = await mailboxAdd({
      config: testConfig(),
      attr: { local_part: "jane", domain: "example.com", password: "x", password2: "x" },
    })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/add/mailbox`)
    expect(JSON.parse(init.body as string)).toEqual({
      local_part: "jane",
      domain: "example.com",
      password: "x",
      password2: "x",
    })
  })

  test("mailboxAdd rejects missing required attr with op", async () => {
    const r = await mailboxAdd({ config: testConfig(), attr: { domain: "example.com" } } as never)
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("mailboxAdd")
  })

  test("mailboxAdd maps envelope danger to ResultErr", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify([{ type: "danger", msg: ["mailbox_invalid", "x"] }]), { status: 200 })
    }) as unknown as typeof fetch

    const r = await mailboxAdd({
      config: testConfig(),
      attr: { local_part: "j", domain: "example.com", password: "x", password2: "x" },
    })
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("mailboxAdd")
  })

  test("mailboxTemplateAdd POSTs /add/mailbox/template", async () => {
    globalThis.fetch = mock(async () => envelopeOk()) as unknown as typeof fetch

    const r = await mailboxTemplateAdd({ config: testConfig(), attr: { template: "std" } })
    expect(r.success).toBe(true)

    const [url] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/add/mailbox/template`)
  })

  test("mailboxList normalizes {} to [] and scopes domains in path", async () => {
    globalThis.fetch = mock(async () => new Response("{}", { status: 200 })) as unknown as typeof fetch

    const r = await mailboxList({ config: testConfig(), domains: ["example.com"] })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual([])

    const [url] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/get/mailbox/all/example.com`)
  })

  test("mailboxList passes tags as CSV query", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify([{ username: "jane@example.com" }]), { status: 200 })
    }) as unknown as typeof fetch

    const r = await mailboxList({ config: testConfig(), tags: ["vip"] })
    expect(r.success).toBe(true)

    const [url] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/get/mailbox/all?tags=vip`)
  })

  test("mailboxReducedList GETs /get/mailbox/reduced", async () => {
    globalThis.fetch = mock(async () => new Response("{}", { status: 200 })) as unknown as typeof fetch

    const r = await mailboxReducedList({ config: testConfig() })
    expect(r.success).toBe(true)

    const [url] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/get/mailbox/reduced`)
  })

  test("mailboxTemplateList GETs /get/mailbox/template/all", async () => {
    globalThis.fetch = mock(async () => new Response("[]", { status: 200 })) as unknown as typeof fetch

    const r = await mailboxTemplateList({ config: testConfig() })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual([])

    const [url] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/get/mailbox/template/all`)
  })

  test("mailboxTemplateGet encodes the id", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify({ id: 1, template: "std" }), { status: 200 })
    }) as unknown as typeof fetch

    const r = await mailboxTemplateGet({ config: testConfig(), id: 1 })
    expect(r.success).toBe(true)

    const [url] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/get/mailbox/template/1`)
  })

  test("mailboxGet encodes the address", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify({ username: "jane@example.com" }), { status: 200 })
    }) as unknown as typeof fetch

    const r = await mailboxGet({ config: testConfig(), mailbox: "jane@example.com" })
    expect(r.success).toBe(true)

    const [url] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/get/mailbox/jane%40example.com`)
  })

  test("mailboxGet with tags returns a normalized list", async () => {
    globalThis.fetch = mock(async () => new Response("{}", { status: 200 })) as unknown as typeof fetch

    const r = await mailboxGet({ config: testConfig(), mailbox: "example.com", tags: ["vip"] })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual([])

    const [url] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/get/mailbox/example.com?tags=vip`)
  })

  test("mailboxEdit POSTs {attr, items}", async () => {
    globalThis.fetch = mock(async () => envelopeOk()) as unknown as typeof fetch

    const r = await mailboxEdit({ config: testConfig(), items: ["jane@example.com"], attr: { active: "1" } })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/edit/mailbox`)
    expect(JSON.parse(init.body as string)).toEqual({ attr: { active: "1" }, items: ["jane@example.com"] })
  })

  test("mailboxTemplateEdit POSTs /edit/mailbox/template", async () => {
    globalThis.fetch = mock(async () => envelopeOk()) as unknown as typeof fetch

    const r = await mailboxTemplateEdit({ config: testConfig(), items: [1], attr: { quota: "1024" } })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/edit/mailbox/template`)
    expect(JSON.parse(init.body as string)).toEqual({ attr: { quota: "1024" }, items: [1] })
  })

  test("mailboxCustomAttributeEdit POSTs /edit/mailbox/custom-attribute", async () => {
    globalThis.fetch = mock(async () => envelopeOk()) as unknown as typeof fetch

    const r = await mailboxCustomAttributeEdit({
      config: testConfig(),
      items: ["jane@example.com"],
      attr: { pwhash: "abc" },
    })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/edit/mailbox/custom-attribute`)
    expect(JSON.parse(init.body as string)).toEqual({ attr: { pwhash: "abc" }, items: ["jane@example.com"] })
  })

  test("mailboxRename POSTs /edit/rename-mbox", async () => {
    globalThis.fetch = mock(async () => envelopeOk()) as unknown as typeof fetch

    const r = await mailboxRename({
      config: testConfig(),
      items: ["jane@example.com"],
      attr: { new_local_part: "janet", domain: "example.com", old_local_part: "jane" },
    })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/edit/rename-mbox`)
    expect(JSON.parse(init.body as string)).toEqual({
      attr: { new_local_part: "janet", domain: "example.com", old_local_part: "jane" },
      items: ["jane@example.com"],
    })
  })

  test("mailboxRename rejects attr without old_local_part with op", async () => {
    globalThis.fetch = mock(async () => envelopeOk()) as unknown as typeof fetch

    const r = await mailboxRename({
      config: testConfig(),
      items: ["jane@example.com"],
      attr: { new_local_part: "janet" },
    } as never)
    expect(r.success).toBe(false)
    if (!r.success) expect(r.op).toBe("mailboxRename")
  })

  test("mailboxUserAclEdit POSTs /edit/user-acl", async () => {
    globalThis.fetch = mock(async () => envelopeOk()) as unknown as typeof fetch

    const r = await mailboxUserAclEdit({
      config: testConfig(),
      items: ["jane@example.com"],
      attr: { user_acl: { pushover: "1" } },
    })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/edit/user-acl`)
    expect(JSON.parse(init.body as string)).toEqual({
      attr: { user_acl: { pushover: "1" } },
      items: ["jane@example.com"],
    })
  })

  test("mailboxSpamScoreEdit POSTs /edit/spam-score", async () => {
    globalThis.fetch = mock(async () => envelopeOk()) as unknown as typeof fetch

    const r = await mailboxSpamScoreEdit({
      config: testConfig(),
      items: ["jane@example.com"],
      attr: { spam_score: "5" },
    })
    expect(r.success).toBe(true)

    const [url] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/edit/spam-score`)
  })

  test("mailboxSpamScoreGet GETs /get/spam-score/{mailbox}", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify({ score: "5" }), { status: 200 })
    }) as unknown as typeof fetch

    const r = await mailboxSpamScoreGet({ config: testConfig(), mailbox: "jane@example.com" })
    expect(r.success).toBe(true)

    const [url] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/get/spam-score/jane%40example.com`)
  })

  test("mailboxDelimiterActionEdit POSTs /edit/delimiter_action", async () => {
    globalThis.fetch = mock(async () => envelopeOk()) as unknown as typeof fetch

    const r = await mailboxDelimiterActionEdit({
      config: testConfig(),
      items: ["jane@example.com"],
      attr: { tagged_mail_handler: "subject" },
    })
    expect(r.success).toBe(true)

    const [url] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/edit/delimiter_action`)
  })

  test("mailboxTlsPolicyEdit POSTs /edit/tls_policy", async () => {
    globalThis.fetch = mock(async () => envelopeOk()) as unknown as typeof fetch

    const r = await mailboxTlsPolicyEdit({
      config: testConfig(),
      items: ["jane@example.com"],
      attr: { tls_policy: "encrypt" },
    })
    expect(r.success).toBe(true)

    const [url] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/edit/tls_policy`)
  })

  test("mailboxQuarantineNotificationEdit POSTs /edit/quarantine_notification", async () => {
    globalThis.fetch = mock(async () => envelopeOk()) as unknown as typeof fetch

    const r = await mailboxQuarantineNotificationEdit({
      config: testConfig(),
      items: ["jane@example.com"],
      attr: { quarantine_notification: "daily" },
    })
    expect(r.success).toBe(true)

    const [url] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/edit/quarantine_notification`)
  })

  test("mailboxQuarantineCategoryEdit POSTs /edit/quarantine_category", async () => {
    globalThis.fetch = mock(async () => envelopeOk()) as unknown as typeof fetch

    const r = await mailboxQuarantineCategoryEdit({
      config: testConfig(),
      items: ["jane@example.com"],
      attr: { quarantine_category: "add_header" },
    })
    expect(r.success).toBe(true)

    const [url] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/edit/quarantine_category`)
  })

  test("mailboxPushoverEdit POSTs /edit/pushover", async () => {
    globalThis.fetch = mock(async () => envelopeOk()) as unknown as typeof fetch

    const r = await mailboxPushoverEdit({
      config: testConfig(),
      items: ["jane@example.com"],
      attr: { key: "k", token: "t", active: "1" },
    })
    expect(r.success).toBe(true)

    const [url] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/edit/pushover`)
  })

  test("mailboxPushoverTestEdit POSTs /edit/pushover-test", async () => {
    globalThis.fetch = mock(async () => envelopeOk()) as unknown as typeof fetch

    const r = await mailboxPushoverTestEdit({
      config: testConfig(),
      items: ["jane@example.com"],
      attr: { title: "hi", text: "test" },
    })
    expect(r.success).toBe(true)

    const [url] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/edit/pushover-test`)
  })

  test("mailboxActiveUserSieveGet normalizes {} to []", async () => {
    globalThis.fetch = mock(async () => new Response("{}", { status: 200 })) as unknown as typeof fetch

    const r = await mailboxActiveUserSieveGet({ config: testConfig(), mailbox: "jane@example.com" })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data).toEqual([])

    const [url] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/get/active-user-sieve/jane%40example.com`)
  })

  test("bccDestinationOptionsGet GETs /get/bcc-destination-options", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify({ domains: ["example.com"] }), { status: 200 })
    }) as unknown as typeof fetch

    const r = await bccDestinationOptionsGet({ config: testConfig() })
    expect(r.success).toBe(true)

    const [url] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/get/bcc-destination-options`)
  })

  test("mailboxLastLoginGet includes optional days segment", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify({ sasl: [] }), { status: 200 })
    }) as unknown as typeof fetch

    const r = await mailboxLastLoginGet({ config: testConfig(), user: "jane@example.com", days: 30 })
    expect(r.success).toBe(true)

    const [url] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/get/last-login/jane%40example.com/30`)
  })

  test("mailboxLastLoginReset GETs /get/reset-last-login/{user}", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify({}), { status: 200 })
    }) as unknown as typeof fetch

    const r = await mailboxLastLoginReset({ config: testConfig(), user: "jane@example.com" })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/get/reset-last-login/jane%40example.com`)
    expect(init.method).toBe("GET")
  })

  test("mailboxDelete POSTs the raw items array", async () => {
    globalThis.fetch = mock(async () => envelopeOk()) as unknown as typeof fetch

    const r = await mailboxDelete({ config: testConfig(), items: ["jane@example.com"] })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/delete/mailbox`)
    expect(JSON.parse(init.body as string)).toEqual(["jane@example.com"])
  })

  test("mailboxTemplateDelete POSTs /delete/mailbox/template", async () => {
    globalThis.fetch = mock(async () => envelopeOk()) as unknown as typeof fetch

    const r = await mailboxTemplateDelete({ config: testConfig(), items: [1] })
    expect(r.success).toBe(true)

    const [url] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/delete/mailbox/template`)
  })

  test("mailboxTagDelete encodes mailbox and sends tag items", async () => {
    globalThis.fetch = mock(async () => envelopeOk()) as unknown as typeof fetch

    const r = await mailboxTagDelete({ config: testConfig(), mailbox: "jane@example.com", items: ["vip"] })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/delete/mailbox/tag/jane%40example.com`)
    expect(JSON.parse(init.body as string)).toEqual(["vip"])
  })

  test("mailboxEasCacheDelete POSTs /delete/eas_cache", async () => {
    globalThis.fetch = mock(async () => envelopeOk()) as unknown as typeof fetch

    const r = await mailboxEasCacheDelete({ config: testConfig(), items: ["jane@example.com"] })
    expect(r.success).toBe(true)

    const [url] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/delete/eas_cache`)
  })

  test("mailboxSogoProfileDelete POSTs /delete/sogo_profile", async () => {
    globalThis.fetch = mock(async () => envelopeOk()) as unknown as typeof fetch

    const r = await mailboxSogoProfileDelete({ config: testConfig(), items: ["jane@example.com"] })
    expect(r.success).toBe(true)

    const [url] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/delete/sogo_profile`)
  })

  test("mailboxSearch POSTs DataTables body to /search/mailbox", async () => {
    globalThis.fetch = mock(async () => {
      return new Response(JSON.stringify({ draw: 2, recordsTotal: 1, recordsFiltered: 1, data: [] }), {
        status: 200,
      })
    }) as unknown as typeof fetch

    const r = await mailboxSearch({ config: testConfig(), draw: 2, length: 25 })
    expect(r.success).toBe(true)

    const [url, init] = lastCall()
    expect(url).toBe(`${baseUrl}/api/v1/search/mailbox`)
    expect(JSON.parse(init.body as string)).toEqual({ draw: 2, length: 25 })
  })
})
