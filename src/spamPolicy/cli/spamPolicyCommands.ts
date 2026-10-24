import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import { cliConfigFlagParams } from "../../cli/cliConfigFlagParams.js"
import type { CliConfigFlags } from "../../cli/cliConfigFlags.js"
import { cliFail } from "../../cli/cliFail.js"
import { cliJsonFlagParam } from "../../cli/cliJsonFlagParam.js"
import { cliJsonParse } from "../../cli/cliJsonParse.js"
import { cliRunApi } from "../../cli/cliRunApi.js"
import { cliScalarFlagParams } from "../../cli/cliScalarFlagParams.js"
import { domainPolicyAdd } from "../domainPolicyAdd.js"
import type { DomainPolicyAddRequest } from "../domainPolicyAddRequest.js"
import { domainPolicyBlList } from "../domainPolicyBlList.js"
import { domainPolicyDelete } from "../domainPolicyDelete.js"
import { domainPolicyWlList } from "../domainPolicyWlList.js"
import { mailboxPolicyAdd } from "../mailboxPolicyAdd.js"
import type { MailboxPolicyAddRequest } from "../mailboxPolicyAddRequest.js"
import { mailboxPolicyBlList } from "../mailboxPolicyBlList.js"
import { mailboxPolicyDelete } from "../mailboxPolicyDelete.js"
import { mailboxPolicyWlList } from "../mailboxPolicyWlList.js"
import { rspamdActionsGet } from "../rspamdActionsGet.js"
import { rspamdMapEdit } from "../rspamdMapEdit.js"
import { rsettingAdd } from "../rsettingAdd.js"
import type { RsettingAddRequest } from "../rsettingAddRequest.js"
import { rsettingDelete } from "../rsettingDelete.js"
import { rsettingEdit } from "../rsettingEdit.js"
import { rsettingGet } from "../rsettingGet.js"
import { rsettingList } from "../rsettingList.js"

function spamPolicyOptionalJsonFlag(brief: string) {
  return cliJsonFlagParam(brief) as { kind: "parsed"; parse: typeof String; optional: true; brief: string }
}

function spamPolicyItemsParse(value: string | undefined, op: string): (string | number)[] | undefined {
  const parsed = cliJsonParse(value, op, "itemsJson")
  if (!parsed.success) cliFail(parsed)
  return parsed.data as (string | number)[] | undefined
}

function spamPolicyMapItemsParse(value: string | undefined, op: string): string[] | undefined {
  const parsed = cliJsonParse(value, op, "itemsJson")
  if (!parsed.success) cliFail(parsed)
  return parsed.data as string[] | undefined
}

const domainAddCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { domain?: string; objectFrom?: string; objectList?: string },
  ) {
    await cliRunApi(this, flags, (config) =>
      domainPolicyAdd({
        config,
        attr: {
          ...(flags.domain === undefined ? {} : { domain: flags.domain }),
          ...(flags.objectFrom === undefined ? {} : { object_from: flags.objectFrom }),
          ...(flags.objectList === undefined ? {} : { object_list: flags.objectList }),
        } as DomainPolicyAddRequest,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      domain: cliScalarFlagParams.optionalString("Domain the policy entry belongs to"),
      objectFrom: cliScalarFlagParams.optionalString("Sender address or wildcard to whitelist/blacklist"),
      objectList: cliScalarFlagParams.optionalString("Target list: wl (whitelist) or bl (blacklist)"),
    },
  },
  docs: { brief: "Add a domain spam-policy entry" },
})

const mailboxAddCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { mailbox?: string; objectFrom?: string; objectList?: string },
  ) {
    await cliRunApi(this, flags, (config) =>
      mailboxPolicyAdd({
        config,
        attr: {
          ...(flags.mailbox === undefined ? {} : { username: flags.mailbox }),
          ...(flags.objectFrom === undefined ? {} : { object_from: flags.objectFrom }),
          ...(flags.objectList === undefined ? {} : { object_list: flags.objectList }),
        } as MailboxPolicyAddRequest,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      mailbox: cliScalarFlagParams.optionalString("Mailbox the policy entry belongs to"),
      objectFrom: cliScalarFlagParams.optionalString("Sender address or wildcard to whitelist/blacklist"),
      objectList: cliScalarFlagParams.optionalString("Target list: wl (whitelist) or bl (blacklist)"),
    },
  },
  docs: { brief: "Add a mailbox spam-policy entry" },
})

const domainWlListCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { domain: string }) {
    await cliRunApi(this, flags, (config) => domainPolicyWlList({ config, domain: flags.domain }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      domain: cliScalarFlagParams.requiredString("Domain to list whitelist entries for"),
    },
  },
  docs: { brief: "List domain whitelist entries" },
})

const domainBlListCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { domain: string }) {
    await cliRunApi(this, flags, (config) => domainPolicyBlList({ config, domain: flags.domain }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      domain: cliScalarFlagParams.requiredString("Domain to list blacklist entries for"),
    },
  },
  docs: { brief: "List domain blacklist entries" },
})

const mailboxWlListCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { mailbox: string }) {
    await cliRunApi(this, flags, (config) => mailboxPolicyWlList({ config, mailbox: flags.mailbox }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      mailbox: cliScalarFlagParams.requiredString("Mailbox to list whitelist entries for"),
    },
  },
  docs: { brief: "List mailbox whitelist entries" },
})

const mailboxBlListCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { mailbox: string }) {
    await cliRunApi(this, flags, (config) => mailboxPolicyBlList({ config, mailbox: flags.mailbox }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      mailbox: cliScalarFlagParams.requiredString("Mailbox to list blacklist entries for"),
    },
  },
  docs: { brief: "List mailbox blacklist entries" },
})

const domainDeleteCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { itemsJson?: string }) {
    const items = spamPolicyItemsParse(flags.itemsJson, "domainPolicyDelete")
    await cliRunApi(this, flags, (config) => domainPolicyDelete({ config, items: items ?? [] }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      itemsJson: spamPolicyOptionalJsonFlag("JSON array of filterconf prefids to delete"),
    },
  },
  docs: { brief: "Delete domain spam-policy entries" },
})

const mailboxDeleteCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { itemsJson?: string }) {
    const items = spamPolicyItemsParse(flags.itemsJson, "mailboxPolicyDelete")
    await cliRunApi(this, flags, (config) => mailboxPolicyDelete({ config, items: items ?? [] }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      itemsJson: spamPolicyOptionalJsonFlag("JSON array of filterconf prefids to delete"),
    },
  },
  docs: { brief: "Delete mailbox spam-policy entries" },
})

const rspamdActionsCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags) {
    await cliRunApi(this, flags, (config) => rspamdActionsGet({ config }))
  },
  parameters: { flags: { ...cliConfigFlagParams } },
  docs: { brief: "Get rspamd action counters" },
})

const rspamdMapEditCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { itemsJson?: string; rspamdMapData?: string; attrJson?: string },
  ) {
    const items = spamPolicyMapItemsParse(flags.itemsJson, "rspamdMapEdit")
    const attrResult = cliJsonParse(flags.attrJson, "rspamdMapEdit", "attrJson")
    if (!attrResult.success) cliFail(attrResult)
    await cliRunApi(this, flags, (config) =>
      rspamdMapEdit({
        config,
        items: items ?? [],
        attr: {
          ...((attrResult.data ?? {}) as { rspamd_map_data?: string }),
          ...(flags.rspamdMapData === undefined ? {} : { rspamd_map_data: flags.rspamdMapData }),
        } as { rspamd_map_data: string },
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      itemsJson: spamPolicyOptionalJsonFlag("JSON array of rspamd map names to edit"),
      rspamdMapData: cliScalarFlagParams.optionalString("Map content (overrides attrJson.rspamd_map_data)"),
      attrJson: spamPolicyOptionalJsonFlag("Rspamd map attributes JSON"),
    },
  },
  docs: { brief: "Edit rspamd map content" },
})

const rsettingAddCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { content?: string; attrJson?: string }) {
    const attrResult = cliJsonParse(flags.attrJson, "rsettingAdd", "attrJson")
    if (!attrResult.success) cliFail(attrResult)
    await cliRunApi(this, flags, (config) =>
      rsettingAdd({
        config,
        attr: {
          ...((attrResult.data ?? {}) as Partial<RsettingAddRequest>),
          ...(flags.content === undefined ? {} : { content: flags.content }),
        } as RsettingAddRequest,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      content: cliScalarFlagParams.optionalString("Settings content (overrides attrJson.content)"),
      attrJson: spamPolicyOptionalJsonFlag("Rspamd settings attributes JSON"),
    },
  },
  docs: { brief: "Add a rspamd settings record" },
})

const rsettingListCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags) {
    await cliRunApi(this, flags, (config) => rsettingList({ config }))
  },
  parameters: { flags: { ...cliConfigFlagParams } },
  docs: { brief: "List rspamd settings records" },
})

const rsettingGetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { id: string }) {
    await cliRunApi(this, flags, (config) => rsettingGet({ config, id: flags.id }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      id: cliScalarFlagParams.requiredString("Settings record id"),
    },
  },
  docs: { brief: "Get a rspamd settings record" },
})

const rsettingEditCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { itemsJson?: string; attrJson?: string }) {
    const items = spamPolicyItemsParse(flags.itemsJson, "rsettingEdit")
    const attrResult = cliJsonParse(flags.attrJson, "rsettingEdit", "attrJson")
    if (!attrResult.success) cliFail(attrResult)
    await cliRunApi(this, flags, (config) =>
      rsettingEdit({
        config,
        items: items ?? [],
        attr: (attrResult.data ?? {}) as Record<string, string | number>,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      itemsJson: spamPolicyOptionalJsonFlag("JSON array of settings record ids to edit"),
      attrJson: spamPolicyOptionalJsonFlag("Rspamd settings attributes JSON"),
    },
  },
  docs: { brief: "Edit rspamd settings records" },
})

const rsettingDeleteCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { itemsJson?: string }) {
    const items = spamPolicyItemsParse(flags.itemsJson, "rsettingDelete")
    await cliRunApi(this, flags, (config) => rsettingDelete({ config, items: items ?? [] }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      itemsJson: spamPolicyOptionalJsonFlag("JSON array of settings record ids to delete"),
    },
  },
  docs: { brief: "Delete rspamd settings records" },
})

export const spamPolicyCommands = buildRouteMap({
  routes: {
    "domain-add": domainAddCommand,
    "mailbox-add": mailboxAddCommand,
    "domain-wl-list": domainWlListCommand,
    "domain-bl-list": domainBlListCommand,
    "mailbox-wl-list": mailboxWlListCommand,
    "mailbox-bl-list": mailboxBlListCommand,
    "domain-delete": domainDeleteCommand,
    "mailbox-delete": mailboxDeleteCommand,
    "rspamd-actions": rspamdActionsCommand,
    "rspamd-map-edit": rspamdMapEditCommand,
    "rsetting-add": rsettingAddCommand,
    "rsetting-list": rsettingListCommand,
    "rsetting-get": rsettingGetCommand,
    "rsetting-edit": rsettingEditCommand,
    "rsetting-delete": rsettingDeleteCommand,
  },
  docs: { brief: "Manage mailcow spam policy and rspamd settings" },
})
