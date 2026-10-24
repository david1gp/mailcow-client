import { afterAll, beforeAll, describe, expect, test } from "bun:test"
import { bccDestinationOptionsGet } from "../dist/index.js"
import { fail2banGet } from "../dist/index.js"
import { globalFilterGet } from "../dist/index.js"
import { identityProviderGet } from "../dist/index.js"
import { logList } from "../dist/index.js"
import { passwordPolicyGet } from "../dist/index.js"
import { passwordPolicyHtmlGet } from "../dist/index.js"
import { rspamdActionsGet } from "../dist/index.js"
import { rspamdPresetList } from "../dist/index.js"
import { rspamdStatsGet } from "../dist/index.js"
import { sievePresetList } from "../dist/index.js"
import { statusContainerGet } from "../dist/index.js"
import { statusContainersList } from "../dist/index.js"
import { statusHostGet } from "../dist/index.js"
import { statusHostIpGet } from "../dist/index.js"
import { statusVersionGet } from "../dist/index.js"
import { statusVmailGet } from "../dist/index.js"
import type { MailcowClientConfig } from "../dist/client/mailcowClientConfigSchema.js"
import { mailcowE2eResultAssert } from "./mailcowE2eResultAssert.js"
import { mailcowE2eSetup } from "./mailcowE2eSetup.js"

let config: MailcowClientConfig

beforeAll(() => {
  config = mailcowE2eSetup()
})

afterAll(() => {
  console.info("Live E2E observability: GET-only file, no teardown needed")
})

describe("live observability reads (GET-only, no mutations)", () => {
  test(
    "fail2banGet reads whitelist and ban state",
    async () => {
      const fail2ban = mailcowE2eResultAssert("fail2banGet", await fail2banGet({ config }))
      expect(fail2ban).not.toBeNull()
    },
    { timeout: 30_000 },
  )

  test(
    "logList reads postfix and api logs with small counts without printing contents",
    async () => {
      const postfix = mailcowE2eResultAssert("logList postfix", await logList({ config, service: "postfix", count: 5 }))
      expect(Array.isArray(postfix)).toBe(true)
      const api = mailcowE2eResultAssert("logList api", await logList({ config, service: "api", count: 5 }))
      expect(Array.isArray(api)).toBe(true)
      console.info(`Live E2E logList: postfix=${postfix.length} api=${api.length} lines (contents not printed)`)
    },
    { timeout: 30_000 },
  )

  test(
    "rspamdStatsGet reads rspamd stats",
    async () => {
      const stats = mailcowE2eResultAssert("rspamdStatsGet", await rspamdStatsGet({ config }))
      expect(stats).not.toBeNull()
    },
    { timeout: 30_000 },
  )

  test(
    "rspamdActionsGet reads rspamd actions",
    async () => {
      const actions = mailcowE2eResultAssert("rspamdActionsGet", await rspamdActionsGet({ config }))
      expect(actions).not.toBeNull()
    },
    { timeout: 30_000 },
  )

  test(
    "statusVersionGet reads the live version",
    async () => {
      const version = mailcowE2eResultAssert("statusVersionGet", await statusVersionGet({ config }))
      expect(version.version).toBeString()
    },
    { timeout: 30_000 },
  )

  test(
    "statusContainersList returns null live via API key (pinned, matches read-only probe)",
    async () => {
      const containers = mailcowE2eResultAssert("statusContainersList", await statusContainersList({ config }))
      console.info("Live E2E pin statusContainersList: HTTP 200 with null body, not exercised further live")
      expect(containers).toBeNull()
    },
    { timeout: 30_000 },
  )

  test(
    "statusContainerGet is not exercised live (containers list is null via API key)",
    async () => {
      expect(typeof statusContainerGet).toBe("function")
    },
    { timeout: 30_000 },
  )

  test(
    "statusVmailGet, statusHostGet, and statusHostIpGet read live stats",
    async () => {
      const vmail = mailcowE2eResultAssert("statusVmailGet", await statusVmailGet({ config }))
      expect(vmail).not.toBeNull()
      const host = mailcowE2eResultAssert("statusHostGet", await statusHostGet({ config }))
      expect(host).not.toBeNull()
      const hostIp = mailcowE2eResultAssert("statusHostIpGet", await statusHostIpGet({ config }))
      expect(hostIp).not.toBeNull()
    },
    { timeout: 30_000 },
  )

  test(
    "identityProviderGet reads the identity provider config",
    async () => {
      const settings = mailcowE2eResultAssert("identityProviderGet", await identityProviderGet({ config }))
      expect(settings).not.toBeNull()
    },
    { timeout: 30_000 },
  )

  test(
    "passwordPolicyGet and passwordPolicyHtmlGet read policy without editing it",
    async () => {
      const policy = mailcowE2eResultAssert("passwordPolicyGet", await passwordPolicyGet({ config }))
      expect(policy).not.toBeNull()
      const html = mailcowE2eResultAssert("passwordPolicyHtmlGet", await passwordPolicyHtmlGet({ config }))
      expect(html).not.toBeNull()
    },
    { timeout: 30_000 },
  )

  test(
    "globalFilterGet, sievePresetList, and rspamdPresetList read filter presets",
    async () => {
      const global = mailcowE2eResultAssert("globalFilterGet", await globalFilterGet({ config }))
      expect(global).not.toBeNull()
      const sieve = mailcowE2eResultAssert("sievePresetList", await sievePresetList({ config }))
      expect(Array.isArray(sieve)).toBe(true)
      const rspamd = mailcowE2eResultAssert("rspamdPresetList", await rspamdPresetList({ config }))
      expect(Array.isArray(rspamd)).toBe(true)
    },
    { timeout: 30_000 },
  )

  test(
    "bccDestinationOptionsGet reads bcc destination options",
    async () => {
      const options = mailcowE2eResultAssert("bccDestinationOptionsGet", await bccDestinationOptionsGet({ config }))
      expect(options).not.toBeNull()
    },
    { timeout: 30_000 },
  )
})
