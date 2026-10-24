import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import { cliConfigFlagParams } from "../../cli/cliConfigFlagParams.js"
import type { CliConfigFlags } from "../../cli/cliConfigFlags.js"
import { cliRunApi } from "../../cli/cliRunApi.js"
import { cliScalarFlagParams } from "../../cli/cliScalarFlagParams.js"
import { fido2GetArgsGet } from "../fido2GetArgsGet.js"
import { fido2RegistrationAdd } from "../fido2RegistrationAdd.js"
import { fido2RegistrationArgsGet } from "../fido2RegistrationArgsGet.js"
import { webauthnTfaGetArgsGet } from "../webauthnTfaGetArgsGet.js"
import { webauthnTfaRegistrationAdd } from "../webauthnTfaRegistrationAdd.js"
import { webauthnTfaRegistrationArgsGet } from "../webauthnTfaRegistrationArgsGet.js"

const SESSION_BRIEF_SUFFIX = "(session cookie only; API key unusable)"

const registrationArgsCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags) {
    await cliRunApi(this, flags, (config) => fido2RegistrationArgsGet({ config }))
  },
  parameters: { flags: { ...cliConfigFlagParams } },
  docs: { brief: `Get FIDO2 registration args ${SESSION_BRIEF_SUFFIX}` },
})

const getArgsCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags) {
    await cliRunApi(this, flags, (config) => fido2GetArgsGet({ config }))
  },
  parameters: { flags: { ...cliConfigFlagParams } },
  docs: { brief: `Get FIDO2 login args ${SESSION_BRIEF_SUFFIX}` },
})

const tfaRegistrationArgsCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags) {
    await cliRunApi(this, flags, (config) => webauthnTfaRegistrationArgsGet({ config }))
  },
  parameters: { flags: { ...cliConfigFlagParams } },
  docs: { brief: `Get WebAuthn TFA registration args ${SESSION_BRIEF_SUFFIX}` },
})

const tfaGetArgsCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags) {
    await cliRunApi(this, flags, (config) => webauthnTfaGetArgsGet({ config }))
  },
  parameters: { flags: { ...cliConfigFlagParams } },
  docs: { brief: `Get WebAuthn TFA login args ${SESSION_BRIEF_SUFFIX}` },
})

const registrationAddCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { clientDataJSON: string; attestationObject: string }) {
    await cliRunApi(this, flags, (config) =>
      fido2RegistrationAdd({
        config,
        clientDataJSON: flags.clientDataJSON,
        attestationObject: flags.attestationObject,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      clientDataJSON: cliScalarFlagParams.requiredString("Base64 clientDataJSON from the authenticator"),
      attestationObject: cliScalarFlagParams.requiredString("Base64 attestationObject from the authenticator"),
    },
  },
  docs: { brief: `Submit FIDO2 registration ${SESSION_BRIEF_SUFFIX}` },
})

const tfaRegistrationAddCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & {
      clientDataJSON: string
      attestationObject: string
      tfaMethod?: string
      keyId?: string
      confirmPassword?: string
    },
  ) {
    await cliRunApi(this, flags, (config) =>
      webauthnTfaRegistrationAdd({
        config,
        clientDataJSON: flags.clientDataJSON,
        attestationObject: flags.attestationObject,
        ...(flags.tfaMethod === undefined ? {} : { tfa_method: flags.tfaMethod }),
        ...(flags.keyId === undefined ? {} : { key_id: flags.keyId }),
        ...(flags.confirmPassword === undefined ? {} : { confirm_password: flags.confirmPassword }),
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      clientDataJSON: cliScalarFlagParams.requiredString("Base64 clientDataJSON from the authenticator"),
      attestationObject: cliScalarFlagParams.requiredString("Base64 attestationObject from the authenticator"),
      tfaMethod: cliScalarFlagParams.optionalString("TFA method label"),
      keyId: cliScalarFlagParams.optionalString("Key id"),
      confirmPassword: cliScalarFlagParams.optionalString("Password confirmation"),
    },
  },
  docs: { brief: `Submit WebAuthn TFA registration ${SESSION_BRIEF_SUFFIX}` },
})

export const fido2Commands = buildRouteMap({
  routes: {
    "registration-args": registrationArgsCommand,
    "get-args": getArgsCommand,
    "tfa-registration-args": tfaRegistrationArgsCommand,
    "tfa-get-args": tfaGetArgsCommand,
    "registration-add": registrationAddCommand,
    "tfa-registration-add": tfaRegistrationAddCommand,
  },
  docs: { brief: `WebAuthn ceremonies ${SESSION_BRIEF_SUFFIX}` },
})
