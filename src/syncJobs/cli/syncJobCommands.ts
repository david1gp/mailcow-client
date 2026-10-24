import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import { cliConfigFlagParams } from "../../cli/cliConfigFlagParams.js"
import type { CliConfigFlags } from "../../cli/cliConfigFlags.js"
import { cliFail } from "../../cli/cliFail.js"
import { cliJsonFlagParam } from "../../cli/cliJsonFlagParam.js"
import { cliJsonParse } from "../../cli/cliJsonParse.js"
import { cliRunApi } from "../../cli/cliRunApi.js"
import { cliScalarFlagParams } from "../../cli/cliScalarFlagParams.js"
import type { SyncJobAddRequest } from "../syncJobAddRequest.js"
import { syncJobAdd } from "../syncJobAdd.js"
import { syncJobDelete } from "../syncJobDelete.js"
import { syncJobEdit } from "../syncJobEdit.js"
import { syncJobGet } from "../syncJobGet.js"
import { syncJobList } from "../syncJobList.js"

function syncJobOptionalJsonFlag(brief: string) {
  return cliJsonFlagParam(brief) as { kind: "parsed"; parse: typeof String; optional: true; brief: string }
}

function syncJobItemsParse(value: string | undefined, op: string): (string | number)[] | undefined {
  const parsed = cliJsonParse(value, op, "itemsJson")
  if (!parsed.success) cliFail(parsed)
  return parsed.data as (string | number)[] | undefined
}

function syncJobAttrParse(value: string | undefined, op: string): Record<string, unknown> {
  const parsed = cliJsonParse(value, op, "attrJson")
  if (!parsed.success) cliFail(parsed)
  return (parsed.data ?? {}) as Record<string, unknown>
}

const addCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { username?: string; attrJson?: string }) {
    const attr = syncJobAttrParse(flags.attrJson, "syncJobAdd")
    await cliRunApi(this, flags, (config) =>
      syncJobAdd({
        config,
        attr: {
          ...attr,
          ...(flags.username === undefined ? {} : { username: flags.username }),
        } as SyncJobAddRequest,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      username: cliScalarFlagParams.optionalString("Mailbox (overrides attrJson.username)"),
      attrJson: syncJobOptionalJsonFlag("Sync job attributes JSON"),
    },
  },
  docs: { brief: "Add a sync job" },
})

const listCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags) {
    await cliRunApi(this, flags, (config) => syncJobList({ config }))
  },
  parameters: { flags: { ...cliConfigFlagParams } },
  docs: { brief: "List all sync jobs" },
})

const getCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { mailbox: string; fields?: string[]; withPassword?: boolean },
  ) {
    const fields = [...(flags.fields ?? [])]
    if (flags.withPassword === true && !fields.includes("with_password")) fields.push("with_password")
    await cliRunApi(this, flags, (config) =>
      syncJobGet({ config, mailbox: flags.mailbox, fields: fields.length === 0 ? undefined : fields }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      mailbox: cliScalarFlagParams.requiredString("Mailbox"),
      fields: cliScalarFlagParams.optionalStringList("Field subset CSV (may include with_password)"),
      withPassword: cliScalarFlagParams.optionalBoolean("Opt in to the with_password field"),
    },
  },
  docs: { brief: "Get sync jobs for a mailbox" },
})

const editCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { itemsJson?: string; attrJson?: string }) {
    const items = syncJobItemsParse(flags.itemsJson, "syncJobEdit")
    const attr = syncJobAttrParse(flags.attrJson, "syncJobEdit")
    await cliRunApi(this, flags, (config) =>
      syncJobEdit({
        config,
        items: items ?? [],
        attr: attr as Record<string, string | number | unknown>,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      itemsJson: syncJobOptionalJsonFlag("JSON array of sync job ids to edit"),
      attrJson: syncJobOptionalJsonFlag("Sync job attributes JSON"),
    },
  },
  docs: { brief: "Edit sync jobs" },
})

const deleteCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { itemsJson?: string }) {
    const items = syncJobItemsParse(flags.itemsJson, "syncJobDelete")
    await cliRunApi(this, flags, (config) => syncJobDelete({ config, items: items ?? [] }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      itemsJson: syncJobOptionalJsonFlag("JSON array of sync job ids to delete"),
    },
  },
  docs: { brief: "Delete sync jobs" },
})

export const syncJobCommands = buildRouteMap({
  routes: {
    add: addCommand,
    list: listCommand,
    get: getCommand,
    edit: editCommand,
    delete: deleteCommand,
  },
  docs: { brief: "Manage mailcow sync jobs" },
})
