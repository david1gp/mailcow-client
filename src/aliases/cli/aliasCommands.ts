import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import { cliConfigFlagParams } from "../../cli/cliConfigFlagParams.js"
import type { CliConfigFlags } from "../../cli/cliConfigFlags.js"
import { cliFail } from "../../cli/cliFail.js"
import { cliJsonFlagParam } from "../../cli/cliJsonFlagParam.js"
import { cliJsonParse } from "../../cli/cliJsonParse.js"
import { cliRunApi } from "../../cli/cliRunApi.js"
import { cliScalarFlagParams } from "../../cli/cliScalarFlagParams.js"
import type { AliasAddRequest } from "../aliasAddRequest.js"
import { aliasAdd } from "../aliasAdd.js"
import { aliasDelete } from "../aliasDelete.js"
import { aliasEdit } from "../aliasEdit.js"
import { aliasGet } from "../aliasGet.js"
import { aliasList } from "../aliasList.js"
import type { TimeLimitedAliasAddRequest } from "../timeLimitedAliasAddRequest.js"
import { timeLimitedAliasAdd } from "../timeLimitedAliasAdd.js"
import { timeLimitedAliasDelete } from "../timeLimitedAliasDelete.js"
import { timeLimitedAliasEdit } from "../timeLimitedAliasEdit.js"
import { timeLimitedAliasList } from "../timeLimitedAliasList.js"

function aliasOptionalJsonFlag(brief: string) {
  return cliJsonFlagParam(brief) as { kind: "parsed"; parse: typeof String; optional: true; brief: string }
}

function aliasItemsParse(value: string | undefined, op: string): (string | number)[] | undefined {
  const parsed = cliJsonParse(value, op, "itemsJson")
  if (!parsed.success) cliFail(parsed)
  return parsed.data as (string | number)[] | undefined
}

function aliasAttrParse(value: string | undefined, op: string): Record<string, unknown> {
  const parsed = cliJsonParse(value, op, "attrJson")
  if (!parsed.success) cliFail(parsed)
  return (parsed.data ?? {}) as Record<string, unknown>
}

const addCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { address?: string; goto?: string; attrJson?: string }) {
    const attr = aliasAttrParse(flags.attrJson, "aliasAdd")
    await cliRunApi(this, flags, (config) =>
      aliasAdd({
        config,
        attr: {
          ...attr,
          ...(flags.address === undefined ? {} : { address: flags.address }),
          ...(flags.goto === undefined ? {} : { goto: flags.goto }),
        } as AliasAddRequest,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      address: cliScalarFlagParams.optionalString("Alias address (overrides attrJson.address)"),
      goto: cliScalarFlagParams.optionalString("Goto CSV (overrides attrJson.goto)"),
      attrJson: aliasOptionalJsonFlag("Alias attributes JSON"),
    },
  },
  docs: { brief: "Add an alias" },
})

const listCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { domains?: string[] }) {
    await cliRunApi(this, flags, (config) => aliasList({ config, domains: flags.domains }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      domains: cliScalarFlagParams.optionalStringList("Scope to domains (comma-separated)"),
    },
  },
  docs: { brief: "List aliases" },
})

const getCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { address: string }) {
    await cliRunApi(this, flags, (config) => aliasGet({ config, address: flags.address }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      address: cliScalarFlagParams.requiredString("Alias address"),
    },
  },
  docs: { brief: "Get an alias" },
})

const editCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { itemsJson?: string; attrJson?: string }) {
    await cliRunApi(this, flags, (config) =>
      aliasEdit({
        config,
        items: aliasItemsParse(flags.itemsJson, "aliasEdit") ?? [],
        attr: aliasAttrParse(flags.attrJson, "aliasEdit") as Record<string, string | number>,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      itemsJson: aliasOptionalJsonFlag("JSON array of alias ids to edit"),
      attrJson: aliasOptionalJsonFlag("Alias attributes JSON"),
    },
  },
  docs: { brief: "Edit aliases" },
})

const deleteCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { itemsJson?: string }) {
    await cliRunApi(this, flags, (config) =>
      aliasDelete({ config, items: aliasItemsParse(flags.itemsJson, "aliasDelete") ?? [] }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      itemsJson: aliasOptionalJsonFlag("JSON array of alias ids to delete"),
    },
  },
  docs: { brief: "Delete aliases" },
})

const timeLimitedAddCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { username?: string; domain?: string; attrJson?: string }) {
    const attr = aliasAttrParse(flags.attrJson, "timeLimitedAliasAdd")
    await cliRunApi(this, flags, (config) =>
      timeLimitedAliasAdd({
        config,
        attr: {
          ...attr,
          ...(flags.username === undefined ? {} : { username: flags.username }),
          ...(flags.domain === undefined ? {} : { domain: flags.domain }),
        } as TimeLimitedAliasAddRequest,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      username: cliScalarFlagParams.optionalString("Mailbox local part"),
      domain: cliScalarFlagParams.optionalString("Domain"),
      attrJson: aliasOptionalJsonFlag("Time-limited alias attributes JSON"),
    },
  },
  docs: { brief: "Add a time-limited alias" },
})

const timeLimitedListCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { mailbox: string }) {
    await cliRunApi(this, flags, (config) => timeLimitedAliasList({ config, mailbox: flags.mailbox }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      mailbox: cliScalarFlagParams.requiredString("Mailbox address"),
    },
  },
  docs: { brief: "List time-limited aliases" },
})

const timeLimitedEditCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { itemsJson?: string; attrJson?: string }) {
    await cliRunApi(this, flags, (config) =>
      timeLimitedAliasEdit({
        config,
        items: aliasItemsParse(flags.itemsJson, "timeLimitedAliasEdit") ?? [],
        attr: aliasAttrParse(flags.attrJson, "timeLimitedAliasEdit") as Record<string, string | number | boolean>,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      itemsJson: aliasOptionalJsonFlag("JSON array of alias addresses to edit"),
      attrJson: aliasOptionalJsonFlag("Time-limited alias attributes JSON"),
    },
  },
  docs: { brief: "Edit time-limited aliases" },
})

const timeLimitedDeleteCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { itemsJson?: string }) {
    await cliRunApi(this, flags, (config) =>
      timeLimitedAliasDelete({ config, items: aliasItemsParse(flags.itemsJson, "timeLimitedAliasDelete") ?? [] }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      itemsJson: aliasOptionalJsonFlag("JSON array of alias addresses to delete"),
    },
  },
  docs: { brief: "Delete time-limited aliases" },
})

export const aliasCommands = buildRouteMap({
  routes: {
    add: addCommand,
    list: listCommand,
    get: getCommand,
    edit: editCommand,
    delete: deleteCommand,
    "time-limited-add": timeLimitedAddCommand,
    "time-limited-list": timeLimitedListCommand,
    "time-limited-edit": timeLimitedEditCommand,
    "time-limited-delete": timeLimitedDeleteCommand,
  },
  docs: { brief: "Manage mailcow aliases" },
})
