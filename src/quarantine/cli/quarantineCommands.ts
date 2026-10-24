import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import { cliConfigFlagParams } from "../../cli/cliConfigFlagParams.js"
import type { CliConfigFlags } from "../../cli/cliConfigFlags.js"
import { cliFail } from "../../cli/cliFail.js"
import { cliJsonFlagParam } from "../../cli/cliJsonFlagParam.js"
import { cliJsonParse } from "../../cli/cliJsonParse.js"
import { cliRunApi } from "../../cli/cliRunApi.js"
import { cliScalarFlagParams } from "../../cli/cliScalarFlagParams.js"
import { qitemDelete } from "../qitemDelete.js"
import { qitemEdit } from "../qitemEdit.js"
import { quarantineGet } from "../quarantineGet.js"
import { quarantineList } from "../quarantineList.js"
import { quarantineSettingsEdit } from "../quarantineSettingsEdit.js"

function quarantineOptionalJsonFlag(brief: string) {
  return cliJsonFlagParam(brief) as { kind: "parsed"; parse: typeof String; optional: true; brief: string }
}

function quarantineItemsParse(value: string | undefined, op: string): (string | number)[] | undefined {
  const parsed = cliJsonParse(value, op, "itemsJson")
  if (!parsed.success) cliFail(parsed)
  return parsed.data as (string | number)[] | undefined
}

const listCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags) {
    await cliRunApi(this, flags, (config) => quarantineList({ config }))
  },
  parameters: { flags: { ...cliConfigFlagParams } },
  docs: { brief: "List quarantined items" },
})

const getCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { id: string }) {
    await cliRunApi(this, flags, (config) => quarantineGet({ config, id: flags.id }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      id: cliScalarFlagParams.requiredString("Quarantine item id"),
    },
  },
  docs: { brief: "Get a quarantined item" },
})

const qitemEditCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { action?: string; releaseFormat?: string; itemsJson?: string },
  ) {
    const items = quarantineItemsParse(flags.itemsJson, "qitemEdit")
    await cliRunApi(this, flags, (config) =>
      qitemEdit({
        config,
        items: items ?? [],
        attr: {
          ...(flags.action === undefined ? {} : { action: flags.action }),
          ...(flags.releaseFormat === undefined ? {} : { release_format: flags.releaseFormat }),
        } as { action: "release" | "learnham" | "learnspam"; release_format?: "attachment" | "raw" },
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      action: cliScalarFlagParams.optionalString("Item action: release, learnham, or learnspam"),
      releaseFormat: cliScalarFlagParams.optionalString("Release format: attachment or raw"),
      itemsJson: quarantineOptionalJsonFlag("JSON array of quarantine item ids"),
    },
  },
  docs: { brief: "Release or learn quarantined items" },
})

const settingsEditCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { attrJson?: string }) {
    const attrResult = cliJsonParse(flags.attrJson, "quarantineSettingsEdit", "attrJson")
    if (!attrResult.success) cliFail(attrResult)
    await cliRunApi(this, flags, (config) =>
      quarantineSettingsEdit({
        config,
        attr: (attrResult.data ?? {}) as Record<string, string | number | string[]>,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      attrJson: quarantineOptionalJsonFlag("Global quarantine settings JSON"),
    },
  },
  docs: { brief: "Edit global quarantine settings (admin)" },
})

const qitemDeleteCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { itemsJson?: string }) {
    const items = quarantineItemsParse(flags.itemsJson, "qitemDelete")
    await cliRunApi(this, flags, (config) => qitemDelete({ config, items: items ?? [] }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      itemsJson: quarantineOptionalJsonFlag("JSON array of quarantine item ids to delete"),
    },
  },
  docs: { brief: "Delete quarantined items" },
})

export const quarantineCommands = buildRouteMap({
  routes: {
    list: listCommand,
    get: getCommand,
    "item-edit": qitemEditCommand,
    "settings-edit": settingsEditCommand,
    "item-delete": qitemDeleteCommand,
  },
  docs: { brief: "Manage mailcow quarantine items and settings" },
})
