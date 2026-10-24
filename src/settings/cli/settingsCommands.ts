import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import { cliConfigFlagParams } from "../../cli/cliConfigFlagParams.js"
import type { CliConfigFlags } from "../../cli/cliConfigFlags.js"
import { cliFail } from "../../cli/cliFail.js"
import { cliJsonFlagParam } from "../../cli/cliJsonFlagParam.js"
import { cliJsonParse } from "../../cli/cliJsonParse.js"
import { cliRunApi } from "../../cli/cliRunApi.js"
import { appLinksEdit } from "../appLinksEdit.js"
import { corsEdit } from "../corsEdit.js"
import { customLoginEdit } from "../customLoginEdit.js"
import { fido2FnEdit } from "../fido2FnEdit.js"
import { identityProviderDelete } from "../identityProviderDelete.js"
import { identityProviderEdit } from "../identityProviderEdit.js"
import { identityProviderTestEdit } from "../identityProviderTestEdit.js"
import { ipCheckEdit } from "../ipCheckEdit.js"
import { passwordPolicyEdit } from "../passwordPolicyEdit.js"
import { passwordPolicyGet } from "../passwordPolicyGet.js"
import { passwordPolicyHtmlGet } from "../passwordPolicyHtmlGet.js"
import { quotaNotificationBccEdit } from "../quotaNotificationBccEdit.js"
import { quotaNotificationEdit } from "../quotaNotificationEdit.js"
import { resetPasswordNotificationEdit } from "../resetPasswordNotificationEdit.js"
import { uiTextsEdit } from "../uiTextsEdit.js"
import { uiThemeEdit } from "../uiThemeEdit.js"
import { userSelfEdit } from "../userSelfEdit.js"

function settingsOptionalJsonFlag(brief: string) {
  return cliJsonFlagParam(brief) as { kind: "parsed"; parse: typeof String; optional: true; brief: string }
}

function settingsAttrParse(value: string | undefined, op: string): Record<string, unknown> {
  const parsed = cliJsonParse(value, op, "attrJson")
  if (!parsed.success) cliFail(parsed)
  return (parsed.data ?? {}) as Record<string, unknown>
}

type AttrFlags = CliConfigFlags & { attrJson?: string }

function settingsEditCommand(
  op: string,
  brief: string,
  run: (
    config: Parameters<typeof appLinksEdit>[0]["config"],
    attr: Record<string, unknown>,
  ) => ReturnType<typeof appLinksEdit>,
) {
  return buildCommand({
    async func(this: CommandContext, flags: AttrFlags) {
      const attr = settingsAttrParse(flags.attrJson, op)
      await cliRunApi(this, flags, (config) => run(config, attr))
    },
    parameters: {
      flags: {
        ...cliConfigFlagParams,
        attrJson: settingsOptionalJsonFlag("Settings attributes JSON"),
      },
    },
    docs: { brief },
  })
}

const passwordPolicyGetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags) {
    await cliRunApi(this, flags, (config) => passwordPolicyGet({ config }))
  },
  parameters: { flags: { ...cliConfigFlagParams } },
  docs: { brief: "Show password policy rules" },
})

const passwordPolicyHtmlGetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags) {
    await cliRunApi(this, flags, (config) => passwordPolicyHtmlGet({ config }))
  },
  parameters: { flags: { ...cliConfigFlagParams } },
  docs: { brief: "Show password policy as an HTML fragment" },
})

const identityProviderDeleteCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags) {
    await cliRunApi(this, flags, (config) => identityProviderDelete({ config }))
  },
  parameters: { flags: { ...cliConfigFlagParams } },
  docs: { brief: "Delete the identity provider configuration" },
})

export const settingsCommands = buildRouteMap({
  routes: {
    "app-links": settingsEditCommand("appLinksEdit", "Edit app links", (config, attr) =>
      appLinksEdit({ config, attr: attr as Parameters<typeof appLinksEdit>[0]["attr"] }),
    ),
    "ui-texts": settingsEditCommand("uiTextsEdit", "Edit UI texts", (config, attr) =>
      uiTextsEdit({ config, attr: attr as Parameters<typeof uiTextsEdit>[0]["attr"] }),
    ),
    "ip-check": settingsEditCommand("ipCheckEdit", "Edit IP check opt-in", (config, attr) =>
      ipCheckEdit({ config, attr: attr as Parameters<typeof ipCheckEdit>[0]["attr"] }),
    ),
    "custom-login": settingsEditCommand("customLoginEdit", "Edit custom login options", (config, attr) =>
      customLoginEdit({ config, attr: attr as Parameters<typeof customLoginEdit>[0]["attr"] }),
    ),
    "ui-theme": settingsEditCommand("uiThemeEdit", "Edit UI theme", (config, attr) =>
      uiThemeEdit({ config, attr: attr as Parameters<typeof uiThemeEdit>[0]["attr"] }),
    ),
    "password-policy": settingsEditCommand("passwordPolicyEdit", "Edit password policy rules", (config, attr) =>
      passwordPolicyEdit({ config, attr: attr as Parameters<typeof passwordPolicyEdit>[0]["attr"] }),
    ),
    "password-policy-get": passwordPolicyGetCommand,
    "password-policy-html": passwordPolicyHtmlGetCommand,
    "quota-notification": settingsEditCommand(
      "quotaNotificationEdit",
      "Edit quota notification template",
      (config, attr) =>
        quotaNotificationEdit({
          config,
          attr: attr as Parameters<typeof quotaNotificationEdit>[0]["attr"],
        }),
    ),
    "quota-notification-bcc": settingsEditCommand(
      "quotaNotificationBccEdit",
      "Edit quota notification BCC recipient",
      (config, attr) =>
        quotaNotificationBccEdit({
          config,
          attr: attr as Parameters<typeof quotaNotificationBccEdit>[0]["attr"],
        }),
    ),
    cors: settingsEditCommand("corsEdit", "Edit CORS origins and methods", (config, attr) =>
      corsEdit({ config, attr: attr as Parameters<typeof corsEdit>[0]["attr"] }),
    ),
    "identity-provider": settingsEditCommand(
      "identityProviderEdit",
      "Edit identity provider settings",
      (config, attr) =>
        identityProviderEdit({
          config,
          attr: attr as Parameters<typeof identityProviderEdit>[0]["attr"],
        }),
    ),
    "identity-provider-test": settingsEditCommand(
      "identityProviderTestEdit",
      "Test identity provider connection",
      (config, attr) =>
        identityProviderTestEdit({
          config,
          attr: attr as Parameters<typeof identityProviderTestEdit>[0]["attr"],
        }),
    ),
    "identity-provider-delete": identityProviderDeleteCommand,
    "reset-password-notification": settingsEditCommand(
      "resetPasswordNotificationEdit",
      "Edit reset-password notification template",
      (config, attr) =>
        resetPasswordNotificationEdit({
          config,
          attr: attr as Parameters<typeof resetPasswordNotificationEdit>[0]["attr"],
        }),
    ),
    "fido2-fn": settingsEditCommand("fido2FnEdit", "Edit FIDO2 friendly names (session user only)", (config, attr) =>
      fido2FnEdit({ config, attr: attr as Parameters<typeof fido2FnEdit>[0]["attr"] }),
    ),
    "self-edit": settingsEditCommand(
      "userSelfEdit",
      "Edit own mailbox-user account (session user only)",
      (config, attr) => userSelfEdit({ config, attr: attr as Parameters<typeof userSelfEdit>[0]["attr"] }),
    ),
  },
  docs: { brief: "Edit branding, policy, and misc server settings" },
})
