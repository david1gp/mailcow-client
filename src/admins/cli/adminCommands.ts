import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import { cliConfigFlagParams } from "../../cli/cliConfigFlagParams.js"
import type { CliConfigFlags } from "../../cli/cliConfigFlags.js"
import { cliFail } from "../../cli/cliFail.js"
import { cliJsonFlagParam } from "../../cli/cliJsonFlagParam.js"
import { cliJsonParse } from "../../cli/cliJsonParse.js"
import { cliRunApi } from "../../cli/cliRunApi.js"
import { cliScalarFlagParams } from "../../cli/cliScalarFlagParams.js"
import type { AdminAddRequest } from "../adminAddRequest.js"
import { adminAdd } from "../adminAdd.js"
import { adminDelete } from "../adminDelete.js"
import { adminEdit } from "../adminEdit.js"
import { adminGet } from "../adminGet.js"
import { adminList } from "../adminList.js"

function adminOptionalJsonFlag(brief: string) {
  return cliJsonFlagParam(brief) as { kind: "parsed"; parse: typeof String; optional: true; brief: string }
}

function adminItemsParse(value: string | undefined, op: string): (string | number)[] | undefined {
  const parsed = cliJsonParse(value, op, "itemsJson")
  if (!parsed.success) cliFail(parsed)
  return parsed.data as (string | number)[] | undefined
}

function adminAttrParse(value: string | undefined, op: string): Record<string, unknown> {
  const parsed = cliJsonParse(value, op, "attrJson")
  if (!parsed.success) cliFail(parsed)
  return (parsed.data ?? {}) as Record<string, unknown>
}

const addCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { username?: string; attrJson?: string }) {
    const attr = adminAttrParse(flags.attrJson, "adminAdd")
    await cliRunApi(this, flags, (config) =>
      adminAdd({
        config,
        attr: {
          ...attr,
          ...(flags.username === undefined ? {} : { username: flags.username }),
        } as AdminAddRequest,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      username: cliScalarFlagParams.optionalString("Username (overrides attrJson.username)"),
      attrJson: adminOptionalJsonFlag("Admin attributes JSON"),
    },
  },
  docs: { brief: "Add an admin" },
})

const listCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags) {
    await cliRunApi(this, flags, (config) => adminList({ config }))
  },
  parameters: { flags: { ...cliConfigFlagParams } },
  docs: { brief: "List admins" },
})

const getCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { username: string }) {
    await cliRunApi(this, flags, (config) => adminGet({ config, username: flags.username }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      username: cliScalarFlagParams.requiredString("Admin username"),
    },
  },
  docs: { brief: "Get an admin" },
})

const editCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { itemsJson?: string; attrJson?: string }) {
    const items = adminItemsParse(flags.itemsJson, "adminEdit")
    const attr = adminAttrParse(flags.attrJson, "adminEdit")
    await cliRunApi(this, flags, (config) =>
      adminEdit({
        config,
        items: items ?? [],
        attr: attr as Record<string, string | number>,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      itemsJson: adminOptionalJsonFlag("JSON array of usernames to edit"),
      attrJson: adminOptionalJsonFlag("Admin attributes JSON"),
    },
  },
  docs: { brief: "Edit admins" },
})

const deleteCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { itemsJson?: string }) {
    const items = adminItemsParse(flags.itemsJson, "adminDelete")
    await cliRunApi(this, flags, (config) => adminDelete({ config, items: items ?? [] }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      itemsJson: adminOptionalJsonFlag("JSON array of usernames to delete"),
    },
  },
  docs: { brief: "Delete admins" },
})

export const adminCommands = buildRouteMap({
  routes: {
    add: addCommand,
    list: listCommand,
    get: getCommand,
    edit: editCommand,
    delete: deleteCommand,
  },
  docs: { brief: "Manage mailcow admins" },
})
