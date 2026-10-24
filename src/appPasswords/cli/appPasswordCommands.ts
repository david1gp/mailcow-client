import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import { cliConfigFlagParams } from "../../cli/cliConfigFlagParams.js"
import type { CliConfigFlags } from "../../cli/cliConfigFlags.js"
import { cliFail } from "../../cli/cliFail.js"
import { cliJsonFlagParam } from "../../cli/cliJsonFlagParam.js"
import { cliJsonParse } from "../../cli/cliJsonParse.js"
import { cliRunApi } from "../../cli/cliRunApi.js"
import { cliScalarFlagParams } from "../../cli/cliScalarFlagParams.js"
import type { AppPasswordAddRequest } from "../appPasswordAddRequest.js"
import type { AppPasswordProtocol } from "../appPasswordProtocol.js"
import { appPasswordAdd } from "../appPasswordAdd.js"
import { appPasswordDelete } from "../appPasswordDelete.js"
import { appPasswordEdit } from "../appPasswordEdit.js"
import { appPasswordGet } from "../appPasswordGet.js"
import { appPasswordList } from "../appPasswordList.js"

function appPasswordOptionalJsonFlag(brief: string) {
  return cliJsonFlagParam(brief) as { kind: "parsed"; parse: typeof String; optional: true; brief: string }
}

function appPasswordItemsParse(value: string | undefined, op: string): (string | number)[] | undefined {
  const parsed = cliJsonParse(value, op, "itemsJson")
  if (!parsed.success) cliFail(parsed)
  return parsed.data as (string | number)[] | undefined
}

function appPasswordAttrParse(value: string | undefined, op: string): Record<string, unknown> {
  const parsed = cliJsonParse(value, op, "attrJson")
  if (!parsed.success) cliFail(parsed)
  return (parsed.data ?? {}) as Record<string, unknown>
}

const addCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { username?: string; appName?: string; attrJson?: string }) {
    const attr = appPasswordAttrParse(flags.attrJson, "appPasswordAdd")
    await cliRunApi(this, flags, (config) =>
      appPasswordAdd({
        config,
        attr: {
          ...attr,
          ...(flags.username === undefined ? {} : { username: flags.username }),
          ...(flags.appName === undefined ? {} : { app_name: flags.appName }),
        } as AppPasswordAddRequest,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      username: cliScalarFlagParams.optionalString("Mailbox (overrides attrJson.username)"),
      appName: cliScalarFlagParams.optionalString("App name (overrides attrJson.app_name)"),
      attrJson: appPasswordOptionalJsonFlag("App password attributes JSON"),
    },
  },
  docs: { brief: "Add an app password" },
})

const listCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { mailbox?: string }) {
    await cliRunApi(this, flags, (config) => appPasswordList({ config, mailbox: flags.mailbox }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      mailbox: cliScalarFlagParams.optionalString("Scope to one mailbox (default: all)"),
    },
  },
  docs: { brief: "List app passwords" },
})

const getCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { id: number }) {
    await cliRunApi(this, flags, (config) => appPasswordGet({ config, id: flags.id }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      id: cliScalarFlagParams.requiredNumber("App password id (router bug: prefer list)"),
    },
  },
  docs: { brief: "Get an app password (router bug: prefer list)" },
})

const editCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { itemsJson?: string; username?: string; attrJson?: string },
  ) {
    const items = appPasswordItemsParse(flags.itemsJson, "appPasswordEdit")
    const attr = appPasswordAttrParse(flags.attrJson, "appPasswordEdit")
    await cliRunApi(this, flags, (config) =>
      appPasswordEdit({
        config,
        items: items ?? [],
        attr: {
          ...attr,
          ...(flags.username === undefined ? {} : { username: flags.username }),
        } as { username: string; app_name?: string; active?: string | number; protocols?: AppPasswordProtocol[] },
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      itemsJson: appPasswordOptionalJsonFlag("JSON array of app password ids to edit"),
      username: cliScalarFlagParams.optionalString("Target mailbox (required by the server)"),
      attrJson: appPasswordOptionalJsonFlag("App password attributes JSON"),
    },
  },
  docs: { brief: "Edit app passwords" },
})

const deleteCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { itemsJson?: string }) {
    const items = appPasswordItemsParse(flags.itemsJson, "appPasswordDelete")
    await cliRunApi(this, flags, (config) => appPasswordDelete({ config, items: items ?? [] }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      itemsJson: appPasswordOptionalJsonFlag("JSON array of app password ids to delete"),
    },
  },
  docs: { brief: "Delete app passwords" },
})

export const appPasswordCommands = buildRouteMap({
  routes: {
    add: addCommand,
    list: listCommand,
    get: getCommand,
    edit: editCommand,
    delete: deleteCommand,
  },
  docs: { brief: "Manage mailcow app passwords" },
})
