import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import { cliConfigFlagParams } from "../../cli/cliConfigFlagParams.js"
import type { CliConfigFlags } from "../../cli/cliConfigFlags.js"
import { cliFail } from "../../cli/cliFail.js"
import { cliJsonFlagParam } from "../../cli/cliJsonFlagParam.js"
import { cliJsonParse } from "../../cli/cliJsonParse.js"
import { cliRunApi } from "../../cli/cliRunApi.js"
import { fail2banBanlistEdit } from "../fail2banBanlistEdit.js"
import { fail2banEdit } from "../fail2banEdit.js"
import { fail2banGet } from "../fail2banGet.js"

function fail2banOptionalJsonFlag(brief: string) {
  return cliJsonFlagParam(brief) as { kind: "parsed"; parse: typeof String; optional: true; brief: string }
}

function fail2banItemsParse(value: string | undefined, op: string): (string | number)[] | undefined {
  const parsed = cliJsonParse(value, op, "itemsJson")
  if (!parsed.success) cliFail(parsed)
  return parsed.data as (string | number)[] | undefined
}

function fail2banAttrParse(value: string | undefined, op: string): Record<string, unknown> {
  const parsed = cliJsonParse(value, op, "attrJson")
  if (!parsed.success) cliFail(parsed)
  return (parsed.data ?? {}) as Record<string, unknown>
}

const getCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags) {
    await cliRunApi(this, flags, (config) => fail2banGet({ config }))
  },
  parameters: { flags: { ...cliConfigFlagParams } },
  docs: { brief: "Show fail2ban rules, lists, and active bans" },
})

const editCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { itemsJson?: string; attrJson?: string }) {
    const items = fail2banItemsParse(flags.itemsJson, "fail2banEdit")
    const attr = fail2banAttrParse(flags.attrJson, "fail2banEdit")
    await cliRunApi(this, flags, (config) =>
      fail2banEdit({
        config,
        items: items ?? [],
        attr: attr as Parameters<typeof fail2banEdit>[0]["attr"],
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      itemsJson: fail2banOptionalJsonFlag("JSON array of networks to edit"),
      attrJson: fail2banOptionalJsonFlag("Fail2ban attributes JSON (ban_time, max_attempts, whitelist, ...)"),
    },
  },
  docs: {
    brief: "Edit fail2ban rules (warning: bans drop ALL traffic from an IP)",
  },
})

const banlistEditCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { itemsJson?: string }) {
    const items = fail2banItemsParse(flags.itemsJson, "fail2banBanlistEdit")
    await cliRunApi(this, flags, (config) => fail2banBanlistEdit({ config, items: items ?? [] }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      itemsJson: fail2banOptionalJsonFlag("JSON array with the banlist id to refresh"),
    },
  },
  docs: { brief: "Refresh the fail2ban banlist by id" },
})

export const fail2banCommands = buildRouteMap({
  routes: {
    get: getCommand,
    edit: editCommand,
    "banlist-edit": banlistEditCommand,
  },
  docs: { brief: "Inspect fail2ban state and bans (bans drop ALL traffic from an IP)" },
})
