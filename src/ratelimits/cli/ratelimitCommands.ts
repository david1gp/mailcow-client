import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import { cliConfigFlagParams } from "../../cli/cliConfigFlagParams.js"
import type { CliConfigFlags } from "../../cli/cliConfigFlags.js"
import { cliFail } from "../../cli/cliFail.js"
import { cliJsonFlagParam } from "../../cli/cliJsonFlagParam.js"
import { cliJsonParse } from "../../cli/cliJsonParse.js"
import { cliRunApi } from "../../cli/cliRunApi.js"
import { cliScalarFlagParams } from "../../cli/cliScalarFlagParams.js"
import { ratelimitDomainEdit } from "../ratelimitDomainEdit.js"
import { ratelimitDomainGet } from "../ratelimitDomainGet.js"
import { ratelimitDomainList } from "../ratelimitDomainList.js"
import { ratelimitHashDelete } from "../ratelimitHashDelete.js"
import { ratelimitMailboxEdit } from "../ratelimitMailboxEdit.js"
import { ratelimitMailboxGet } from "../ratelimitMailboxGet.js"
import { ratelimitMailboxList } from "../ratelimitMailboxList.js"

function ratelimitOptionalJsonFlag(brief: string) {
  return cliJsonFlagParam(brief) as { kind: "parsed"; parse: typeof String; optional: true; brief: string }
}

function ratelimitItemsParse(value: string | undefined, op: string): (string | number)[] | undefined {
  const parsed = cliJsonParse(value, op, "itemsJson")
  if (!parsed.success) cliFail(parsed)
  return parsed.data as (string | number)[] | undefined
}

function ratelimitAttrParse(value: string | undefined, op: string): Record<string, unknown> {
  const parsed = cliJsonParse(value, op, "attrJson")
  if (!parsed.success) cliFail(parsed)
  return (parsed.data ?? {}) as Record<string, unknown>
}

const domainListCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags) {
    await cliRunApi(this, flags, (config) => ratelimitDomainList({ config }))
  },
  parameters: { flags: { ...cliConfigFlagParams } },
  docs: { brief: "List domain ratelimit rules" },
})

const domainGetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { domain: string }) {
    await cliRunApi(this, flags, (config) => ratelimitDomainGet({ config, domain: flags.domain }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      domain: cliScalarFlagParams.requiredString("Domain to get the ratelimit rule for"),
    },
  },
  docs: { brief: "Get a domain ratelimit rule" },
})

const domainEditCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { itemsJson?: string; attrJson?: string }) {
    const items = ratelimitItemsParse(flags.itemsJson, "ratelimitDomainEdit")
    const attr = ratelimitAttrParse(flags.attrJson, "ratelimitDomainEdit")
    await cliRunApi(this, flags, (config) =>
      ratelimitDomainEdit({
        config,
        items: items ?? [],
        attr: attr as { rl_value?: string | number; rl_frame?: "s" | "m" | "h" | "d" },
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      itemsJson: ratelimitOptionalJsonFlag("JSON array of domains to edit"),
      attrJson: ratelimitOptionalJsonFlag("Ratelimit attributes JSON (rl_value, rl_frame s/m/h/d)"),
    },
  },
  docs: { brief: "Edit domain ratelimit rules" },
})

const mailboxListCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags) {
    await cliRunApi(this, flags, (config) => ratelimitMailboxList({ config }))
  },
  parameters: { flags: { ...cliConfigFlagParams } },
  docs: { brief: "List mailbox ratelimit rules" },
})

const mailboxGetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { mailbox: string }) {
    await cliRunApi(this, flags, (config) => ratelimitMailboxGet({ config, mailbox: flags.mailbox }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      mailbox: cliScalarFlagParams.requiredString("Mailbox to get the ratelimit rule for"),
    },
  },
  docs: { brief: "Get a mailbox ratelimit rule" },
})

const mailboxEditCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { itemsJson?: string; attrJson?: string }) {
    const items = ratelimitItemsParse(flags.itemsJson, "ratelimitMailboxEdit")
    const attr = ratelimitAttrParse(flags.attrJson, "ratelimitMailboxEdit")
    await cliRunApi(this, flags, (config) =>
      ratelimitMailboxEdit({
        config,
        items: items ?? [],
        attr: attr as { rl_value?: string | number; rl_frame?: "s" | "m" | "h" | "d" },
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      itemsJson: ratelimitOptionalJsonFlag("JSON array of mailboxes to edit"),
      attrJson: ratelimitOptionalJsonFlag("Ratelimit attributes JSON (rl_value, rl_frame s/m/h/d)"),
    },
  },
  docs: { brief: "Edit mailbox ratelimit rules" },
})

const hashDeleteCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { itemsJson?: string }) {
    const items = ratelimitItemsParse(flags.itemsJson, "ratelimitHashDelete")
    await cliRunApi(this, flags, (config) => ratelimitHashDelete({ config, items: (items ?? []) as string[] }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      itemsJson: ratelimitOptionalJsonFlag("JSON array of RL hash strings to delete"),
    },
  },
  docs: { brief: "Delete ratelimit hashes by RL string" },
})

export const ratelimitCommands = buildRouteMap({
  routes: {
    "domain-list": domainListCommand,
    "domain-get": domainGetCommand,
    "domain-edit": domainEditCommand,
    "mailbox-list": mailboxListCommand,
    "mailbox-get": mailboxGetCommand,
    "mailbox-edit": mailboxEditCommand,
    "hash-delete": hashDeleteCommand,
  },
  docs: { brief: "Inspect and manage ratelimit rules" },
})
