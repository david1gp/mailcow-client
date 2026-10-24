import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import { cliConfigFlagParams } from "../../cli/cliConfigFlagParams.js"
import type { CliConfigFlags } from "../../cli/cliConfigFlags.js"
import { cliFail } from "../../cli/cliFail.js"
import { cliJsonFlagParam } from "../../cli/cliJsonFlagParam.js"
import { cliJsonParse } from "../../cli/cliJsonParse.js"
import { cliRunApi } from "../../cli/cliRunApi.js"
import { cliScalarFlagParams } from "../../cli/cliScalarFlagParams.js"
import type { DomainAdminAddRequest } from "../domainAdminAddRequest.js"
import { domainAdminAclEdit } from "../domainAdminAclEdit.js"
import { domainAdminAdd } from "../domainAdminAdd.js"
import { domainAdminDelete } from "../domainAdminDelete.js"
import { domainAdminEdit } from "../domainAdminEdit.js"
import { domainAdminGet } from "../domainAdminGet.js"
import { domainAdminList } from "../domainAdminList.js"
import { domainAdminSelfEdit } from "../domainAdminSelfEdit.js"
import { domainAdminSsoAdd } from "../domainAdminSsoAdd.js"

function domainAdminOptionalJsonFlag(brief: string) {
  return cliJsonFlagParam(brief) as { kind: "parsed"; parse: typeof String; optional: true; brief: string }
}

function domainAdminItemsParse(value: string | undefined, op: string): (string | number)[] | undefined {
  const parsed = cliJsonParse(value, op, "itemsJson")
  if (!parsed.success) cliFail(parsed)
  return parsed.data as (string | number)[] | undefined
}

function domainAdminAttrParse(value: string | undefined, op: string): Record<string, unknown> {
  const parsed = cliJsonParse(value, op, "attrJson")
  if (!parsed.success) cliFail(parsed)
  return (parsed.data ?? {}) as Record<string, unknown>
}

const addCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { username?: string; attrJson?: string }) {
    const attr = domainAdminAttrParse(flags.attrJson, "domainAdminAdd")
    await cliRunApi(this, flags, (config) =>
      domainAdminAdd({
        config,
        attr: {
          ...attr,
          ...(flags.username === undefined ? {} : { username: flags.username }),
        } as DomainAdminAddRequest,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      username: cliScalarFlagParams.optionalString("Username (overrides attrJson.username)"),
      attrJson: domainAdminOptionalJsonFlag("Domain admin attributes JSON"),
    },
  },
  docs: { brief: "Add a domain admin" },
})

const listCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags) {
    await cliRunApi(this, flags, (config) => domainAdminList({ config }))
  },
  parameters: { flags: { ...cliConfigFlagParams } },
  docs: { brief: "List domain admins" },
})

const getCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { username: string }) {
    await cliRunApi(this, flags, (config) => domainAdminGet({ config, username: flags.username }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      username: cliScalarFlagParams.requiredString("Domain admin username"),
    },
  },
  docs: { brief: "Get a domain admin" },
})

const editCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { itemsJson?: string; attrJson?: string }) {
    const items = domainAdminItemsParse(flags.itemsJson, "domainAdminEdit")
    const attr = domainAdminAttrParse(flags.attrJson, "domainAdminEdit")
    await cliRunApi(this, flags, (config) =>
      domainAdminEdit({
        config,
        items: items ?? [],
        attr: attr as Record<string, string | number | string[]>,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      itemsJson: domainAdminOptionalJsonFlag("JSON array of usernames to edit"),
      attrJson: domainAdminOptionalJsonFlag("Domain admin attributes JSON"),
    },
  },
  docs: { brief: "Edit domain admins" },
})

const aclEditCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { username: string; attrJson?: string }) {
    const attr = domainAdminAttrParse(flags.attrJson, "domainAdminAclEdit")
    await cliRunApi(this, flags, (config) =>
      domainAdminAclEdit({
        config,
        items: [flags.username],
        attr: { da_acl: (attr["da_acl"] ?? []) as string[] },
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      username: cliScalarFlagParams.requiredString("Domain admin username"),
      attrJson: domainAdminOptionalJsonFlag('ACL attributes JSON ({"da_acl": [...]})'),
    },
  },
  docs: { brief: "Edit a domain admin ACL" },
})

const ssoAddCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { username: string }) {
    await cliRunApi(this, flags, (config) => domainAdminSsoAdd({ config, attr: { username: flags.username } }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      username: cliScalarFlagParams.requiredString("Domain admin username"),
    },
  },
  docs: { brief: "Issue a domain admin SSO token" },
})

const selfEditCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { attrJson?: string }) {
    const attr = domainAdminAttrParse(flags.attrJson, "domainAdminSelfEdit")
    await cliRunApi(this, flags, (config) =>
      domainAdminSelfEdit({
        config,
        attr: attr as { user_old_pass?: string; user_new_pass: string; user_new_pass2: string },
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      attrJson: domainAdminOptionalJsonFlag("Self-edit attributes JSON"),
    },
  },
  docs: { brief: "Edit own domain admin password (session-only)" },
})

const deleteCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { itemsJson?: string }) {
    const items = domainAdminItemsParse(flags.itemsJson, "domainAdminDelete")
    await cliRunApi(this, flags, (config) => domainAdminDelete({ config, items: items ?? [] }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      itemsJson: domainAdminOptionalJsonFlag("JSON array of usernames to delete"),
    },
  },
  docs: { brief: "Delete domain admins" },
})

export const domainAdminCommands = buildRouteMap({
  routes: {
    add: addCommand,
    list: listCommand,
    get: getCommand,
    edit: editCommand,
    "acl-edit": aclEditCommand,
    "sso-add": ssoAddCommand,
    "self-edit": selfEditCommand,
    delete: deleteCommand,
  },
  docs: { brief: "Manage mailcow domain admins" },
})
