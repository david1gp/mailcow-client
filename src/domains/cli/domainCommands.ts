import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import { cliConfigFlagParams } from "../../cli/cliConfigFlagParams.js"
import type { CliConfigFlags } from "../../cli/cliConfigFlags.js"
import { cliFail } from "../../cli/cliFail.js"
import { cliJsonFlagParam } from "../../cli/cliJsonFlagParam.js"
import { cliJsonParse } from "../../cli/cliJsonParse.js"
import { cliRunApi } from "../../cli/cliRunApi.js"
import { cliScalarFlagParams } from "../../cli/cliScalarFlagParams.js"
import type { DomainAddRequest } from "../domainAddRequest.js"
import { domainAdd } from "../domainAdd.js"
import { domainDelete } from "../domainDelete.js"
import { domainEdit } from "../domainEdit.js"
import { domainFooterEdit } from "../domainFooterEdit.js"
import { domainGet } from "../domainGet.js"
import { domainList } from "../domainList.js"
import { domainSearch } from "../domainSearch.js"
import { domainTagDelete } from "../domainTagDelete.js"
import type { DomainTemplateAddRequest } from "../domainTemplateAddRequest.js"
import { domainTemplateAdd } from "../domainTemplateAdd.js"
import { domainTemplateDelete } from "../domainTemplateDelete.js"
import { domainTemplateEdit } from "../domainTemplateEdit.js"
import { domainTemplateGet } from "../domainTemplateGet.js"
import { domainTemplateList } from "../domainTemplateList.js"

function domainOptionalJsonFlag(brief: string) {
  return cliJsonFlagParam(brief) as { kind: "parsed"; parse: typeof String; optional: true; brief: string }
}

function domainItemsParse(value: string | undefined, op: string): (string | number)[] | undefined {
  const parsed = cliJsonParse(value, op, "itemsJson")
  if (!parsed.success) cliFail(parsed)
  return parsed.data as (string | number)[] | undefined
}

const addCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { domain?: string; attrJson?: string }) {
    const attrResult = cliJsonParse(flags.attrJson, "domainAdd", "attrJson")
    if (!attrResult.success) cliFail(attrResult)
    await cliRunApi(this, flags, (config) =>
      domainAdd({
        config,
        attr: {
          ...((attrResult.data ?? {}) as Partial<DomainAddRequest>),
          ...(flags.domain === undefined ? {} : { domain: flags.domain }),
        } as DomainAddRequest,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      domain: cliScalarFlagParams.optionalString("Domain FQDN (overrides attrJson.domain)"),
      attrJson: domainOptionalJsonFlag("Domain attributes JSON"),
    },
  },
  docs: { brief: "Add a domain" },
})

const templateAddCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { template?: string; attrJson?: string }) {
    const attrResult = cliJsonParse(flags.attrJson, "domainTemplateAdd", "attrJson")
    if (!attrResult.success) cliFail(attrResult)
    await cliRunApi(this, flags, (config) =>
      domainTemplateAdd({
        config,
        attr: {
          ...((attrResult.data ?? {}) as Partial<DomainTemplateAddRequest>),
          ...(flags.template === undefined ? {} : { template: flags.template }),
        } as DomainTemplateAddRequest,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      template: cliScalarFlagParams.optionalString("Template name (overrides attrJson.template)"),
      attrJson: domainOptionalJsonFlag("Template attributes JSON"),
    },
  },
  docs: { brief: "Add a domain template" },
})

const listCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { tags?: string[] }) {
    await cliRunApi(this, flags, (config) => domainList({ config, tags: flags.tags }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      tags: cliScalarFlagParams.optionalStringList("Filter by tags (comma-separated)"),
    },
  },
  docs: { brief: "List domains" },
})

const templateListCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags) {
    await cliRunApi(this, flags, (config) => domainTemplateList({ config }))
  },
  parameters: { flags: { ...cliConfigFlagParams } },
  docs: { brief: "List domain templates" },
})

const templateGetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { id: string }) {
    await cliRunApi(this, flags, (config) => domainTemplateGet({ config, id: flags.id }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      id: cliScalarFlagParams.requiredString("Template id"),
    },
  },
  docs: { brief: "Get a domain template" },
})

const getCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { domain: string }) {
    await cliRunApi(this, flags, (config) => domainGet({ config, domain: flags.domain }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      domain: cliScalarFlagParams.requiredString("Domain FQDN"),
    },
  },
  docs: { brief: "Get a domain" },
})

const editCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { itemsJson?: string; attrJson?: string }) {
    const items = domainItemsParse(flags.itemsJson, "domainEdit")
    const attrResult = cliJsonParse(flags.attrJson, "domainEdit", "attrJson")
    if (!attrResult.success) cliFail(attrResult)
    await cliRunApi(this, flags, (config) =>
      domainEdit({
        config,
        items: items ?? [],
        attr: (attrResult.data ?? {}) as Record<string, string | number | string[]>,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      itemsJson: domainOptionalJsonFlag("JSON array of domains to edit"),
      attrJson: domainOptionalJsonFlag("Domain attributes JSON"),
    },
  },
  docs: { brief: "Edit domains" },
})

const templateEditCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { itemsJson?: string; attrJson?: string }) {
    const items = domainItemsParse(flags.itemsJson, "domainTemplateEdit")
    const attrResult = cliJsonParse(flags.attrJson, "domainTemplateEdit", "attrJson")
    if (!attrResult.success) cliFail(attrResult)
    await cliRunApi(this, flags, (config) =>
      domainTemplateEdit({
        config,
        items: items ?? [],
        attr: (attrResult.data ?? {}) as Record<string, string | number | string[]>,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      itemsJson: domainOptionalJsonFlag("JSON array of template ids to edit"),
      attrJson: domainOptionalJsonFlag("Template attributes JSON"),
    },
  },
  docs: { brief: "Edit domain templates" },
})

const footerEditCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { itemsJson?: string; attrJson?: string }) {
    const items = domainItemsParse(flags.itemsJson, "domainFooterEdit")
    const attrResult = cliJsonParse(flags.attrJson, "domainFooterEdit", "attrJson")
    if (!attrResult.success) cliFail(attrResult)
    await cliRunApi(this, flags, (config) =>
      domainFooterEdit({
        config,
        items: items ?? [],
        attr: (attrResult.data ?? {}) as Record<string, string>,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      itemsJson: domainOptionalJsonFlag("JSON array of domains to edit"),
      attrJson: domainOptionalJsonFlag("Footer attributes JSON (html, plain, ...)"),
    },
  },
  docs: { brief: "Edit domain footers" },
})

const deleteCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { itemsJson?: string }) {
    const items = domainItemsParse(flags.itemsJson, "domainDelete")
    await cliRunApi(this, flags, (config) => domainDelete({ config, items: items ?? [] }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      itemsJson: domainOptionalJsonFlag("JSON array of domains to delete"),
    },
  },
  docs: { brief: "Delete domains" },
})

const templateDeleteCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { itemsJson?: string }) {
    const items = domainItemsParse(flags.itemsJson, "domainTemplateDelete")
    await cliRunApi(this, flags, (config) => domainTemplateDelete({ config, items: items ?? [] }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      itemsJson: domainOptionalJsonFlag("JSON array of template ids to delete"),
    },
  },
  docs: { brief: "Delete domain templates" },
})

const tagDeleteCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { domain: string; itemsJson?: string }) {
    const itemsResult = cliJsonParse(flags.itemsJson, "domainTagDelete", "itemsJson")
    if (!itemsResult.success) cliFail(itemsResult)
    await cliRunApi(this, flags, (config) =>
      domainTagDelete({ config, domain: flags.domain, items: (itemsResult.data ?? []) as string[] }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      domain: cliScalarFlagParams.requiredString("Domain FQDN"),
      itemsJson: domainOptionalJsonFlag("JSON array of tag names to delete"),
    },
  },
  docs: { brief: "Delete domain tags" },
})

const searchCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { draw?: number; start?: number; length?: number; searchValue?: string },
  ) {
    await cliRunApi(this, flags, (config) =>
      domainSearch({
        config,
        draw: flags.draw,
        start: flags.start,
        length: flags.length,
        search: flags.searchValue === undefined ? undefined : { value: flags.searchValue },
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      draw: cliScalarFlagParams.optionalNumber("DataTables draw counter"),
      start: cliScalarFlagParams.optionalNumber("Paging start offset"),
      length: cliScalarFlagParams.optionalNumber("Page length"),
      searchValue: cliScalarFlagParams.optionalString("Global search value"),
    },
  },
  docs: { brief: "Search domains (DataTables)" },
})

export const domainCommands = buildRouteMap({
  routes: {
    add: addCommand,
    "template-add": templateAddCommand,
    list: listCommand,
    "template-list": templateListCommand,
    "template-get": templateGetCommand,
    get: getCommand,
    edit: editCommand,
    "template-edit": templateEditCommand,
    "footer-edit": footerEditCommand,
    delete: deleteCommand,
    "template-delete": templateDeleteCommand,
    "tag-delete": tagDeleteCommand,
    search: searchCommand,
  },
  docs: { brief: "Manage mailcow domains" },
})
