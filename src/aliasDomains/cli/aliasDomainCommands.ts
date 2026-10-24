import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import { cliConfigFlagParams } from "../../cli/cliConfigFlagParams.js"
import type { CliConfigFlags } from "../../cli/cliConfigFlags.js"
import { cliFail } from "../../cli/cliFail.js"
import { cliJsonFlagParam } from "../../cli/cliJsonFlagParam.js"
import { cliJsonParse } from "../../cli/cliJsonParse.js"
import { cliRunApi } from "../../cli/cliRunApi.js"
import { cliScalarFlagParams } from "../../cli/cliScalarFlagParams.js"
import type { AliasDomainAddRequest } from "../aliasDomainAddRequest.js"
import { aliasDomainAdd } from "../aliasDomainAdd.js"
import { aliasDomainDelete } from "../aliasDomainDelete.js"
import { aliasDomainEdit } from "../aliasDomainEdit.js"
import { aliasDomainGet } from "../aliasDomainGet.js"
import { aliasDomainList } from "../aliasDomainList.js"

function aliasDomainOptionalJsonFlag(brief: string) {
  return cliJsonFlagParam(brief) as { kind: "parsed"; parse: typeof String; optional: true; brief: string }
}

const addCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { aliasDomain?: string; targetDomain?: string; attrJson?: string },
  ) {
    const attrResult = cliJsonParse(flags.attrJson, "aliasDomainAdd", "attrJson")
    if (!attrResult.success) cliFail(attrResult)
    await cliRunApi(this, flags, (config) =>
      aliasDomainAdd({
        config,
        attr: {
          ...((attrResult.data ?? {}) as Partial<AliasDomainAddRequest>),
          ...(flags.aliasDomain === undefined ? {} : { alias_domain: flags.aliasDomain }),
          ...(flags.targetDomain === undefined ? {} : { target_domain: flags.targetDomain }),
        } as AliasDomainAddRequest,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      aliasDomain: cliScalarFlagParams.optionalString("Alias domain"),
      targetDomain: cliScalarFlagParams.optionalString("Target domain"),
      attrJson: aliasDomainOptionalJsonFlag("Alias domain attributes JSON"),
    },
  },
  docs: { brief: "Add an alias domain" },
})

const listCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags) {
    await cliRunApi(this, flags, (config) => aliasDomainList({ config }))
  },
  parameters: { flags: { ...cliConfigFlagParams } },
  docs: { brief: "List alias domains" },
})

const getCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { domain: string }) {
    await cliRunApi(this, flags, (config) => aliasDomainGet({ config, domain: flags.domain }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      domain: cliScalarFlagParams.requiredString("Alias domain"),
    },
  },
  docs: { brief: "Get an alias domain" },
})

const editCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { itemsJson?: string; attrJson?: string }) {
    const itemsResult = cliJsonParse(flags.itemsJson, "aliasDomainEdit", "itemsJson")
    if (!itemsResult.success) cliFail(itemsResult)
    const attrResult = cliJsonParse(flags.attrJson, "aliasDomainEdit", "attrJson")
    if (!attrResult.success) cliFail(attrResult)
    await cliRunApi(this, flags, (config) =>
      aliasDomainEdit({
        config,
        items: (itemsResult.data ?? []) as (string | number)[],
        attr: (attrResult.data ?? {}) as Record<string, string | number>,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      itemsJson: aliasDomainOptionalJsonFlag("JSON array of alias domains to edit"),
      attrJson: aliasDomainOptionalJsonFlag("Alias domain attributes JSON"),
    },
  },
  docs: { brief: "Edit alias domains" },
})

const deleteCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { itemsJson?: string }) {
    const itemsResult = cliJsonParse(flags.itemsJson, "aliasDomainDelete", "itemsJson")
    if (!itemsResult.success) cliFail(itemsResult)
    await cliRunApi(this, flags, (config) =>
      aliasDomainDelete({ config, items: (itemsResult.data ?? []) as (string | number)[] }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      itemsJson: aliasDomainOptionalJsonFlag("JSON array of alias domains to delete"),
    },
  },
  docs: { brief: "Delete alias domains" },
})

export const aliasDomainCommands = buildRouteMap({
  routes: {
    add: addCommand,
    list: listCommand,
    get: getCommand,
    edit: editCommand,
    delete: deleteCommand,
  },
  docs: { brief: "Manage mailcow alias domains" },
})
