import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import { cliConfigFlagParams } from "../../cli/cliConfigFlagParams.js"
import type { CliConfigFlags } from "../../cli/cliConfigFlags.js"
import { cliFail } from "../../cli/cliFail.js"
import { cliJsonFlagParam } from "../../cli/cliJsonFlagParam.js"
import { cliJsonParse } from "../../cli/cliJsonParse.js"
import { cliRunApi } from "../../cli/cliRunApi.js"
import { cliScalarFlagParams } from "../../cli/cliScalarFlagParams.js"
import { mtaStsAdd } from "../mtaStsAdd.js"
import type { MtaStsAddRequest } from "../mtaStsAddRequest.js"
import { mtaStsEdit } from "../mtaStsEdit.js"
import { tlsPolicyMapAdd } from "../tlsPolicyMapAdd.js"
import type { TlsPolicyMapAddRequest } from "../tlsPolicyMapAddRequest.js"
import { tlsPolicyMapDelete } from "../tlsPolicyMapDelete.js"
import { tlsPolicyMapEdit } from "../tlsPolicyMapEdit.js"
import { tlsPolicyMapGet } from "../tlsPolicyMapGet.js"
import { tlsPolicyMapList } from "../tlsPolicyMapList.js"

function tlsOptionalJsonFlag(brief: string) {
  return cliJsonFlagParam(brief) as { kind: "parsed"; parse: typeof String; optional: true; brief: string }
}

function tlsItemsParse(value: string | undefined, op: string): (string | number)[] | undefined {
  const parsed = cliJsonParse(value, op, "itemsJson")
  if (!parsed.success) cliFail(parsed)
  return parsed.data as (string | number)[] | undefined
}

const addCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { dest?: string; policy?: string; attrJson?: string }) {
    const attrResult = cliJsonParse(flags.attrJson, "tlsPolicyMapAdd", "attrJson")
    if (!attrResult.success) cliFail(attrResult)
    await cliRunApi(this, flags, (config) =>
      tlsPolicyMapAdd({
        config,
        attr: {
          ...((attrResult.data ?? {}) as Partial<TlsPolicyMapAddRequest>),
          ...(flags.dest === undefined ? {} : { dest: flags.dest }),
          ...(flags.policy === undefined ? {} : { policy: flags.policy }),
        } as TlsPolicyMapAddRequest,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      dest: cliScalarFlagParams.optionalString("Destination domain (overrides attrJson.dest)"),
      policy: cliScalarFlagParams.optionalString("Policy, e.g. none, may, encrypt, dane (overrides attrJson.policy)"),
      attrJson: tlsOptionalJsonFlag("TLS policy map attributes JSON"),
    },
  },
  docs: { brief: "Add a TLS policy map entry" },
})

const listCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags) {
    await cliRunApi(this, flags, (config) => tlsPolicyMapList({ config }))
  },
  parameters: { flags: { ...cliConfigFlagParams } },
  docs: { brief: "List TLS policy map entries" },
})

const getCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { id: string }) {
    await cliRunApi(this, flags, (config) => tlsPolicyMapGet({ config, id: flags.id }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      id: cliScalarFlagParams.requiredString("TLS policy map id"),
    },
  },
  docs: { brief: "Get a TLS policy map entry (has upstream trailing-null quirk; prefer list)" },
})

const editCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { itemsJson?: string; attrJson?: string }) {
    const items = tlsItemsParse(flags.itemsJson, "tlsPolicyMapEdit")
    const attrResult = cliJsonParse(flags.attrJson, "tlsPolicyMapEdit", "attrJson")
    if (!attrResult.success) cliFail(attrResult)
    await cliRunApi(this, flags, (config) =>
      tlsPolicyMapEdit({
        config,
        items: items ?? [],
        attr: (attrResult.data ?? {}) as Record<string, string | number>,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      itemsJson: tlsOptionalJsonFlag("JSON array of TLS policy map ids to edit"),
      attrJson: tlsOptionalJsonFlag("TLS policy map attributes JSON"),
    },
  },
  docs: { brief: "Edit TLS policy map entries" },
})

const deleteCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { itemsJson?: string }) {
    const items = tlsItemsParse(flags.itemsJson, "tlsPolicyMapDelete")
    await cliRunApi(this, flags, (config) => tlsPolicyMapDelete({ config, items: items ?? [] }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      itemsJson: tlsOptionalJsonFlag("JSON array of TLS policy map ids to delete"),
    },
  },
  docs: { brief: "Delete TLS policy map entries" },
})

const mtaStsAddCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { domain?: string; attrJson?: string }) {
    const attrResult = cliJsonParse(flags.attrJson, "mtaStsAdd", "attrJson")
    if (!attrResult.success) cliFail(attrResult)
    await cliRunApi(this, flags, (config) =>
      mtaStsAdd({
        config,
        attr: {
          ...((attrResult.data ?? {}) as Partial<MtaStsAddRequest>),
          ...(flags.domain === undefined ? {} : { domain: flags.domain }),
        } as MtaStsAddRequest,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      domain: cliScalarFlagParams.optionalString("Domain (overrides attrJson.domain)"),
      attrJson: tlsOptionalJsonFlag("MTA-STS attributes JSON"),
    },
  },
  docs: { brief: "Add MTA-STS policy for a domain" },
})

const mtaStsEditCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { itemsJson?: string; attrJson?: string }) {
    const parsed = cliJsonParse(flags.itemsJson, "mtaStsEdit", "itemsJson")
    if (!parsed.success) cliFail(parsed)
    const attrResult = cliJsonParse(flags.attrJson, "mtaStsEdit", "attrJson")
    if (!attrResult.success) cliFail(attrResult)
    await cliRunApi(this, flags, (config) =>
      mtaStsEdit({
        config,
        items: (parsed.data ?? []) as string[],
        attr: (attrResult.data ?? {}) as Record<string, string | number>,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      itemsJson: tlsOptionalJsonFlag("JSON array of domains to edit"),
      attrJson: tlsOptionalJsonFlag("MTA-STS attributes JSON"),
    },
  },
  docs: { brief: "Edit MTA-STS policy for domains" },
})

export const tlsCommands = buildRouteMap({
  routes: {
    add: addCommand,
    list: listCommand,
    get: getCommand,
    edit: editCommand,
    delete: deleteCommand,
    "mta-sts-add": mtaStsAddCommand,
    "mta-sts-edit": mtaStsEditCommand,
  },
  docs: { brief: "Manage mailcow TLS policy maps and MTA-STS" },
})
