import { afterAll, beforeAll, describe, expect, test } from "bun:test"
import {
  adminList,
  aliasAdd,
  aliasDelete,
  aliasDomainAdd,
  aliasDomainDelete,
  aliasDomainEdit,
  aliasDomainGet,
  aliasDomainList,
  aliasEdit,
  aliasGet,
  aliasList,
  appPasswordAdd,
  appPasswordDelete,
  appPasswordEdit,
  appPasswordGet,
  appPasswordList,
  bccAdd,
  bccDelete,
  bccEdit,
  bccGet,
  bccList,
  dkimAdd,
  dkimDelete,
  dkimDuplicateAdd,
  dkimGet,
  domainAdd,
  domainAdminAclEdit,
  domainAdminAdd,
  domainAdminDelete,
  domainAdminEdit,
  domainAdminGet,
  domainAdminList,
  domainAdminSsoAdd,
  domainDelete,
  domainEdit,
  domainFooterEdit,
  domainGet,
  domainList,
  domainPolicyAdd,
  domainPolicyBlList,
  domainPolicyDelete,
  domainPolicyWlList,
  domainSearch,
  domainTagDelete,
  domainTemplateAdd,
  domainTemplateDelete,
  domainTemplateEdit,
  domainTemplateGet,
  domainTemplateList,
  fail2banGet,
  filterAdd,
  filterDelete,
  filterEdit,
  filterList,
  fwdhostAdd,
  fwdhostDelete,
  fwdhostEdit,
  fwdhostGet,
  fwdhostList,
  mailboxActiveUserSieveGet,
  mailboxAdd,
  mailboxCustomAttributeEdit,
  mailboxDelete,
  mailboxDelimiterActionEdit,
  mailboxEasCacheDelete,
  mailboxEdit,
  mailboxGet,
  mailboxLastLoginGet,
  mailboxLastLoginReset,
  mailboxList,
  mailboxPolicyAdd,
  mailboxPolicyBlList,
  mailboxPolicyDelete,
  mailboxPolicyWlList,
  mailboxPushoverEdit,
  mailboxQuarantineCategoryEdit,
  mailboxQuarantineNotificationEdit,
  mailboxReducedList,
  mailboxRename,
  mailboxSearch,
  mailboxSogoProfileDelete,
  mailboxSpamScoreEdit,
  mailboxSpamScoreGet,
  mailboxTagDelete,
  mailboxTemplateAdd,
  mailboxTemplateDelete,
  mailboxTemplateEdit,
  mailboxTemplateGet,
  mailboxTemplateList,
  mailboxTlsPolicyEdit,
  mailboxUserAclEdit,
  mailqList,
  mtaStsAdd,
  mtaStsEdit,
  oauth2ClientAdd,
  oauth2ClientDelete,
  oauth2ClientEdit,
  oauth2ClientGet,
  oauth2ClientList,
  quarantineList,
  ratelimitDomainEdit,
  ratelimitDomainGet,
  ratelimitDomainList,
  ratelimitHashDelete,
  ratelimitMailboxEdit,
  ratelimitMailboxGet,
  ratelimitMailboxList,
  recipientMapAdd,
  recipientMapDelete,
  recipientMapEdit,
  recipientMapGet,
  recipientMapList,
  relayhostAdd,
  relayhostDelete,
  relayhostEdit,
  relayhostGet,
  relayhostList,
  resourceAdd,
  resourceDelete,
  resourceEdit,
  resourceGet,
  resourceList,
  rsettingGet,
  rsettingList,
  syncJobAdd,
  syncJobDelete,
  syncJobEdit,
  syncJobGet,
  syncJobList,
  timeLimitedAliasAdd,
  timeLimitedAliasDelete,
  timeLimitedAliasEdit,
  timeLimitedAliasList,
  tlsPolicyMapAdd,
  tlsPolicyMapDelete,
  tlsPolicyMapEdit,
  tlsPolicyMapGet,
  tlsPolicyMapList,
  transportAdd,
  transportDelete,
  transportEdit,
  transportGet,
  transportList,
} from "../dist/index.js"
import type { MailcowClientConfig } from "../dist/client/mailcowClientConfigSchema.js"
import { mailcowE2eCleanup } from "./mailcowE2eCleanup.js"
import { mailcowE2eResultAssert } from "./mailcowE2eResultAssert.js"
import { mailcowE2eRunId } from "./mailcowE2eRunId.js"
import { mailcowE2eSetup } from "./mailcowE2eSetup.js"

const cleanup = mailcowE2eCleanup()
const runId = mailcowE2eRunId()
const testDomain = `${runId}.mc-client-test.contentoren.com`
const testAliasDomain = `al-${runId}.mc-client-test.contentoren.com`
const testMailbox = `t-${runId}@${testDomain}`
const testMailboxTwo = `t-${runId}-b@${testDomain}`
const testAlias = `a-${runId}@${testDomain}`
const testPassword = `E2e-${crypto.randomUUID().replaceAll("-", "")}x9!`
const testAdminPassword = `E2e-${crypto.randomUUID().replaceAll("-", "")}y9!`
const testAdminUser = `da-${runId}`
const testAppPassword = `E2e-${crypto.randomUUID().replaceAll("-", "")}z9!`
const testDomainTemplate = `tpl-${runId}`
const testMailboxTemplate = `mbx-tpl-${runId}`
const testTag = `e2e-${runId}`
const testResourceDerived = `e2e${runId.replaceAll("-", "")}@${testDomain}`
const testRelayhost = `relay-${runId}.invalid`
const testTransportDest = `transport-${runId}.invalid`
const testTlsDest = `tls-${runId}.invalid`

let config: MailcowClientConfig
let snapshotDomains = 0
let snapshotMailboxes = 0
let snapshotAliases = 0

async function mailcowE2ePollAbsent(label: string, check: () => Promise<boolean>): Promise<void> {
  const deadline = Date.now() + 15_000
  for (;;) {
    if (await check()) return
    if (Date.now() >= deadline) throw new Error(`Live E2E teardown poll timed out: ${label} still present`)
    await Bun.sleep(1_000)
  }
}

function mailcowE2eSearchColumns(count: number, searchable: number[]): Array<{ data: number }> {
  // Only real DB columns may be searchable live: dummy SSP columns (e.g. domain `stats`)
  // reference nonexistent fields and blank the whole response when searched.
  return Array.from({ length: count }, (_, index) => ({
    data: index,
    searchable: searchable.includes(index) ? "true" : "false",
    search: { value: "" },
  })) as Array<{ data: number }>
}

async function mailcowE2eDeleteTolerant(
  label: string,
  attempt: () => Promise<{ success: boolean; errorMessage?: string }>,
  verifyGone: () => Promise<boolean>,
): Promise<void> {
  const result = await attempt()
  if (result.success) return
  if (result.errorMessage?.includes("garbage collector") === true) {
    console.info(`Live E2E ${label}: benign maildir-garbage-collector warning; verifying row deletion`)
    if (await verifyGone()) return
  }
  throw new Error(`Live E2E ${label} failed: ${result.errorMessage ?? "unknown"}`)
}

function testScopeGuard(label: string, value: string): void {
  if (value === testDomain || value === testAliasDomain || value.includes(runId)) return
  throw new Error(`Live E2E scope guard tripped for ${label}: value is outside the run ${runId}`)
}

beforeAll(async () => {
  config = mailcowE2eSetup()

  const fail2ban = mailcowE2eResultAssert("fail2banGet pre-flight", await fail2banGet({ config }))
  const whitelist = (fail2ban as { whitelist?: unknown }).whitelist
  expect(whitelist).toBeTruthy()

  const preflight = mailcowE2eResultAssert("domainGet pre-flight", await domainGet({ config, domain: testDomain }))
  if (preflight.domain_name !== undefined) {
    throw new Error(`Live E2E pre-flight abort: test domain ${testDomain} already exists`)
  }

  snapshotDomains = mailcowE2eResultAssert("domainList snapshot", await domainList({ config })).length
  snapshotMailboxes = mailcowE2eResultAssert("mailboxList snapshot", await mailboxList({ config })).length
  snapshotAliases = mailcowE2eResultAssert("aliasList snapshot", await aliasList({ config })).length
  console.info(
    `Live E2E run ${runId}: snapshots domains=${snapshotDomains} mailboxes=${snapshotMailboxes} aliases=${snapshotAliases}`,
  )
})

afterAll(async () => {
  try {
    await cleanup.run()
  } catch (error) {
    console.info(`Live E2E afterAll best-effort cleanup: ${error instanceof Error ? error.message : String(error)}`)
  }
})

describe("live domain lifecycle", () => {
  test(
    "domainTemplateAdd creates a run-scoped template",
    async () => {
      const added = mailcowE2eResultAssert(
        "domainTemplateAdd",
        await domainTemplateAdd({ config, attr: { template: testDomainTemplate, mailboxes: 5 } }),
      )
      expect(added.length).toBeGreaterThan(0)
      cleanup.add(async () => {
        const templates = await domainTemplateList({ config })
        if (!templates.success) throw new Error(`domainTemplateList for teardown failed: ${templates.errorMessage}`)
        const entry = templates.data.find((item) => String(item.template ?? item.id) === testDomainTemplate)
        if (!entry) return
        const deleted = await domainTemplateDelete({ config, items: [entry.id as number] })
        if (!deleted.success) throw new Error(`domainTemplateDelete failed: ${deleted.errorMessage}`)
        await mailcowE2ePollAbsent("domain template", async () => {
          const listed = await domainTemplateList({ config })
          if (!listed.success) return false
          return !listed.data.some((item) => String(item.template ?? item.id) === testDomainTemplate)
        })
      })
    },
    { timeout: 30_000 },
  )

  test(
    "domainTemplateGet reads the run-scoped template",
    async () => {
      const template = mailcowE2eResultAssert(
        "domainTemplateGet",
        await domainTemplateGet({ config, id: testDomainTemplate }),
      )
      expect(template).not.toBeNull()
    },
    { timeout: 30_000 },
  )

  test(
    "domainTemplateList contains the run-scoped template",
    async () => {
      const templates = mailcowE2eResultAssert("domainTemplateList", await domainTemplateList({ config }))
      expect(templates.some((entry) => String(entry.template ?? entry.id) === testDomainTemplate)).toBe(true)
    },
    { timeout: 30_000 },
  )

  test(
    "domainTemplateEdit updates the run-scoped template by numeric id",
    async () => {
      const templates = mailcowE2eResultAssert("domainTemplateList for edit", await domainTemplateList({ config }))
      const entry = templates.find((item) => String(item.template ?? item.id) === testDomainTemplate)
      expect(entry?.id).not.toBeUndefined()
      const edited = mailcowE2eResultAssert(
        "domainTemplateEdit",
        await domainTemplateEdit({ config, items: [entry?.id as number], attr: { mailboxes: 6 } }),
      )
      expect(edited.length).toBeGreaterThan(0)
    },
    { timeout: 30_000 },
  )

  test(
    "domainAdd creates the run-scoped test domain",
    async () => {
      const added = mailcowE2eResultAssert(
        "domainAdd",
        await domainAdd({
          config,
          attr: { domain: testDomain, active: "1", mailboxes: 5, quota: 10240, maxquota: 10240, tags: [testTag] },
        }),
      )
      expect(added.length).toBeGreaterThan(0)
      cleanup.add(async () => {
        await mailcowE2eDeleteTolerant(
          "domainDelete",
          () => domainDelete({ config, items: [testDomain] }),
          async () => {
            const domains = await domainList({ config })
            if (!domains.success) return false
            return !domains.data.some((entry) => entry.domain_name === testDomain)
          },
        )
      })
    },
    { timeout: 60_000 },
  )

  test(
    "domainGet reads the test domain back under its live domain_name key",
    async () => {
      // Live shape uses `domain_name`, not `domain` (typed on DomainDetails).
      const domain = mailcowE2eResultAssert("domainGet", await domainGet({ config, domain: testDomain }))
      expect(domain.domain_name).toBe(testDomain)
    },
    { timeout: 30_000 },
  )

  test(
    "domainList contains the test domain under its live domain_name key",
    async () => {
      const domains = mailcowE2eResultAssert("domainList", await domainList({ config }))
      expect(domains.some((entry) => entry.domain_name === testDomain)).toBe(true)
    },
    { timeout: 30_000 },
  )

  test(
    "domainEdit bumps the test domain description",
    async () => {
      testScopeGuard("domainEdit", testDomain)
      const edited = mailcowE2eResultAssert(
        "domainEdit",
        await domainEdit({ config, items: [testDomain], attr: { description: `e2e ${runId}` } }),
      )
      expect(edited.length).toBeGreaterThan(0)
      const domain = mailcowE2eResultAssert("domainGet after edit", await domainGet({ config, domain: testDomain }))
      expect(domain.description).toBe(`e2e ${runId}`)
    },
    { timeout: 30_000 },
  )

  test(
    "domainFooterEdit sets a footer on the test domain",
    async () => {
      testScopeGuard("domainFooterEdit", testDomain)
      const edited = mailcowE2eResultAssert(
        "domainFooterEdit",
        await domainFooterEdit({ config, items: [testDomain], attr: { plain: `e2e footer ${runId}` } }),
      )
      expect(edited.length).toBeGreaterThan(0)
    },
    { timeout: 30_000 },
  )

  test(
    "domainSearch finds the test domain",
    async () => {
      // SSP global search requires request.columns (count() on missing columns fatals upstream).
      const searched = mailcowE2eResultAssert(
        "domainSearch",
        await domainSearch({
          config,
          draw: 1,
          start: 0,
          length: 10,
          search: { value: testDomain },
          columns: mailcowE2eSearchColumns(16, [2, 3, 4, 5, 7, 8, 10, 15]),
        }),
      )
      expect((searched.data ?? []).length).toBeGreaterThan(0)
    },
    { timeout: 30_000 },
  )

  test(
    "domainTagDelete removes the run tag from the test domain",
    async () => {
      testScopeGuard("domainTagDelete", testDomain)
      const deleted = mailcowE2eResultAssert(
        "domainTagDelete",
        await domainTagDelete({ config, domain: testDomain, items: [testTag] }),
      )
      expect(deleted.length).toBeGreaterThan(0)
    },
    { timeout: 30_000 },
  )
})

describe("live mailbox lifecycle", () => {
  test(
    "mailboxTemplateAdd creates a run-scoped template",
    async () => {
      const added = mailcowE2eResultAssert(
        "mailboxTemplateAdd",
        await mailboxTemplateAdd({ config, attr: { template: testMailboxTemplate, quota: 3072 } }),
      )
      expect(added.length).toBeGreaterThan(0)
      cleanup.add(async () => {
        const templates = await mailboxTemplateList({ config })
        if (!templates.success) throw new Error(`mailboxTemplateList for teardown failed: ${templates.errorMessage}`)
        const entry = templates.data.find((item) => String(item.template ?? item.id) === testMailboxTemplate)
        if (!entry) return
        const deleted = await mailboxTemplateDelete({ config, items: [entry.id as number] })
        if (!deleted.success) throw new Error(`mailboxTemplateDelete failed: ${deleted.errorMessage}`)
        await mailcowE2ePollAbsent("mailbox template", async () => {
          const listed = await mailboxTemplateList({ config })
          if (!listed.success) return false
          return !listed.data.some((item) => String(item.template ?? item.id) === testMailboxTemplate)
        })
      })
    },
    { timeout: 30_000 },
  )

  test(
    "mailboxTemplateGet reads the run-scoped template",
    async () => {
      const template = mailcowE2eResultAssert(
        "mailboxTemplateGet",
        await mailboxTemplateGet({ config, id: testMailboxTemplate }),
      )
      expect(template).not.toBeNull()
    },
    { timeout: 30_000 },
  )

  test(
    "mailboxTemplateList contains the run-scoped template",
    async () => {
      const templates = mailcowE2eResultAssert("mailboxTemplateList", await mailboxTemplateList({ config }))
      expect(templates.some((entry) => String(entry.template ?? entry.id) === testMailboxTemplate)).toBe(true)
    },
    { timeout: 30_000 },
  )

  test(
    "mailboxTemplateEdit updates the run-scoped template by numeric id",
    async () => {
      const templates = mailcowE2eResultAssert("mailboxTemplateList for edit", await mailboxTemplateList({ config }))
      const entry = templates.find((item) => String(item.template ?? item.id) === testMailboxTemplate)
      expect(entry?.id).not.toBeUndefined()
      // Template edits validate the full attribute set; pass the quarantine fields explicitly.
      const edited = mailcowE2eResultAssert(
        "mailboxTemplateEdit",
        await mailboxTemplateEdit({
          config,
          items: [entry?.id as number],
          attr: { quota: 4096, quarantine_notification: "hourly", quarantine_category: "reject" },
        }),
      )
      expect(edited.length).toBeGreaterThan(0)
    },
    { timeout: 30_000 },
  )

  test(
    "mailboxAdd creates the test mailbox",
    async () => {
      testScopeGuard("mailboxAdd", testMailbox)
      const added = mailcowE2eResultAssert(
        "mailboxAdd",
        await mailboxAdd({
          config,
          attr: {
            local_part: testMailbox.split("@")[0] as string,
            domain: testDomain,
            password: testPassword,
            password2: testPassword,
            name: `e2e ${runId}`,
            quota: 3072,
            force_pw_update: "0",
            tags: [testTag],
          },
        }),
      )
      expect(added.length).toBeGreaterThan(0)
      cleanup.add(async () => {
        await mailcowE2eDeleteTolerant(
          "mailboxDelete",
          () => mailboxDelete({ config, items: [testMailbox] }),
          async () => {
            const mailboxes = await mailboxList({ config })
            if (!mailboxes.success) return false
            return !mailboxes.data.some((entry) => entry.username === testMailbox)
          },
        )
      })
    },
    { timeout: 60_000 },
  )

  test(
    "mailboxGet reads the test mailbox back",
    async () => {
      const mailbox = mailcowE2eResultAssert("mailboxGet", await mailboxGet({ config, mailbox: testMailbox }))
      expect(mailbox.username).toBe(testMailbox)
    },
    { timeout: 30_000 },
  )

  test(
    "mailboxList contains the test mailbox",
    async () => {
      const mailboxes = mailcowE2eResultAssert("mailboxList", await mailboxList({ config }))
      expect(mailboxes.some((entry) => entry.username === testMailbox)).toBe(true)
    },
    { timeout: 30_000 },
  )

  test(
    "mailboxReducedList contains the test mailbox",
    async () => {
      const mailboxes = mailcowE2eResultAssert("mailboxReducedList", await mailboxReducedList({ config }))
      expect(mailboxes.some((entry) => entry.username === testMailbox)).toBe(true)
    },
    { timeout: 30_000 },
  )

  test(
    "mailboxSpamScoreGet reads the test mailbox spam score",
    async () => {
      const score = mailcowE2eResultAssert(
        "mailboxSpamScoreGet",
        await mailboxSpamScoreGet({ config, mailbox: testMailbox }),
      )
      expect(score).not.toBeNull()
    },
    { timeout: 30_000 },
  )

  test(
    "mailboxActiveUserSieveGet reads the test mailbox sieve state",
    async () => {
      const sieve = mailcowE2eResultAssert(
        "mailboxActiveUserSieveGet",
        await mailboxActiveUserSieveGet({ config, mailbox: testMailbox }),
      )
      expect(sieve).not.toBeNull()
    },
    { timeout: 30_000 },
  )

  test(
    "mailboxLastLoginGet reads the test mailbox login state",
    async () => {
      const login = mailcowE2eResultAssert(
        "mailboxLastLoginGet",
        await mailboxLastLoginGet({ config, user: testMailbox }),
      )
      expect(login).not.toBeNull()
    },
    { timeout: 30_000 },
  )

  test(
    "mailboxEdit renames the display name",
    async () => {
      testScopeGuard("mailboxEdit", testMailbox)
      const edited = mailcowE2eResultAssert(
        "mailboxEdit",
        await mailboxEdit({ config, items: [testMailbox], attr: { name: `e2e renamed ${runId}` } }),
      )
      expect(edited.length).toBeGreaterThan(0)
      const mailbox = mailcowE2eResultAssert(
        "mailboxGet after edit",
        await mailboxGet({ config, mailbox: testMailbox }),
      )
      expect(mailbox.name).toBe(`e2e renamed ${runId}`)
    },
    { timeout: 30_000 },
  )

  test(
    "mailboxCustomAttributeEdit sets a custom attribute",
    async () => {
      testScopeGuard("mailboxCustomAttributeEdit", testMailbox)
      const edited = mailcowE2eResultAssert(
        "mailboxCustomAttributeEdit",
        await mailboxCustomAttributeEdit({ config, items: [testMailbox], attr: { [`e2e-${runId}`]: "1" } }),
      )
      expect(edited.length).toBeGreaterThan(0)
    },
    { timeout: 30_000 },
  )

  test(
    "mailboxUserAclEdit sets an empty user acl",
    async () => {
      testScopeGuard("mailboxUserAclEdit", testMailbox)
      const edited = mailcowE2eResultAssert(
        "mailboxUserAclEdit",
        await mailboxUserAclEdit({ config, items: [testMailbox], attr: { user_acl: {} } }),
      )
      expect(edited.length).toBeGreaterThan(0)
    },
    { timeout: 30_000 },
  )

  test(
    "mailboxSpamScoreEdit sets the spam score policy",
    async () => {
      testScopeGuard("mailboxSpamScoreEdit", testMailbox)
      const edited = mailcowE2eResultAssert(
        "mailboxSpamScoreEdit",
        await mailboxSpamScoreEdit({ config, items: [testMailbox], attr: { spam_score: "default" } }),
      )
      expect(edited.length).toBeGreaterThan(0)
    },
    { timeout: 30_000 },
  )

  test(
    "mailboxDelimiterActionEdit sets the delimiter action",
    async () => {
      testScopeGuard("mailboxDelimiterActionEdit", testMailbox)
      const edited = mailcowE2eResultAssert(
        "mailboxDelimiterActionEdit",
        await mailboxDelimiterActionEdit({ config, items: [testMailbox], attr: { tagged_mail_handler: "subaddress" } }),
      )
      expect(edited.length).toBeGreaterThan(0)
    },
    { timeout: 30_000 },
  )

  test(
    "mailboxTlsPolicyEdit sets the tls policy",
    async () => {
      testScopeGuard("mailboxTlsPolicyEdit", testMailbox)
      const edited = mailcowE2eResultAssert(
        "mailboxTlsPolicyEdit",
        await mailboxTlsPolicyEdit({ config, items: [testMailbox], attr: { tls_policy: "none" } }),
      )
      expect(edited.length).toBeGreaterThan(0)
    },
    { timeout: 30_000 },
  )

  test(
    "mailboxQuarantineNotificationEdit sets the notification interval",
    async () => {
      testScopeGuard("mailboxQuarantineNotificationEdit", testMailbox)
      const edited = mailcowE2eResultAssert(
        "mailboxQuarantineNotificationEdit",
        await mailboxQuarantineNotificationEdit({
          config,
          items: [testMailbox],
          attr: { quarantine_notification: "hourly" },
        }),
      )
      expect(edited.length).toBeGreaterThan(0)
    },
    { timeout: 30_000 },
  )

  test(
    "mailboxQuarantineCategoryEdit sets the quarantine category",
    async () => {
      testScopeGuard("mailboxQuarantineCategoryEdit", testMailbox)
      const edited = mailcowE2eResultAssert(
        "mailboxQuarantineCategoryEdit",
        await mailboxQuarantineCategoryEdit({
          config,
          items: [testMailbox],
          attr: { quarantine_category: "add_header" },
        }),
      )
      expect(edited.length).toBeGreaterThan(0)
    },
    { timeout: 30_000 },
  )

  test(
    "mailboxPushoverEdit stores dummy 30-char creds disabled (no pushover-test live, row dies with mailbox)",
    async () => {
      testScopeGuard("mailboxPushoverEdit", testMailbox)
      const dummyKey = `e2e${runId.replaceAll("-", "")}key`.padEnd(30, "0").slice(0, 30)
      const dummyToken = `e2e${runId.replaceAll("-", "")}tok`.padEnd(30, "0").slice(0, 30)
      const edited = mailcowE2eResultAssert(
        "mailboxPushoverEdit",
        await mailboxPushoverEdit({
          config,
          items: [testMailbox],
          attr: { key: dummyKey, token: dummyToken, active: "0" },
        }),
      )
      expect(edited.length).toBeGreaterThan(0)
    },
    { timeout: 30_000 },
  )

  test(
    "mailboxSearch finds the test mailbox",
    async () => {
      const searched = mailcowE2eResultAssert(
        "mailboxSearch",
        await mailboxSearch({
          config,
          draw: 1,
          start: 0,
          length: 10,
          search: { value: testMailbox },
          columns: mailcowE2eSearchColumns(25, [2, 3, 7, 24]),
        }),
      )
      expect((searched.data ?? []).length).toBeGreaterThan(0)
    },
    { timeout: 30_000 },
  )

  test(
    "mailboxTagDelete removes the run tag from the test mailbox",
    async () => {
      testScopeGuard("mailboxTagDelete", testMailbox)
      const deleted = mailcowE2eResultAssert(
        "mailboxTagDelete",
        await mailboxTagDelete({ config, mailbox: testMailbox, items: [testTag] }),
      )
      expect(deleted.length).toBeGreaterThan(0)
    },
    { timeout: 30_000 },
  )

  test(
    "mailboxLastLoginReset clears the test mailbox login state",
    async () => {
      testScopeGuard("mailboxLastLoginReset", testMailbox)
      const reset = mailcowE2eResultAssert(
        "mailboxLastLoginReset",
        await mailboxLastLoginReset({ config, user: testMailbox }),
      )
      console.info(`Live E2E mailboxLastLoginReset returned: ${JSON.stringify(reset)?.slice(0, 80)}`)
      const login = mailcowE2eResultAssert(
        "mailboxLastLoginGet after reset",
        await mailboxLastLoginGet({ config, user: testMailbox }),
      )
      expect(login).not.toBeNull()
    },
    { timeout: 30_000 },
  )

  test(
    "mailboxRename moves a throwaway mailbox and deletes it",
    async () => {
      const localTwo = testMailboxTwo.split("@")[0] as string
      const renamedLocal = `${localTwo}-renamed`
      const renamedAddress = `${renamedLocal}@${testDomain}`
      testScopeGuard("mailboxRename setup", testMailboxTwo)
      const added = mailcowE2eResultAssert(
        "mailboxAdd throwaway",
        await mailboxAdd({
          config,
          attr: { local_part: localTwo, domain: testDomain, password: testPassword, password2: testPassword },
        }),
      )
      expect(added.length).toBeGreaterThan(0)
      // Upstream requires old_local_part + domain in attr (items alone build "@").
      const renamed = mailcowE2eResultAssert(
        "mailboxRename",
        await mailboxRename({
          config,
          items: [testMailboxTwo],
          attr: { new_local_part: renamedLocal, domain: testDomain, old_local_part: localTwo },
        }),
      )
      expect(renamed.length).toBeGreaterThan(0)
      const fetched = mailcowE2eResultAssert(
        "mailboxGet after rename",
        await mailboxGet({ config, mailbox: renamedAddress }),
      )
      expect(fetched.username).toBe(renamedAddress)
      await mailcowE2eDeleteTolerant(
        "mailboxDelete throwaway",
        () => mailboxDelete({ config, items: [renamedAddress] }),
        async () => {
          const mailboxes = await mailboxList({ config })
          if (!mailboxes.success) return false
          return !mailboxes.data.some((entry) => entry.username === renamedAddress)
        },
      )
    },
    { timeout: 60_000 },
  )

  test(
    "mailboxEasCacheDelete and mailboxSogoProfileDelete wipe test mailbox caches",
    async () => {
      testScopeGuard("mailbox cache deletes", testMailbox)
      const eas = mailcowE2eResultAssert(
        "mailboxEasCacheDelete",
        await mailboxEasCacheDelete({ config, items: [testMailbox] }),
      )
      expect(eas.length).toBeGreaterThan(0)
      const sogo = mailcowE2eResultAssert(
        "mailboxSogoProfileDelete",
        await mailboxSogoProfileDelete({ config, items: [testMailbox] }),
      )
      expect(sogo.length).toBeGreaterThan(0)
    },
    { timeout: 30_000 },
  )
})

describe("live alias and time-limited alias lifecycle", () => {
  test(
    "aliasAdd creates a test alias forwarding to the test mailbox",
    async () => {
      testScopeGuard("aliasAdd", testAlias)
      const added = mailcowE2eResultAssert(
        "aliasAdd",
        await aliasAdd({ config, attr: { address: testAlias, goto: testMailbox, active: "1" } }),
      )
      expect(added.length).toBeGreaterThan(0)
      cleanup.add(async () => {
        const deleted = await aliasDelete({ config, items: [testAlias] })
        if (!deleted.success) throw new Error(`aliasDelete failed: ${deleted.errorMessage}`)
      })
    },
    { timeout: 30_000 },
  )

  test(
    "aliasGet reads the test alias back",
    async () => {
      const alias = mailcowE2eResultAssert("aliasGet", await aliasGet({ config, address: testAlias }))
      expect(alias.address).toBe(testAlias)
    },
    { timeout: 30_000 },
  )

  test(
    "aliasEdit toggles the test alias comment",
    async () => {
      testScopeGuard("aliasEdit", testAlias)
      const edited = mailcowE2eResultAssert(
        "aliasEdit",
        await aliasEdit({ config, items: [testAlias], attr: { public_comment: `e2e ${runId}` } }),
      )
      expect(edited.length).toBeGreaterThan(0)
    },
    { timeout: 30_000 },
  )

  test(
    "aliasList contains the test alias",
    async () => {
      const aliases = mailcowE2eResultAssert("aliasList", await aliasList({ config }))
      expect(aliases.some((entry) => entry.address === testAlias)).toBe(true)
    },
    { timeout: 30_000 },
  )

  test(
    "timeLimitedAliasAdd creates a throwaway alias for the test mailbox",
    async () => {
      testScopeGuard("timeLimitedAliasAdd", testMailbox)
      // Upstream requires username to be the full address (a bare local part falls back
      // to the pseudo-user and fails with domain_invalid).
      const added = mailcowE2eResultAssert(
        "timeLimitedAliasAdd",
        await timeLimitedAliasAdd({ config, attr: { username: testMailbox, domain: testDomain, validity: 1 } }),
      )
      expect(added.length).toBeGreaterThan(0)
    },
    { timeout: 30_000 },
  )

  test(
    "timeLimitedAliasList shows a throwaway alias for the test mailbox",
    async () => {
      const listed = mailcowE2eResultAssert(
        "timeLimitedAliasList",
        await timeLimitedAliasList({ config, mailbox: testMailbox }),
      )
      expect(listed.length).toBeGreaterThan(0)
    },
    { timeout: 30_000 },
  )

  test(
    "timeLimitedAliasEdit extends the throwaway alias validity",
    async () => {
      const listed = mailcowE2eResultAssert(
        "timeLimitedAliasList for edit",
        await timeLimitedAliasList({ config, mailbox: testMailbox }),
      )
      const address = listed[0]?.address
      expect(address).toBeString()
      testScopeGuard("timeLimitedAliasEdit", address as string)
      const edited = mailcowE2eResultAssert(
        "timeLimitedAliasEdit",
        await timeLimitedAliasEdit({ config, items: [address as string], attr: { validity: 2 } }),
      )
      expect(edited.length).toBeGreaterThan(0)
    },
    { timeout: 30_000 },
  )

  test(
    "timeLimitedAliasDelete removes the throwaway alias",
    async () => {
      const listed = mailcowE2eResultAssert(
        "timeLimitedAliasList for delete",
        await timeLimitedAliasList({ config, mailbox: testMailbox }),
      )
      const address = listed[0]?.address
      expect(address).toBeString()
      testScopeGuard("timeLimitedAliasDelete", address as string)
      const deleted = mailcowE2eResultAssert(
        "timeLimitedAliasDelete",
        await timeLimitedAliasDelete({ config, items: [address as string] }),
      )
      expect(deleted.length).toBeGreaterThan(0)
    },
    { timeout: 30_000 },
  )
})

describe("live alias-domain and resource lifecycle", () => {
  test(
    "aliasDomainAdd creates a run-scoped alias of the test domain",
    async () => {
      testScopeGuard("aliasDomainAdd", testAliasDomain)
      const added = mailcowE2eResultAssert(
        "aliasDomainAdd",
        await aliasDomainAdd({ config, attr: { alias_domain: testAliasDomain, target_domain: testDomain } }),
      )
      expect(added.length).toBeGreaterThan(0)
      cleanup.add(async () => {
        const deleted = await aliasDomainDelete({ config, items: [testAliasDomain] })
        if (!deleted.success) throw new Error(`aliasDomainDelete failed: ${deleted.errorMessage}`)
      })
    },
    { timeout: 30_000 },
  )

  test(
    "aliasDomainGet reads the alias domain back",
    async () => {
      const aliasDomain = mailcowE2eResultAssert(
        "aliasDomainGet",
        await aliasDomainGet({ config, domain: testAliasDomain }),
      )
      expect(aliasDomain.alias_domain).toBe(testAliasDomain)
    },
    { timeout: 30_000 },
  )

  test(
    "aliasDomainList contains the alias domain",
    async () => {
      const aliasDomains = mailcowE2eResultAssert("aliasDomainList", await aliasDomainList({ config }))
      expect(aliasDomains.some((entry) => entry.alias_domain === testAliasDomain)).toBe(true)
    },
    { timeout: 30_000 },
  )

  test(
    "aliasDomainEdit toggles the alias domain active flag",
    async () => {
      testScopeGuard("aliasDomainEdit", testAliasDomain)
      const edited = mailcowE2eResultAssert(
        "aliasDomainEdit",
        await aliasDomainEdit({ config, items: [testAliasDomain], attr: { active: "1" } }),
      )
      expect(edited.length).toBeGreaterThan(0)
    },
    { timeout: 30_000 },
  )

  test(
    "resourceAdd creates a run-scoped resource in the test domain",
    async () => {
      // Upstream ignores attr.name and derives name = sanitized(description)@domain,
      // so only description is sent (client requires it, no name field).
      testScopeGuard("resourceAdd", testDomain)
      const added = mailcowE2eResultAssert(
        "resourceAdd",
        await resourceAdd({
          config,
          attr: { domain: testDomain, kind: "location", description: `e2e ${runId}` },
        }),
      )
      expect(added.length).toBeGreaterThan(0)
      cleanup.add(async () => {
        const deleted = await resourceDelete({ config, items: [testResourceDerived] })
        if (!deleted.success) throw new Error(`resourceDelete failed: ${deleted.errorMessage}`)
      })
    },
    { timeout: 30_000 },
  )

  test(
    "resourceGet reads the test resource back under its derived name",
    async () => {
      const resource = mailcowE2eResultAssert("resourceGet", await resourceGet({ config, name: testResourceDerived }))
      expect(resource.name).toBe(testResourceDerived)
    },
    { timeout: 30_000 },
  )

  test(
    "resourceList contains the test resource under its derived name",
    async () => {
      const resources = mailcowE2eResultAssert("resourceList", await resourceList({ config }))
      expect(resources.some((entry) => entry.name === testResourceDerived)).toBe(true)
    },
    { timeout: 30_000 },
  )

  test(
    "resourceEdit updates the test resource description",
    async () => {
      testScopeGuard("resourceEdit", testResourceDerived)
      const edited = mailcowE2eResultAssert(
        "resourceEdit",
        await resourceEdit({ config, items: [testResourceDerived], attr: { description: `e2e edited ${runId}` } }),
      )
      expect(edited.length).toBeGreaterThan(0)
    },
    { timeout: 30_000 },
  )
})

describe("live domain-admin lifecycle", () => {
  test(
    "domainAdminAdd creates a domain admin scoped to the test domain",
    async () => {
      testScopeGuard("domainAdminAdd", testDomain)
      const added = mailcowE2eResultAssert(
        "domainAdminAdd",
        await domainAdminAdd({
          config,
          attr: {
            username: testAdminUser,
            password: testAdminPassword,
            password2: testAdminPassword,
            domains: [testDomain],
          },
        }),
      )
      expect(added.length).toBeGreaterThan(0)
      cleanup.add(async () => {
        const deleted = await domainAdminDelete({ config, items: [testAdminUser] })
        if (!deleted.success) throw new Error(`domainAdminDelete failed: ${deleted.errorMessage}`)
      })
    },
    { timeout: 30_000 },
  )

  test(
    "domainAdminGet reads the test domain admin back",
    async () => {
      const admin = mailcowE2eResultAssert("domainAdminGet", await domainAdminGet({ config, username: testAdminUser }))
      expect(admin).not.toBeNull()
    },
    { timeout: 30_000 },
  )

  test(
    "domainAdminList contains the test domain admin",
    async () => {
      const admins = mailcowE2eResultAssert("domainAdminList", await domainAdminList({ config }))
      expect(admins.some((entry) => String(entry.username ?? entry.id) === testAdminUser)).toBe(true)
    },
    { timeout: 30_000 },
  )

  test(
    "domainAdminAclEdit grants quarantine acl to the test domain admin",
    async () => {
      testScopeGuard("domainAdminAclEdit", testAdminUser)
      const edited = mailcowE2eResultAssert(
        "domainAdminAclEdit",
        await domainAdminAclEdit({ config, items: [testAdminUser], attr: { da_acl: ["quarantine"] } }),
      )
      expect(edited.length).toBeGreaterThan(0)
    },
    { timeout: 30_000 },
  )

  test(
    "domainAdminEdit rotates the test domain admin password",
    async () => {
      testScopeGuard("domainAdminEdit", testAdminUser)
      const rotated = `E2e-${crypto.randomUUID().replaceAll("-", "")}w9!`
      const edited = mailcowE2eResultAssert(
        "domainAdminEdit",
        await domainAdminEdit({ config, items: [testAdminUser], attr: { password: rotated, password2: rotated } }),
      )
      expect(edited.length).toBeGreaterThan(0)
    },
    { timeout: 30_000 },
  )

  test(
    "domainAdminSsoAdd issues a token without ever printing it",
    async () => {
      testScopeGuard("domainAdminSsoAdd", testAdminUser)
      const token = mailcowE2eResultAssert(
        "domainAdminSsoAdd",
        await domainAdminSsoAdd({ config, attr: { username: testAdminUser } }),
      )
      expect(token.token).toBeString()
      expect(token.token.length).toBeGreaterThan(0)
    },
    { timeout: 30_000 },
  )
})

describe("live filter, app-password, and oauth2 lifecycle", () => {
  test(
    "filterAdd creates a prefilter for the test mailbox (only prefilter|postfilter are valid live)",
    async () => {
      testScopeGuard("filterAdd", testMailbox)
      const added = mailcowE2eResultAssert(
        "filterAdd",
        await filterAdd({
          config,
          attr: {
            username: testMailbox,
            filter_type: "prefilter",
            script_data: "require [];",
            script_desc: `e2e ${runId}`,
          },
        }),
      )
      expect(added.length).toBeGreaterThan(0)
    },
    { timeout: 30_000 },
  )

  test(
    "filterList shows the test mailbox filter",
    async () => {
      const filters = mailcowE2eResultAssert("filterList", await filterList({ config, mailbox: testMailbox }))
      expect(filters.length).toBeGreaterThan(0)
    },
    { timeout: 30_000 },
  )

  test(
    "filterEdit deactivates the test mailbox filter, then filterDelete removes it",
    async () => {
      const filters = mailcowE2eResultAssert("filterList for edit", await filterList({ config, mailbox: testMailbox }))
      const id = filters[0]?.id
      expect(id).toBeNumber()
      const edited = mailcowE2eResultAssert(
        "filterEdit",
        await filterEdit({ config, items: [id as number], attr: { active: "0" } }),
      )
      expect(edited.length).toBeGreaterThan(0)
      const deleted = mailcowE2eResultAssert("filterDelete", await filterDelete({ config, items: [id as number] }))
      expect(deleted.length).toBeGreaterThan(0)
      const after = mailcowE2eResultAssert(
        "filterList after delete",
        await filterList({ config, mailbox: testMailbox }),
      )
      expect(after.length).toBe(0)
    },
    { timeout: 30_000 },
  )

  test(
    "appPasswordAdd creates an app password for the test mailbox",
    async () => {
      testScopeGuard("appPasswordAdd", testMailbox)
      const added = mailcowE2eResultAssert(
        "appPasswordAdd",
        await appPasswordAdd({
          config,
          attr: {
            username: testMailbox,
            app_name: `e2e-${runId}`,
            app_passwd: testAppPassword,
            app_passwd2: testAppPassword,
            protocols: ["imap_access", "smtp_access"],
          },
        }),
      )
      expect(added.length).toBeGreaterThan(0)
    },
    { timeout: 30_000 },
  )

  test(
    "appPasswordList shows the test app password",
    async () => {
      const listed = mailcowE2eResultAssert("appPasswordList", await appPasswordList({ config, mailbox: testMailbox }))
      expect(listed.length).toBeGreaterThan(0)
    },
    { timeout: 30_000 },
  )

  test(
    "appPasswordGet returns HTTP 200 but an empty object (id mangled upstream — use list)",
    async () => {
      // Upstream passes array('id' => $object['id']) where $object is the URL string,
      // so details() receives garbage and returns nothing. File parity note in coverage/api-notes.
      const listed = mailcowE2eResultAssert(
        "appPasswordList for get",
        await appPasswordList({ config, mailbox: testMailbox }),
      )
      const id = listed[0]?.id
      expect(id).toBeNumber()
      const gotten = mailcowE2eResultAssert("appPasswordGet", await appPasswordGet({ config, id: id as number }))
      const keys = Object.keys((gotten ?? {}) as unknown as Record<string, unknown>)
      console.info(`Live E2E pin appPasswordGet: HTTP 200 with keys [${keys.join(",")}] (empty = broken as documented)`)
      expect(keys.length).toBe(0)
    },
    { timeout: 30_000 },
  )

  test(
    "appPasswordEdit renames the app password via username-scoped attr",
    async () => {
      // Upstream resolves the target mailbox from attr.username; without it API-key
      // callers edit as the pseudo-user "API" and the edit cannot apply. The client
      // requires username, so the rename must apply here.
      const listed = mailcowE2eResultAssert(
        "appPasswordList for edit",
        await appPasswordList({ config, mailbox: testMailbox }),
      )
      const id = listed[0]?.id
      expect(id).toBeNumber()
      const edited = mailcowE2eResultAssert(
        "appPasswordEdit",
        await appPasswordEdit({
          config,
          items: [id as number],
          attr: { username: testMailbox, app_name: `e2e-${runId}-renamed` },
        }),
      )
      expect(edited.length).toBeGreaterThan(0)
      const relisted = mailcowE2eResultAssert(
        "appPasswordList after edit",
        await appPasswordList({ config, mailbox: testMailbox }),
      )
      const renamed = relisted.find((entry) => entry.id === (id as number))
      console.info(
        `Live E2E appPasswordEdit applied=${renamed?.name === `e2e-${runId}-renamed`} still_listed=${renamed !== undefined}`,
      )
      expect(renamed?.name).toBe(`e2e-${runId}-renamed`)
      const deleted = mailcowE2eResultAssert(
        "appPasswordDelete",
        await appPasswordDelete({ config, items: [id as number] }),
      )
      expect(deleted.length).toBeGreaterThan(0)
    },
    { timeout: 30_000 },
  )

  test(
    "oauth2ClientAdd creates a run-scoped oauth2 client",
    async () => {
      const added = mailcowE2eResultAssert(
        "oauth2ClientAdd",
        await oauth2ClientAdd({ config, attr: { redirect_uri: `https://localhost/${runId}/cb` } }),
      )
      expect(added.length).toBeGreaterThan(0)
    },
    { timeout: 30_000 },
  )

  test(
    "oauth2ClientList, oauth2ClientGet, oauth2ClientEdit, oauth2ClientDelete round-trip",
    async () => {
      const listed = mailcowE2eResultAssert("oauth2ClientList", await oauth2ClientList({ config }))
      const client = listed.find((entry) => entry.redirect_uri === `https://localhost/${runId}/cb`)
      expect(client?.id).toBeNumber()
      const id = client?.id as number
      const gotten = mailcowE2eResultAssert("oauth2ClientGet", await oauth2ClientGet({ config, id }))
      expect(gotten.id).toBe(id)
      const edited = mailcowE2eResultAssert(
        "oauth2ClientEdit",
        await oauth2ClientEdit({
          config,
          items: [id],
          attr: { redirect_uri: `https://localhost/${runId}/cb2`, revoke_tokens: "1" },
        }),
      )
      expect(edited.length).toBeGreaterThan(0)
      const deleted = mailcowE2eResultAssert("oauth2ClientDelete", await oauth2ClientDelete({ config, items: [id] }))
      expect(deleted.length).toBeGreaterThan(0)
    },
    { timeout: 30_000 },
  )
})

describe("live spam-policy, tls, and mta-sts lifecycle", () => {
  test(
    "domainPolicyAdd, wl/bl reads, and domainPolicyDelete round-trip",
    async () => {
      testScopeGuard("domainPolicyAdd", testDomain)
      const added = mailcowE2eResultAssert(
        "domainPolicyAdd",
        await domainPolicyAdd({
          config,
          attr: { domain: testDomain, object_from: `e2e-${runId}@example.invalid`, object_list: "wl" },
        }),
      )
      expect(added.length).toBeGreaterThan(0)
      const wl = mailcowE2eResultAssert("domainPolicyWlList", await domainPolicyWlList({ config, domain: testDomain }))
      const wlEntry = wl.find((entry) => entry.value.includes(runId))
      expect(wlEntry?.object).toBe(testDomain)
      const bl = mailcowE2eResultAssert("domainPolicyBlList", await domainPolicyBlList({ config, domain: testDomain }))
      expect(Array.isArray(bl)).toBe(true)
      const deleted = mailcowE2eResultAssert(
        "domainPolicyDelete",
        await domainPolicyDelete({ config, items: [wlEntry?.prefid as string | number] }),
      )
      expect(deleted.length).toBeGreaterThan(0)
    },
    { timeout: 30_000 },
  )

  test(
    "mailboxPolicyAdd, wl/bl reads, and mailboxPolicyDelete round-trip",
    async () => {
      testScopeGuard("mailboxPolicyAdd", testMailbox)
      const added = mailcowE2eResultAssert(
        "mailboxPolicyAdd",
        await mailboxPolicyAdd({
          config,
          attr: { username: testMailbox, object_from: `e2e-${runId}@example.invalid`, object_list: "bl" },
        }),
      )
      expect(added.length).toBeGreaterThan(0)
      const bl = mailcowE2eResultAssert(
        "mailboxPolicyBlList",
        await mailboxPolicyBlList({ config, mailbox: testMailbox }),
      )
      const blEntry = bl.find((entry) => entry.value.includes(runId))
      expect(blEntry?.object).toBe(testMailbox)
      const wl = mailcowE2eResultAssert(
        "mailboxPolicyWlList",
        await mailboxPolicyWlList({ config, mailbox: testMailbox }),
      )
      expect(Array.isArray(wl)).toBe(true)
      const deleted = mailcowE2eResultAssert(
        "mailboxPolicyDelete",
        await mailboxPolicyDelete({ config, items: [blEntry?.prefid as string | number] }),
      )
      expect(deleted.length).toBeGreaterThan(0)
    },
    { timeout: 30_000 },
  )

  test(
    "tlsPolicyMapAdd, list, edit round-trip with broken-get pin",
    async () => {
      const added = mailcowE2eResultAssert(
        "tlsPolicyMapAdd",
        await tlsPolicyMapAdd({ config, attr: { dest: testTlsDest, policy: "none" } }),
      )
      expect(added.length).toBeGreaterThan(0)
      const listed = mailcowE2eResultAssert("tlsPolicyMapList", await tlsPolicyMapList({ config }))
      const entry = listed.find((item) => item.dest === testTlsDest)
      expect(entry?.id).not.toBeUndefined()
      const id = entry?.id as string | number
      // Live: the by-id GET answers success despite the documented undefined-$details quirk — pin actual.
      const gotten = mailcowE2eResultAssert("tlsPolicyMapGet", await tlsPolicyMapGet({ config, id }))
      expect((gotten as unknown as Record<string, unknown>).dest).toBe(testTlsDest)
      const edited = mailcowE2eResultAssert(
        "tlsPolicyMapEdit",
        await tlsPolicyMapEdit({ config, items: [id], attr: { policy: "may" } }),
      )
      expect(edited.length).toBeGreaterThan(0)
      const deleted = mailcowE2eResultAssert("tlsPolicyMapDelete", await tlsPolicyMapDelete({ config, items: [id] }))
      expect(deleted.length).toBeGreaterThan(0)
    },
    { timeout: 30_000 },
  )

  test(
    "mtaStsAdd answers generic-failure but inserts the row; mtaStsEdit then succeeds",
    async () => {
      // Upstream mta_sts add never pushes a success envelope, so the API always answers
      // {"type":"error","msg":"Cannot add item"} even though the row IS inserted.
      testScopeGuard("mtaStsAdd", testDomain)
      const added = await mtaStsAdd({
        config,
        attr: {
          domain: testDomain,
          version: "stsv1",
          mode: "testing",
          max_age: 86400,
          mx: "email.contentoren.de",
          active: "1",
        },
      })
      console.info(`Live E2E pin mtaStsAdd: success=${added.success} err=${added.success ? "" : added.errorMessage}`)
      expect(added.success).toBe(false)
      if (added.success) return
      const edited = mailcowE2eResultAssert(
        "mtaStsEdit",
        await mtaStsEdit({
          config,
          items: [testDomain],
          attr: { version: "stsv1", mode: "testing", max_age: 43200, mx: "email.contentoren.de", active: "1" },
        }),
      )
      expect(edited.length).toBeGreaterThan(0)
    },
    { timeout: 30_000 },
  )
})

describe("live routing lifecycle", () => {
  test(
    "relayhostAdd, get, edit, delete round-trip without credentials",
    async () => {
      const added = mailcowE2eResultAssert(
        "relayhostAdd",
        await relayhostAdd({ config, attr: { hostname: testRelayhost } }),
      )
      expect(added.length).toBeGreaterThan(0)
      const listed = mailcowE2eResultAssert("relayhostList", await relayhostList({ config }))
      const entry = listed.find((item) => item.hostname === testRelayhost)
      expect(entry?.id).not.toBeUndefined()
      const id = entry?.id as string | number
      const gotten = mailcowE2eResultAssert("relayhostGet", await relayhostGet({ config, id }))
      expect(String(gotten.hostname ?? "")).toBe(testRelayhost)
      const edited = mailcowE2eResultAssert(
        "relayhostEdit",
        await relayhostEdit({ config, items: [id], attr: { active: "0" } }),
      )
      expect(edited.length).toBeGreaterThan(0)
      const deleted = mailcowE2eResultAssert("relayhostDelete", await relayhostDelete({ config, items: [id] }))
      expect(deleted.length).toBeGreaterThan(0)
    },
    { timeout: 30_000 },
  )

  test(
    "transportAdd, get, edit, delete round-trip",
    async () => {
      const added = mailcowE2eResultAssert(
        "transportAdd",
        await transportAdd({
          config,
          attr: { destination: testTransportDest, nexthop: "smtp:127.0.0.1:2525", active: "1" },
        }),
      )
      expect(added.length).toBeGreaterThan(0)
      const listed = mailcowE2eResultAssert("transportList", await transportList({ config }))
      const entry = listed.find((item) => item.destination === testTransportDest)
      expect(entry?.id).not.toBeUndefined()
      const id = entry?.id as string | number
      const gotten = mailcowE2eResultAssert("transportGet", await transportGet({ config, id }))
      expect(String(gotten.destination ?? "")).toBe(testTransportDest)
      const edited = mailcowE2eResultAssert(
        "transportEdit",
        await transportEdit({ config, items: [id], attr: { active: "0" } }),
      )
      expect(edited.length).toBeGreaterThan(0)
      const deleted = mailcowE2eResultAssert("transportDelete", await transportDelete({ config, items: [id] }))
      expect(deleted.length).toBeGreaterThan(0)
    },
    { timeout: 30_000 },
  )

  test(
    "recipientMapAdd, broken-get pin, edit, delete round-trip",
    async () => {
      const oldAddress = `old-${runId}@${testDomain}`
      const added = mailcowE2eResultAssert(
        "recipientMapAdd",
        await recipientMapAdd({ config, attr: { recipient_map_old: oldAddress, recipient_map_new: testMailbox } }),
      )
      expect(added.length).toBeGreaterThan(0)
      const listed = mailcowE2eResultAssert("recipientMapList", await recipientMapList({ config }))
      const entry = listed.find((item) => item.recipient_map_old === oldAddress)
      expect(entry?.id).not.toBeUndefined()
      const id = entry?.id as string | number
      // Live: the by-id GET answers success despite the documented undefined-$details quirk — pin actual.
      const gotten = mailcowE2eResultAssert("recipientMapGet", await recipientMapGet({ config, id }))
      expect((gotten as unknown as Record<string, unknown>).recipient_map_old).toBe(oldAddress)
      const edited = mailcowE2eResultAssert(
        "recipientMapEdit",
        await recipientMapEdit({ config, items: [id], attr: { active: "0" } }),
      )
      expect(edited.length).toBeGreaterThan(0)
      const deleted = mailcowE2eResultAssert("recipientMapDelete", await recipientMapDelete({ config, items: [id] }))
      expect(deleted.length).toBeGreaterThan(0)
    },
    { timeout: 30_000 },
  )

  test(
    "bccAdd, broken-get pin, edit, delete round-trip",
    async () => {
      const added = mailcowE2eResultAssert(
        "bccAdd",
        await bccAdd({ config, attr: { type: "rcpt", local_dest: testMailbox, bcc_dest: testMailbox } }),
      )
      expect(added.length).toBeGreaterThan(0)
      const listed = mailcowE2eResultAssert("bccList", await bccList({ config }))
      const entry = listed.find((item) => item.local_dest === testMailbox && item.bcc_dest === testMailbox)
      expect(entry?.id).not.toBeUndefined()
      const id = entry?.id as string | number
      // Live: the by-id GET answers success despite the documented undefined-$details quirk — pin actual.
      const gotten = mailcowE2eResultAssert("bccGet", await bccGet({ config, id }))
      expect((gotten as unknown as Record<string, unknown>).local_dest).toBe(testMailbox)
      const edited = mailcowE2eResultAssert("bccEdit", await bccEdit({ config, items: [id], attr: { active: "0" } }))
      expect(edited.length).toBeGreaterThan(0)
      const deleted = mailcowE2eResultAssert("bccDelete", await bccDelete({ config, items: [id] }))
      expect(deleted.length).toBeGreaterThan(0)
    },
    { timeout: 30_000 },
  )

  test(
    "fwdhostAdd, get, edit, delete round-trip with TEST-NET-1 IP (names must resolve live)",
    async () => {
      // Upstream resolves the hostname (get_outgoing_hosts_best_guess); run-scoped
      // .invalid names are rejected with invalid_host, so exercise with 192.0.2.1 and delete after.
      const fwdHostIp = "192.0.2.1"
      const added = mailcowE2eResultAssert("fwdhostAdd", await fwdhostAdd({ config, attr: { hostname: fwdHostIp } }))
      expect(added.length).toBeGreaterThan(0)
      const listed = mailcowE2eResultAssert("fwdhostList", await fwdhostList({ config }))
      // Live list entries use `host`, not `hostname` (typed on FwdhostDetails).
      expect(listed.some((item) => item.host === fwdHostIp)).toBe(true)
      const gotten = mailcowE2eResultAssert("fwdhostGet", await fwdhostGet({ config, hostname: fwdHostIp }))
      expect(gotten.host).toBe(fwdHostIp)
      const edited = mailcowE2eResultAssert(
        "fwdhostEdit",
        await fwdhostEdit({ config, items: [fwdHostIp], attr: { keep_spam: "0" } }),
      )
      expect(edited.length).toBeGreaterThan(0)
      const deleted = mailcowE2eResultAssert("fwdhostDelete", await fwdhostDelete({ config, items: [fwdHostIp] }))
      expect(deleted.length).toBeGreaterThan(0)
      const relisted = mailcowE2eResultAssert("fwdhostList after delete", await fwdhostList({ config }))
      expect(relisted.some((item) => item.host === fwdHostIp)).toBe(false)
    },
    { timeout: 30_000 },
  )
})

describe("live dkim and ratelimit lifecycle", () => {
  test(
    "dkimDelete removes the auto key, dkimAdd creates a custom key, dkimGet reads it",
    async () => {
      testScopeGuard("dkimDelete auto", testDomain)
      // domainAdd auto-provisions a "dkim"-selector key, so an explicit add hits the
      // key-exists branch (dkim_domain_or_sel_invalid). Delete first, then add custom.
      const cleared = mailcowE2eResultAssert("dkimDelete auto key", await dkimDelete({ config, items: [testDomain] }))
      expect(cleared.length).toBeGreaterThan(0)
      const selector = `e2e${runId.replaceAll("-", "")}`.slice(0, 20)
      const added = mailcowE2eResultAssert(
        "dkimAdd",
        await dkimAdd({ config, attr: { domains: testDomain, dkim_selector: selector, key_size: 2048 } }),
      )
      expect(added.length).toBeGreaterThan(0)
      const details = mailcowE2eResultAssert("dkimGet", await dkimGet({ config, domain: testDomain }))
      expect(details.dkim_txt).toBeString()
      expect(String(details.dkim_txt).length).toBeGreaterThan(0)
      expect(details.dkim_selector).toBe(selector)
    },
    { timeout: 60_000 },
  )

  test(
    "dkimDuplicateAdd copies the test key to the alias domain",
    async () => {
      testScopeGuard("dkimDuplicateAdd", testAliasDomain)
      const added = mailcowE2eResultAssert(
        "dkimDuplicateAdd",
        await dkimDuplicateAdd({ config, attr: { from_domain: testDomain, to_domain: testAliasDomain } }),
      )
      expect(added.length).toBeGreaterThan(0)
      const details = mailcowE2eResultAssert("dkimGet alias domain", await dkimGet({ config, domain: testAliasDomain }))
      expect(details.dkim_txt).toBeString()
    },
    { timeout: 30_000 },
  )

  test(
    "dkimDelete removes both test keys",
    async () => {
      testScopeGuard("dkimDelete", testDomain)
      const deleted = mailcowE2eResultAssert(
        "dkimDelete",
        await dkimDelete({ config, items: [testDomain, testAliasDomain] }),
      )
      expect(deleted.length).toBeGreaterThan(0)
    },
    { timeout: 30_000 },
  )

  test(
    "ratelimitDomainEdit, get, and lists round-trip on the test domain",
    async () => {
      testScopeGuard("ratelimitDomainEdit", testDomain)
      const edited = mailcowE2eResultAssert(
        "ratelimitDomainEdit",
        await ratelimitDomainEdit({ config, items: [testDomain], attr: { rl_value: "1000", rl_frame: "h" } }),
      )
      expect(edited.length).toBeGreaterThan(0)
      const gotten = mailcowE2eResultAssert(
        "ratelimitDomainGet",
        await ratelimitDomainGet({ config, domain: testDomain }),
      )
      expect(gotten).not.toBeNull()
      const listed = mailcowE2eResultAssert("ratelimitDomainList", await ratelimitDomainList({ config }))
      expect(Array.isArray(listed)).toBe(true)
    },
    { timeout: 30_000 },
  )

  test(
    "ratelimitMailboxEdit, get, and lists round-trip on the test mailbox",
    async () => {
      testScopeGuard("ratelimitMailboxEdit", testMailbox)
      const edited = mailcowE2eResultAssert(
        "ratelimitMailboxEdit",
        await ratelimitMailboxEdit({ config, items: [testMailbox], attr: { rl_value: "500", rl_frame: "h" } }),
      )
      expect(edited.length).toBeGreaterThan(0)
      const gotten = mailcowE2eResultAssert(
        "ratelimitMailboxGet",
        await ratelimitMailboxGet({ config, mailbox: testMailbox }),
      )
      expect(gotten).not.toBeNull()
      const listed = mailcowE2eResultAssert("ratelimitMailboxList", await ratelimitMailboxList({ config }))
      expect(Array.isArray(listed)).toBe(true)
    },
    { timeout: 30_000 },
  )

  test(
    "ratelimitHashDelete records live behavior for the test mailbox hash",
    async () => {
      testScopeGuard("ratelimitHashDelete", testMailbox)
      const deleted = await ratelimitHashDelete({ config, items: [testMailbox] })
      console.info(`Live E2E ratelimitHashDelete: success=${deleted.success} (raw echo upstream, never an envelope)`)
      expect(deleted.success).toBe(true)
    },
    { timeout: 30_000 },
  )
})

describe("live syncjob lifecycle", () => {
  test(
    "syncJobAdd points the test mailbox at an unreachable TEST-NET-1 host, disabled",
    async () => {
      testScopeGuard("syncJobAdd", testMailbox)
      const syncPassword = `E2e-${crypto.randomUUID().replaceAll("-", "")}s9!`
      const added = mailcowE2eResultAssert(
        "syncJobAdd",
        await syncJobAdd({
          config,
          attr: {
            username: testMailbox,
            host1: "192.0.2.1",
            port1: 993,
            user1: `e2e-${runId}`,
            password1: syncPassword,
            enc1: "TLS",
            mins_interval: 60,
            active: "0",
            delete1: "0",
            delete2: "0",
            exclude: "",
            subfolder2: "",
            custom_params: "",
          },
        }),
      )
      expect(added.length).toBeGreaterThan(0)
    },
    { timeout: 60_000 },
  )

  test(
    "syncJobGet and syncJobList show the test sync job",
    async () => {
      const gotten = mailcowE2eResultAssert("syncJobGet", await syncJobGet({ config, mailbox: testMailbox }))
      expect(gotten).not.toBeNull()
      const listed = mailcowE2eResultAssert("syncJobList", await syncJobList({ config }))
      expect(Array.isArray(listed)).toBe(true)
    },
    { timeout: 30_000 },
  )

  test(
    "syncJobEdit renames the interval, then syncJobDelete removes the job",
    async () => {
      const listed = mailcowE2eResultAssert("syncJobList for edit", await syncJobList({ config }))
      const job = listed.find((entry) => entry.user2 === testMailbox)
      expect(job?.id).toBeNumber()
      const id = job?.id as number
      const edited = mailcowE2eResultAssert(
        "syncJobEdit",
        await syncJobEdit({ config, items: [id], attr: { mins_interval: 120 } }),
      )
      expect(edited.length).toBeGreaterThan(0)
      const deleted = mailcowE2eResultAssert("syncJobDelete", await syncJobDelete({ config, items: [id] }))
      expect(deleted.length).toBeGreaterThan(0)
    },
    { timeout: 30_000 },
  )
})

describe("live queue, quarantine, and admin reads", () => {
  test(
    "mailqList reads the live queue as an array",
    async () => {
      const queue = mailcowE2eResultAssert("mailqList", await mailqList({ config }))
      expect(Array.isArray(queue)).toBe(true)
      console.info(`Live E2E mailqList: ${queue.length} queued items; postcat not exercised live (no run-created item)`)
    },
    { timeout: 30_000 },
  )

  test(
    "quarantineList reads the live quarantine as an array (no learn/release of real items)",
    async () => {
      const items = mailcowE2eResultAssert("quarantineList", await quarantineList({ config }))
      expect(Array.isArray(items)).toBe(true)
      console.info(`Live E2E quarantineList: ${items.length} items; qitem edit/delete not exercised live`)
    },
    { timeout: 30_000 },
  )

  test(
    "adminList reads admins without creating superadmins on prod",
    async () => {
      const admins = mailcowE2eResultAssert("adminList", await adminList({ config }))
      expect(admins.length).toBeGreaterThan(0)
    },
    { timeout: 30_000 },
  )

  test(
    "rsettingList reads global rspamd settings, rsettingGet reads one entry",
    async () => {
      const settings = mailcowE2eResultAssert("rsettingList", await rsettingList({ config }))
      expect(Array.isArray(settings)).toBe(true)
      console.info(
        `Live E2E rsettingList: ${settings.length} entries; rsetting mutations are global and not exercised live`,
      )
      if (settings.length > 0) {
        const first = settings[0]
        expect(first?.id).not.toBeUndefined()
        const gotten = mailcowE2eResultAssert(
          "rsettingGet",
          await rsettingGet({ config, id: first?.id as string | number }),
        )
        expect(gotten).not.toBeNull()
      }
    },
    { timeout: 30_000 },
  )
})

function mailcowE2eLineReader(socket: { on: (event: string, listener: (chunk: Buffer) => void) => void }) {
  let buffer = ""
  const waiting: Array<(line: string) => void> = []
  const lines: string[] = []
  socket.on("data", (chunk: Buffer) => {
    buffer += chunk.toString("utf8")
    let index = buffer.indexOf("\r\n")
    while (index >= 0) {
      const line = buffer.slice(0, index)
      buffer = buffer.slice(index + 2)
      const waiter = waiting.shift()
      if (waiter) waiter(line)
      else lines.push(line)
      index = buffer.indexOf("\r\n")
    }
  })
  return async (): Promise<string> => {
    const queued = lines.shift()
    if (queued !== undefined) return queued
    return new Promise<string>((resolve) => {
      waiting.push(resolve)
    })
  }
}

async function mailcowE2eSmtpSelfSend(username: string, password: string): Promise<void> {
  const { default: net } = await import("node:net")
  const { default: tls } = await import("node:tls")
  const host = "email.contentoren.de"
  const raw = net.connect(587, host)
  await new Promise<void>((resolve, reject) => {
    raw.once("connect", () => resolve())
    raw.once("error", (error: Error) => reject(error))
  })
  const readLine = mailcowE2eLineReader(raw)
  const write = (text: string) =>
    new Promise<void>((resolve, reject) => {
      raw.write(`${text}\r\n`, (error?: Error) => {
        if (error) reject(error)
        else resolve()
      })
    })
  const greeting = await readLine()
  if (!greeting.startsWith("220")) throw new Error(`SMTP greeting unexpected: ${greeting.slice(0, 60)}`)
  await write("EHLO e2e.contentoren.com")
  let line = await readLine()
  let advertisesStarttls = line.includes("STARTTLS")
  while (line.startsWith("250-")) {
    advertisesStarttls = advertisesStarttls || line.includes("STARTTLS")
    line = await readLine()
  }
  if (!advertisesStarttls) throw new Error("SMTP submission does not advertise STARTTLS")
  await write("STARTTLS")
  const starttlsReply = await readLine()
  if (!starttlsReply.startsWith("220")) throw new Error(`STARTTLS rejected: ${starttlsReply.slice(0, 60)}`)
  const secure = tls.connect({ socket: raw, host, servername: host })
  await new Promise<void>((resolve, reject) => {
    secure.once("secureConnect", () => resolve())
    secure.once("error", (error: Error) => reject(error))
  })
  const readSecure = mailcowE2eLineReader(secure)
  const writeSecure = (text: string) =>
    new Promise<void>((resolve, reject) => {
      secure.write(`${text}\r\n`, (error?: Error) => {
        if (error) reject(error)
        else resolve()
      })
    })
  await writeSecure("EHLO e2e.contentoren.com")
  line = await readSecure()
  while (line.startsWith("250-")) line = await readSecure()
  if (!line.startsWith("250")) throw new Error(`EHLO after TLS unexpected: ${line.slice(0, 60)}`)
  const credentials = Buffer.from(`\0${username}\0${password}`, "utf8").toString("base64")
  await writeSecure(`AUTH PLAIN ${credentials}`)
  const authReply = await readSecure()
  if (!authReply.startsWith("235")) throw new Error(`SMTP auth failed: ${authReply.slice(0, 60)}`)
  await writeSecure(`MAIL FROM:<${username}>`)
  const mailReply = await readSecure()
  if (!mailReply.startsWith("250")) throw new Error(`MAIL FROM rejected: ${mailReply.slice(0, 60)}`)
  await writeSecure(`RCPT TO:<${username}>`)
  const rcptReply = await readSecure()
  if (!rcptReply.startsWith("250")) throw new Error(`RCPT TO rejected: ${rcptReply.slice(0, 60)}`)
  await writeSecure("DATA")
  const dataReply = await readSecure()
  if (!dataReply.startsWith("354")) throw new Error(`DATA rejected: ${dataReply.slice(0, 60)}`)
  const subject = `mailcow-client e2e ${runId}`
  await writeSecure(
    `From: ${username}\r\nTo: ${username}\r\nSubject: ${subject}\r\n\r\nself-to-self e2e body ${runId}\r\n.`,
  )
  const queuedReply = await readSecure()
  if (!queuedReply.startsWith("250")) throw new Error(`message not queued: ${queuedReply.slice(0, 60)}`)
  await writeSecure("QUIT")
  secure.end()
}

async function mailcowE2eImapWaitForSubject(username: string, password: string, subject: string): Promise<void> {
  const { default: tls } = await import("node:tls")
  if (password.includes('"') || password.includes("\\")) throw new Error("IMAP password needs quoting-safe characters")
  const host = "email.contentoren.de"
  const socket = tls.connect(993, host, { servername: host })
  await new Promise<void>((resolve, reject) => {
    socket.once("secureConnect", () => resolve())
    socket.once("error", (error: Error) => reject(error))
  })
  const readLine = mailcowE2eLineReader(socket)
  const write = (text: string) =>
    new Promise<void>((resolve, reject) => {
      socket.write(`${text}\r\n`, (error?: Error) => {
        if (error) reject(error)
        else resolve()
      })
    })
  const readTagged = async (tag: string): Promise<string[]> => {
    const response: string[] = []
    for (;;) {
      const line = await readLine()
      response.push(line)
      if (line.startsWith(`${tag} `)) return response
    }
  }
  const greeting = await readLine()
  if (!greeting.startsWith("* OK")) throw new Error(`IMAP greeting unexpected: ${greeting.slice(0, 60)}`)
  await write(`a001 LOGIN ${username} "${password}"`)
  const login = await readTagged("a001")
  if (!login[login.length - 1]?.startsWith("a001 OK")) throw new Error("IMAP login failed")
  await write("a002 SELECT INBOX")
  const selected = await readTagged("a002")
  if (!selected[selected.length - 1]?.startsWith("a002 OK")) throw new Error("IMAP SELECT failed")
  const deadline = Date.now() + 60_000
  let found = false
  while (Date.now() < deadline && !found) {
    await write("a003 UID SEARCH SUBJECT " + JSON.stringify(subject))
    const searched = await readTagged("a003")
    const searchLine = searched.find((entry) => entry.startsWith("* SEARCH"))
    const uids = (searchLine ?? "")
      .split(" ")
      .slice(2)
      .filter((part) => part.length > 0)
    if (uids.length > 0) {
      found = true
      break
    }
    await Bun.sleep(5_000)
  }
  await write("a004 LOGOUT")
  await readTagged("a004")
  socket.end()
  if (!found) throw new Error(`IMAP self-sent message with subject ${subject} not found within 60s`)
}

describe("protocol-level self-send smoke (not REST client surface)", () => {
  test(
    "SMTP submission sends self-to-self and IMAP fetches it",
    async () => {
      const subject = `mailcow-client e2e ${runId}`
      await mailcowE2eSmtpSelfSend(testMailbox, testPassword)
      await mailcowE2eImapWaitForSubject(testMailbox, testPassword, subject)
      console.info("Live E2E protocol smoke: self-to-self submission + IMAP fetch succeeded")
    },
    { timeout: 180_000 },
  )
})

describe("post-flight teardown verification", () => {
  test(
    "teardown removes every run-scoped object and restores snapshots",
    async () => {
      await cleanup.run()
      const domains = mailcowE2eResultAssert("domainList post-flight", await domainList({ config }))
      const mailboxes = mailcowE2eResultAssert("mailboxList post-flight", await mailboxList({ config }))
      const aliases = mailcowE2eResultAssert("aliasList post-flight", await aliasList({ config }))
      const domainGone = !domains.some((entry) => entry.domain_name === testDomain)
      const mailboxGone = !mailboxes.some((entry) => entry.username === testMailbox)
      console.info(
        `Live E2E run ${runId}: post-flight domains=${domains.length} (was ${snapshotDomains}) ` +
          `mailboxes=${mailboxes.length} (was ${snapshotMailboxes}) aliases=${aliases.length} (was ${snapshotAliases}) ` +
          `test domain gone=${domainGone} test mailbox gone=${mailboxGone}`,
      )
      expect(domainGone).toBe(true)
      expect(mailboxGone).toBe(true)
      expect(domains.length).toBe(snapshotDomains)
      expect(mailboxes.length).toBe(snapshotMailboxes)
      expect(aliases.length).toBe(snapshotAliases)
    },
    { timeout: 180_000 },
  )
})
