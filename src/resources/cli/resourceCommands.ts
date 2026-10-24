import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import { cliConfigFlagParams } from "../../cli/cliConfigFlagParams.js"
import type { CliConfigFlags } from "../../cli/cliConfigFlags.js"
import { cliFail } from "../../cli/cliFail.js"
import { cliJsonFlagParam } from "../../cli/cliJsonFlagParam.js"
import { cliJsonParse } from "../../cli/cliJsonParse.js"
import { cliRunApi } from "../../cli/cliRunApi.js"
import { cliScalarFlagParams } from "../../cli/cliScalarFlagParams.js"
import type { ResourceAddRequest } from "../resourceAddRequest.js"
import { resourceAdd } from "../resourceAdd.js"
import { resourceDelete } from "../resourceDelete.js"
import { resourceEdit } from "../resourceEdit.js"
import { resourceGet } from "../resourceGet.js"
import { resourceList } from "../resourceList.js"

function resourceOptionalJsonFlag(brief: string) {
  return cliJsonFlagParam(brief) as { kind: "parsed"; parse: typeof String; optional: true; brief: string }
}

const addCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { domain?: string; kind?: string; description?: string; attrJson?: string },
  ) {
    const attrResult = cliJsonParse(flags.attrJson, "resourceAdd", "attrJson")
    if (!attrResult.success) cliFail(attrResult)
    await cliRunApi(this, flags, (config) =>
      resourceAdd({
        config,
        attr: {
          ...((attrResult.data ?? {}) as Partial<ResourceAddRequest>),
          ...(flags.domain === undefined ? {} : { domain: flags.domain }),
          ...(flags.kind === undefined ? {} : { kind: flags.kind }),
          ...(flags.description === undefined ? {} : { description: flags.description }),
        } as ResourceAddRequest,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      domain: cliScalarFlagParams.optionalString("Domain"),
      kind: cliScalarFlagParams.optionalString("Kind (location, equipment, ...)"),
      description: cliScalarFlagParams.optionalString("Description (server derives the address from it)"),
      attrJson: resourceOptionalJsonFlag("Resource attributes JSON"),
    },
  },
  docs: { brief: "Add a resource" },
})

const listCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags) {
    await cliRunApi(this, flags, (config) => resourceList({ config }))
  },
  parameters: { flags: { ...cliConfigFlagParams } },
  docs: { brief: "List resources" },
})

const getCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { name: string }) {
    await cliRunApi(this, flags, (config) => resourceGet({ config, name: flags.name }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      name: cliScalarFlagParams.requiredString("Resource name"),
    },
  },
  docs: { brief: "Get a resource" },
})

const editCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { itemsJson?: string; attrJson?: string }) {
    const itemsResult = cliJsonParse(flags.itemsJson, "resourceEdit", "itemsJson")
    if (!itemsResult.success) cliFail(itemsResult)
    const attrResult = cliJsonParse(flags.attrJson, "resourceEdit", "attrJson")
    if (!attrResult.success) cliFail(attrResult)
    await cliRunApi(this, flags, (config) =>
      resourceEdit({
        config,
        items: (itemsResult.data ?? []) as (string | number)[],
        attr: (attrResult.data ?? {}) as Record<string, string | number>,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      itemsJson: resourceOptionalJsonFlag("JSON array of resource names to edit"),
      attrJson: resourceOptionalJsonFlag("Resource attributes JSON"),
    },
  },
  docs: { brief: "Edit resources" },
})

const deleteCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { itemsJson?: string }) {
    const itemsResult = cliJsonParse(flags.itemsJson, "resourceDelete", "itemsJson")
    if (!itemsResult.success) cliFail(itemsResult)
    await cliRunApi(this, flags, (config) =>
      resourceDelete({ config, items: (itemsResult.data ?? []) as (string | number)[] }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      itemsJson: resourceOptionalJsonFlag("JSON array of resource names to delete"),
    },
  },
  docs: { brief: "Delete resources" },
})

export const resourceCommands = buildRouteMap({
  routes: {
    add: addCommand,
    list: listCommand,
    get: getCommand,
    edit: editCommand,
    delete: deleteCommand,
  },
  docs: { brief: "Manage mailcow resources" },
})
