import { afterAll, beforeAll, describe, expect, test } from "bun:test"
import { domainAdminSelfEdit } from "../dist/index.js"
import { fido2FnEdit } from "../dist/index.js"
import { fido2GetArgsGet } from "../dist/index.js"
import { fido2RegistrationAdd } from "../dist/index.js"
import { fido2RegistrationArgsGet } from "../dist/index.js"
import { userSelfEdit } from "../dist/index.js"
import { webauthnTfaGetArgsGet } from "../dist/index.js"
import { webauthnTfaRegistrationAdd } from "../dist/index.js"
import { webauthnTfaRegistrationArgsGet } from "../dist/index.js"
import type { MailcowClientConfig } from "../dist/client/mailcowClientConfigSchema.js"
import { mailcowE2eSetup } from "./mailcowE2eSetup.js"

let config: MailcowClientConfig

beforeAll(() => {
  config = mailcowE2eSetup()
})

afterAll(() => {
  console.info("Live E2E session pins: session-only file, no teardown needed")
})

describe("live session-only pins (API key auth, actual server behavior)", () => {
  test(
    "fido2RegistrationArgsGet is issued to API-key callers (not 401 live)",
    async () => {
      const args = await fido2RegistrationArgsGet({ config })
      console.info(`Live E2E pin fido2RegistrationArgsGet: success=${args.success}`)
      expect(args.success).toBe(true)
      if (args.success) {
        expect(Object.keys(args.data as unknown as Record<string, unknown>)).toContain("publicKey")
      }
    },
    { timeout: 30_000 },
  )

  test(
    "fido2GetArgsGet is issued to API-key callers (not 401 live)",
    async () => {
      const args = await fido2GetArgsGet({ config })
      console.info(`Live E2E pin fido2GetArgsGet: success=${args.success}`)
      expect(args.success).toBe(true)
      if (args.success) {
        expect(Object.keys(args.data as unknown as Record<string, unknown>)).toContain("publicKey")
      }
    },
    { timeout: 30_000 },
  )

  test(
    "webauthnTfaRegistrationArgsGet is issued to API-key callers (not 401 live)",
    async () => {
      const args = await webauthnTfaRegistrationArgsGet({ config })
      console.info(`Live E2E pin webauthnTfaRegistrationArgsGet: success=${args.success}`)
      expect(args.success).toBe(true)
      if (args.success) {
        expect(Object.keys(args.data as unknown as Record<string, unknown>)).toContain("publicKey")
      }
    },
    { timeout: 30_000 },
  )

  test(
    "webauthnTfaGetArgsGet passes through the no-credentials error object (documented quirk)",
    async () => {
      const args = await webauthnTfaGetArgsGet({ config })
      console.info(`Live E2E pin webauthnTfaGetArgsGet: success=${args.success}`)
      expect(args.success).toBe(true)
      if (args.success) {
        expect((args.data as unknown as Record<string, unknown>).type).toBe("error")
      }
    },
    { timeout: 30_000 },
  )

  test(
    "fido2RegistrationAdd is rejected without a session",
    async () => {
      const added = await fido2RegistrationAdd({ config, clientDataJSON: "e2e", attestationObject: "e2e" })
      console.info(`Live E2E pin fido2RegistrationAdd: success=${added.success} status=${added.statusCode}`)
      expect(added.success).toBe(false)
    },
    { timeout: 30_000 },
  )

  test(
    "webauthnTfaRegistrationAdd is rejected without a session",
    async () => {
      const added = await webauthnTfaRegistrationAdd({ config, clientDataJSON: "e2e", attestationObject: "e2e" })
      console.info(`Live E2E pin webauthnTfaRegistrationAdd: success=${added.success} status=${added.statusCode}`)
      expect(added.success).toBe(false)
    },
    { timeout: 30_000 },
  )

  test(
    "fido2FnEdit answers success for the API pseudo-user with empty attrs (no-op live)",
    async () => {
      const edited = await fido2FnEdit({ config, attr: { fido2_attrs: {} } })
      console.info(`Live E2E pin fido2FnEdit: success=${edited.success} status=${edited.statusCode}`)
      expect(edited.success).toBe(true)
    },
    { timeout: 30_000 },
  )

  test(
    "userSelfEdit is rejected without a session",
    async () => {
      const edited = await userSelfEdit({ config, attr: {} })
      console.info(`Live E2E pin userSelfEdit: success=${edited.success} status=${edited.statusCode}`)
      expect(edited.success).toBe(false)
    },
    { timeout: 30_000 },
  )

  test(
    "domainAdminSelfEdit is rejected without a session",
    async () => {
      const dummy = `E2e-${crypto.randomUUID().replaceAll("-", "")}d9!`
      const edited = await domainAdminSelfEdit({
        config,
        attr: { user_old_pass: dummy, user_new_pass: dummy, user_new_pass2: dummy },
      })
      console.info(`Live E2E pin domainAdminSelfEdit: success=${edited.success} status=${edited.statusCode}`)
      expect(edited.success).toBe(false)
    },
    { timeout: 30_000 },
  )
})
