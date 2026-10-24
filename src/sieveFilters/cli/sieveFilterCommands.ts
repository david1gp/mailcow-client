import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import { cliConfigFlagParams } from "../../cli/cliConfigFlagParams.js"
import type { CliConfigFlags } from "../../cli/cliConfigFlags.js"
import { cliFail } from "../../cli/cliFail.js"
import { cliJsonFlagParam } from "../../cli/cliJsonFlagParam.js"
import { cliJsonParse } from "../../cli/cliJsonParse.js"
import { cliRunApi } from "../../cli/cliRunApi.js"
import { cliScalarFlagParams } from "../../cli/cliScalarFlagParams.js"
import type { FilterAddRequest } from "../filterAddRequest.js"
import { filterAdd } from "../filterAdd.js"
import { filterDelete } from "../filterDelete.js"
import { filterEdit } from "../filterEdit.js"
import { filterList } from "../filterList.js"
import { globalFilterAdd } from "../globalFilterAdd.js"
import { globalFilterGet } from "../globalFilterGet.js"
import { rspamdPresetList } from "../rspamdPresetList.js"
import { sievePresetList } from "../sievePresetList.js"

function sieveOptionalJsonFlag(brief: string) {
  return cliJsonFlagParam(brief) as { kind: "parsed"; parse: typeof String; optional: true; brief: string }
}

function sieveItemsParse(value: string | undefined, op: string): (string | number)[] | undefined {
  const parsed = cliJsonParse(value, op, "itemsJson")
  if (!parsed.success) cliFail(parsed)
  return parsed.data as (string | number)[] | undefined
}

function sieveAttrParse(value: string | undefined, op: string): Record<string, unknown> {
  const parsed = cliJsonParse(value, op, "attrJson")
  if (!parsed.success) cliFail(parsed)
  return (parsed.data ?? {}) as Record<string, unknown>
}

const addCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { username?: string; attrJson?: string }) {
    const attr = sieveAttrParse(flags.attrJson, "filterAdd")
    await cliRunApi(this, flags, (config) =>
      filterAdd({
        config,
        attr: {
          ...attr,
          ...(flags.username === undefined ? {} : { username: flags.username }),
        } as FilterAddRequest,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      username: cliScalarFlagParams.optionalString("Mailbox (overrides attrJson.username)"),
      attrJson: sieveOptionalJsonFlag("Filter attributes JSON"),
    },
  },
  docs: { brief: "Add a sieve filter" },
})

const globalAddCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { attrJson?: string }) {
    const attr = sieveAttrParse(flags.attrJson, "globalFilterAdd")
    await cliRunApi(this, flags, (config) =>
      globalFilterAdd({
        config,
        attr: attr as { filter_type: "prefilter" | "postfilter"; script_data: string },
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      attrJson: sieveOptionalJsonFlag("Global filter attributes JSON"),
    },
  },
  docs: { brief: "Add a global sieve filter (admin)" },
})

const listCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { mailbox?: string }) {
    await cliRunApi(this, flags, (config) => filterList({ config, mailbox: flags.mailbox }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      mailbox: cliScalarFlagParams.optionalString("Scope to one mailbox (default: all)"),
    },
  },
  docs: { brief: "List sieve filters" },
})

const globalGetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { scope?: string }) {
    await cliRunApi(this, flags, (config) =>
      globalFilterGet({ config, scope: flags.scope as "all" | "prefilter" | "postfilter" | undefined }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      scope: cliScalarFlagParams.optionalString("Global filter scope: all, prefilter, postfilter"),
    },
  },
  docs: { brief: "Get global sieve filters" },
})

const sievePresetListCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags) {
    await cliRunApi(this, flags, (config) => sievePresetList({ config }))
  },
  parameters: { flags: { ...cliConfigFlagParams } },
  docs: { brief: "List sieve presets" },
})

const rspamdPresetListCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags) {
    await cliRunApi(this, flags, (config) => rspamdPresetList({ config }))
  },
  parameters: { flags: { ...cliConfigFlagParams } },
  docs: { brief: "List rspamd presets" },
})

const editCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { itemsJson?: string; attrJson?: string }) {
    const items = sieveItemsParse(flags.itemsJson, "filterEdit")
    const attr = sieveAttrParse(flags.attrJson, "filterEdit")
    await cliRunApi(this, flags, (config) =>
      filterEdit({
        config,
        items: items ?? [],
        attr: attr as Record<string, string | number>,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      itemsJson: sieveOptionalJsonFlag("JSON array of filter ids to edit"),
      attrJson: sieveOptionalJsonFlag("Filter attributes JSON"),
    },
  },
  docs: { brief: "Edit sieve filters" },
})

const deleteCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { itemsJson?: string }) {
    const items = sieveItemsParse(flags.itemsJson, "filterDelete")
    await cliRunApi(this, flags, (config) => filterDelete({ config, items: items ?? [] }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      itemsJson: sieveOptionalJsonFlag("JSON array of filter ids to delete"),
    },
  },
  docs: { brief: "Delete sieve filters" },
})

export const sieveFilterCommands = buildRouteMap({
  routes: {
    add: addCommand,
    "global-add": globalAddCommand,
    list: listCommand,
    "global-get": globalGetCommand,
    "sieve-preset-list": sievePresetListCommand,
    "rspamd-preset-list": rspamdPresetListCommand,
    edit: editCommand,
    delete: deleteCommand,
  },
  docs: { brief: "Manage mailcow sieve filters" },
})
