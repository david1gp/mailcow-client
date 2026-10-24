import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import { cliConfigFlagParams } from "../../cli/cliConfigFlagParams.js"
import type { CliConfigFlags } from "../../cli/cliConfigFlags.js"
import { cliFail } from "../../cli/cliFail.js"
import { cliJsonFlagParam } from "../../cli/cliJsonFlagParam.js"
import { cliJsonParse } from "../../cli/cliJsonParse.js"
import { cliRunApi } from "../../cli/cliRunApi.js"
import { cliScalarFlagParams } from "../../cli/cliScalarFlagParams.js"
import type { OAuth2ClientAddRequest } from "../oauth2ClientAddRequest.js"
import { oauth2ClientAdd } from "../oauth2ClientAdd.js"
import { oauth2ClientDelete } from "../oauth2ClientDelete.js"
import { oauth2ClientEdit } from "../oauth2ClientEdit.js"
import { oauth2ClientGet } from "../oauth2ClientGet.js"
import { oauth2ClientList } from "../oauth2ClientList.js"

function oauth2OptionalJsonFlag(brief: string) {
  return cliJsonFlagParam(brief) as { kind: "parsed"; parse: typeof String; optional: true; brief: string }
}

function oauth2ItemsParse(value: string | undefined, op: string): (string | number)[] | undefined {
  const parsed = cliJsonParse(value, op, "itemsJson")
  if (!parsed.success) cliFail(parsed)
  return parsed.data as (string | number)[] | undefined
}

function oauth2AttrParse(value: string | undefined, op: string): Record<string, unknown> {
  const parsed = cliJsonParse(value, op, "attrJson")
  if (!parsed.success) cliFail(parsed)
  return (parsed.data ?? {}) as Record<string, unknown>
}

const addCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { redirectUri?: string; attrJson?: string }) {
    const attr = oauth2AttrParse(flags.attrJson, "oauth2ClientAdd")
    await cliRunApi(this, flags, (config) =>
      oauth2ClientAdd({
        config,
        attr: {
          ...attr,
          ...(flags.redirectUri === undefined ? {} : { redirect_uri: flags.redirectUri }),
        } as OAuth2ClientAddRequest,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      redirectUri: cliScalarFlagParams.optionalString("Redirect URI (overrides attrJson.redirect_uri)"),
      attrJson: oauth2OptionalJsonFlag("OAuth2 client attributes JSON"),
    },
  },
  docs: { brief: "Add an OAuth2 client" },
})

const listCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags) {
    await cliRunApi(this, flags, (config) => oauth2ClientList({ config }))
  },
  parameters: { flags: { ...cliConfigFlagParams } },
  docs: { brief: "List OAuth2 clients" },
})

const getCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { id: number }) {
    await cliRunApi(this, flags, (config) => oauth2ClientGet({ config, id: flags.id }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      id: cliScalarFlagParams.requiredNumber("OAuth2 client id"),
    },
  },
  docs: { brief: "Get an OAuth2 client" },
})

const editCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { itemsJson?: string; attrJson?: string }) {
    const items = oauth2ItemsParse(flags.itemsJson, "oauth2ClientEdit")
    const attr = oauth2AttrParse(flags.attrJson, "oauth2ClientEdit")
    await cliRunApi(this, flags, (config) =>
      oauth2ClientEdit({
        config,
        items: items ?? [],
        attr: attr as Record<string, string | number>,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      itemsJson: oauth2OptionalJsonFlag("JSON array of OAuth2 client ids to edit"),
      attrJson: oauth2OptionalJsonFlag("OAuth2 client attributes JSON"),
    },
  },
  docs: { brief: "Edit OAuth2 clients" },
})

const deleteCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { itemsJson?: string }) {
    const items = oauth2ItemsParse(flags.itemsJson, "oauth2ClientDelete")
    await cliRunApi(this, flags, (config) => oauth2ClientDelete({ config, items: items ?? [] }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      itemsJson: oauth2OptionalJsonFlag("JSON array of OAuth2 client ids to delete"),
    },
  },
  docs: { brief: "Delete OAuth2 clients" },
})

export const oauth2ClientCommands = buildRouteMap({
  routes: {
    add: addCommand,
    list: listCommand,
    get: getCommand,
    edit: editCommand,
    delete: deleteCommand,
  },
  docs: { brief: "Manage mailcow OAuth2 clients" },
})
