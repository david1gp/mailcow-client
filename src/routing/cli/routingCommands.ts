import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import { cliConfigFlagParams } from "../../cli/cliConfigFlagParams.js"
import type { CliConfigFlags } from "../../cli/cliConfigFlags.js"
import { cliFail } from "../../cli/cliFail.js"
import { cliJsonFlagParam } from "../../cli/cliJsonFlagParam.js"
import { cliJsonParse } from "../../cli/cliJsonParse.js"
import { cliRunApi } from "../../cli/cliRunApi.js"
import { cliScalarFlagParams } from "../../cli/cliScalarFlagParams.js"
import { bccAdd } from "../bccAdd.js"
import type { BccAddRequest } from "../bccAddRequest.js"
import { bccDelete } from "../bccDelete.js"
import { bccEdit } from "../bccEdit.js"
import { bccGet } from "../bccGet.js"
import { bccList } from "../bccList.js"
import { fwdhostAdd } from "../fwdhostAdd.js"
import type { FwdhostAddRequest } from "../fwdhostAddRequest.js"
import { fwdhostDelete } from "../fwdhostDelete.js"
import { fwdhostEdit } from "../fwdhostEdit.js"
import { fwdhostGet } from "../fwdhostGet.js"
import { fwdhostList } from "../fwdhostList.js"
import { recipientMapAdd } from "../recipientMapAdd.js"
import type { RecipientMapAddRequest } from "../recipientMapAddRequest.js"
import { recipientMapDelete } from "../recipientMapDelete.js"
import { recipientMapEdit } from "../recipientMapEdit.js"
import { recipientMapGet } from "../recipientMapGet.js"
import { recipientMapList } from "../recipientMapList.js"
import { relayhostAdd } from "../relayhostAdd.js"
import type { RelayhostAddRequest } from "../relayhostAddRequest.js"
import { relayhostDelete } from "../relayhostDelete.js"
import { relayhostEdit } from "../relayhostEdit.js"
import { relayhostGet } from "../relayhostGet.js"
import { relayhostList } from "../relayhostList.js"
import { transportAdd } from "../transportAdd.js"
import type { TransportAddRequest } from "../transportAddRequest.js"
import { transportDelete } from "../transportDelete.js"
import { transportEdit } from "../transportEdit.js"
import { transportGet } from "../transportGet.js"
import { transportList } from "../transportList.js"

function routingOptionalJsonFlag(brief: string) {
  return cliJsonFlagParam(brief) as { kind: "parsed"; parse: typeof String; optional: true; brief: string }
}

function routingItemsParse(value: string | undefined, op: string): (string | number)[] | undefined {
  const parsed = cliJsonParse(value, op, "itemsJson")
  if (!parsed.success) cliFail(parsed)
  return parsed.data as (string | number)[] | undefined
}

function routingHostItemsParse(value: string | undefined, op: string): string[] | undefined {
  const parsed = cliJsonParse(value, op, "itemsJson")
  if (!parsed.success) cliFail(parsed)
  return parsed.data as string[] | undefined
}

function routingAttrParse(value: string | undefined, op: string): Record<string, string | number | string[]> {
  const parsed = cliJsonParse(value, op, "attrJson")
  if (!parsed.success) cliFail(parsed)
  return (parsed.data ?? {}) as Record<string, string | number | string[]>
}

const relayhostAddCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { hostname?: string; attrJson?: string }) {
    const attr = routingAttrParse(flags.attrJson, "relayhostAdd")
    await cliRunApi(this, flags, (config) =>
      relayhostAdd({
        config,
        attr: {
          ...attr,
          ...(flags.hostname === undefined ? {} : { hostname: flags.hostname }),
        } as RelayhostAddRequest,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      hostname: cliScalarFlagParams.optionalString("Relay hostname host:port (overrides attrJson.hostname)"),
      attrJson: routingOptionalJsonFlag("Relayhost attributes JSON"),
    },
  },
  docs: { brief: "Add a relayhost" },
})

const relayhostListCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags) {
    await cliRunApi(this, flags, (config) => relayhostList({ config }))
  },
  parameters: { flags: { ...cliConfigFlagParams } },
  docs: { brief: "List relayhosts" },
})

const relayhostGetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { id: string }) {
    await cliRunApi(this, flags, (config) => relayhostGet({ config, id: flags.id }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      id: cliScalarFlagParams.requiredString("Relayhost id"),
    },
  },
  docs: { brief: "Get a relayhost" },
})

const relayhostEditCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { itemsJson?: string; attrJson?: string }) {
    const items = routingItemsParse(flags.itemsJson, "relayhostEdit")
    await cliRunApi(this, flags, (config) =>
      relayhostEdit({ config, items: items ?? [], attr: routingAttrParse(flags.attrJson, "relayhostEdit") }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      itemsJson: routingOptionalJsonFlag("JSON array of relayhost ids to edit"),
      attrJson: routingOptionalJsonFlag("Relayhost attributes JSON"),
    },
  },
  docs: { brief: "Edit relayhosts" },
})

const relayhostDeleteCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { itemsJson?: string }) {
    const items = routingItemsParse(flags.itemsJson, "relayhostDelete")
    await cliRunApi(this, flags, (config) => relayhostDelete({ config, items: items ?? [] }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      itemsJson: routingOptionalJsonFlag("JSON array of relayhost ids to delete"),
    },
  },
  docs: { brief: "Delete relayhosts" },
})

const transportAddCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { destination?: string; nexthop?: string; attrJson?: string },
  ) {
    const attr = routingAttrParse(flags.attrJson, "transportAdd")
    await cliRunApi(this, flags, (config) =>
      transportAdd({
        config,
        attr: {
          ...attr,
          ...(flags.destination === undefined ? {} : { destination: flags.destination }),
          ...(flags.nexthop === undefined ? {} : { nexthop: flags.nexthop }),
        } as TransportAddRequest,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      destination: cliScalarFlagParams.optionalString("Destination (overrides attrJson.destination)"),
      nexthop: cliScalarFlagParams.optionalString("Nexthop (overrides attrJson.nexthop)"),
      attrJson: routingOptionalJsonFlag("Transport attributes JSON"),
    },
  },
  docs: { brief: "Add a transport map entry" },
})

const transportListCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags) {
    await cliRunApi(this, flags, (config) => transportList({ config }))
  },
  parameters: { flags: { ...cliConfigFlagParams } },
  docs: { brief: "List transport map entries" },
})

const transportGetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { id: string }) {
    await cliRunApi(this, flags, (config) => transportGet({ config, id: flags.id }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      id: cliScalarFlagParams.requiredString("Transport map entry id"),
    },
  },
  docs: { brief: "Get a transport map entry" },
})

const transportEditCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { itemsJson?: string; attrJson?: string }) {
    const items = routingItemsParse(flags.itemsJson, "transportEdit")
    await cliRunApi(this, flags, (config) =>
      transportEdit({ config, items: items ?? [], attr: routingAttrParse(flags.attrJson, "transportEdit") }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      itemsJson: routingOptionalJsonFlag("JSON array of transport map entry ids to edit"),
      attrJson: routingOptionalJsonFlag("Transport attributes JSON"),
    },
  },
  docs: { brief: "Edit transport map entries" },
})

const transportDeleteCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { itemsJson?: string }) {
    const items = routingItemsParse(flags.itemsJson, "transportDelete")
    await cliRunApi(this, flags, (config) => transportDelete({ config, items: items ?? [] }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      itemsJson: routingOptionalJsonFlag("JSON array of transport map entry ids to delete"),
    },
  },
  docs: { brief: "Delete transport map entries" },
})

const recipientMapAddCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { old?: string; new?: string; attrJson?: string }) {
    const attr = routingAttrParse(flags.attrJson, "recipientMapAdd")
    await cliRunApi(this, flags, (config) =>
      recipientMapAdd({
        config,
        attr: {
          ...attr,
          ...(flags.old === undefined ? {} : { recipient_map_old: flags.old }),
          ...(flags.new === undefined ? {} : { recipient_map_new: flags.new }),
        } as RecipientMapAddRequest,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      old: cliScalarFlagParams.optionalString("Old recipient address (overrides attrJson.recipient_map_old)"),
      new: cliScalarFlagParams.optionalString("New recipient address (overrides attrJson.recipient_map_new)"),
      attrJson: routingOptionalJsonFlag("Recipient map attributes JSON"),
    },
  },
  docs: { brief: "Add a recipient map entry" },
})

const recipientMapListCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags) {
    await cliRunApi(this, flags, (config) => recipientMapList({ config }))
  },
  parameters: { flags: { ...cliConfigFlagParams } },
  docs: { brief: "List recipient map entries" },
})

const recipientMapGetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { id: string }) {
    await cliRunApi(this, flags, (config) => recipientMapGet({ config, id: flags.id }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      id: cliScalarFlagParams.requiredString("Recipient map entry id"),
    },
  },
  docs: { brief: "Get a recipient map entry (has upstream trailing-null quirk; prefer list)" },
})

const recipientMapEditCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { itemsJson?: string; attrJson?: string }) {
    const items = routingItemsParse(flags.itemsJson, "recipientMapEdit")
    await cliRunApi(this, flags, (config) =>
      recipientMapEdit({ config, items: items ?? [], attr: routingAttrParse(flags.attrJson, "recipientMapEdit") }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      itemsJson: routingOptionalJsonFlag("JSON array of recipient map entry ids to edit"),
      attrJson: routingOptionalJsonFlag("Recipient map attributes JSON"),
    },
  },
  docs: { brief: "Edit recipient map entries" },
})

const recipientMapDeleteCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { itemsJson?: string }) {
    const items = routingItemsParse(flags.itemsJson, "recipientMapDelete")
    await cliRunApi(this, flags, (config) => recipientMapDelete({ config, items: items ?? [] }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      itemsJson: routingOptionalJsonFlag("JSON array of recipient map entry ids to delete"),
    },
  },
  docs: { brief: "Delete recipient map entries" },
})

const bccAddCommand = buildCommand({
  async func(
    this: CommandContext,
    flags: CliConfigFlags & { type?: string; localDest?: string; bccDest?: string; attrJson?: string },
  ) {
    const attr = routingAttrParse(flags.attrJson, "bccAdd")
    await cliRunApi(this, flags, (config) =>
      bccAdd({
        config,
        attr: {
          ...attr,
          ...(flags.type === undefined ? {} : { type: flags.type }),
          ...(flags.localDest === undefined ? {} : { local_dest: flags.localDest }),
          ...(flags.bccDest === undefined ? {} : { bcc_dest: flags.bccDest }),
        } as BccAddRequest,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      type: cliScalarFlagParams.optionalString("Map type: sender or rcpt (overrides attrJson.type)"),
      localDest: cliScalarFlagParams.optionalString("Local destination (overrides attrJson.local_dest)"),
      bccDest: cliScalarFlagParams.optionalString("BCC destination (overrides attrJson.bcc_dest)"),
      attrJson: routingOptionalJsonFlag("BCC map attributes JSON"),
    },
  },
  docs: { brief: "Add a BCC map entry" },
})

const bccListCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags) {
    await cliRunApi(this, flags, (config) => bccList({ config }))
  },
  parameters: { flags: { ...cliConfigFlagParams } },
  docs: { brief: "List BCC map entries" },
})

const bccGetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { id: string }) {
    await cliRunApi(this, flags, (config) => bccGet({ config, id: flags.id }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      id: cliScalarFlagParams.requiredString("BCC map entry id"),
    },
  },
  docs: { brief: "Get a BCC map entry (has upstream trailing-null quirk; prefer list)" },
})

const bccEditCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { itemsJson?: string; attrJson?: string }) {
    const items = routingItemsParse(flags.itemsJson, "bccEdit")
    await cliRunApi(this, flags, (config) =>
      bccEdit({ config, items: items ?? [], attr: routingAttrParse(flags.attrJson, "bccEdit") }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      itemsJson: routingOptionalJsonFlag("JSON array of BCC map entry ids to edit"),
      attrJson: routingOptionalJsonFlag("BCC map attributes JSON"),
    },
  },
  docs: { brief: "Edit BCC map entries" },
})

const bccDeleteCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { itemsJson?: string }) {
    const items = routingItemsParse(flags.itemsJson, "bccDelete")
    await cliRunApi(this, flags, (config) => bccDelete({ config, items: items ?? [] }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      itemsJson: routingOptionalJsonFlag("JSON array of BCC map entry ids to delete"),
    },
  },
  docs: { brief: "Delete BCC map entries" },
})

const fwdhostAddCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { hostname?: string; attrJson?: string }) {
    const attr = routingAttrParse(flags.attrJson, "fwdhostAdd")
    await cliRunApi(this, flags, (config) =>
      fwdhostAdd({
        config,
        attr: {
          ...attr,
          ...(flags.hostname === undefined ? {} : { hostname: flags.hostname }),
        } as FwdhostAddRequest,
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      hostname: cliScalarFlagParams.optionalString("Forwarding hostname (overrides attrJson.hostname)"),
      attrJson: routingOptionalJsonFlag("Forwarding host attributes JSON"),
    },
  },
  docs: { brief: "Add a forwarding host" },
})

const fwdhostListCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags) {
    await cliRunApi(this, flags, (config) => fwdhostList({ config }))
  },
  parameters: { flags: { ...cliConfigFlagParams } },
  docs: { brief: "List forwarding hosts" },
})

const fwdhostGetCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { hostname: string }) {
    await cliRunApi(this, flags, (config) => fwdhostGet({ config, hostname: flags.hostname }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      hostname: cliScalarFlagParams.requiredString("Forwarding hostname"),
    },
  },
  docs: { brief: "Get a forwarding host" },
})

const fwdhostEditCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { itemsJson?: string; attrJson?: string }) {
    const items = routingHostItemsParse(flags.itemsJson, "fwdhostEdit")
    await cliRunApi(this, flags, (config) =>
      fwdhostEdit({ config, items: items ?? [], attr: routingAttrParse(flags.attrJson, "fwdhostEdit") }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      itemsJson: routingOptionalJsonFlag("JSON array of forwarding hostnames to edit"),
      attrJson: routingOptionalJsonFlag("Forwarding host attributes JSON"),
    },
  },
  docs: { brief: "Edit forwarding hosts" },
})

const fwdhostDeleteCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { itemsJson?: string }) {
    const items = routingHostItemsParse(flags.itemsJson, "fwdhostDelete")
    await cliRunApi(this, flags, (config) => fwdhostDelete({ config, items: items ?? [] }))
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      itemsJson: routingOptionalJsonFlag("JSON array of forwarding hostnames to delete"),
    },
  },
  docs: { brief: "Delete forwarding hosts" },
})

export const routingCommands = buildRouteMap({
  routes: {
    "relayhost-add": relayhostAddCommand,
    "relayhost-list": relayhostListCommand,
    "relayhost-get": relayhostGetCommand,
    "relayhost-edit": relayhostEditCommand,
    "relayhost-delete": relayhostDeleteCommand,
    "transport-add": transportAddCommand,
    "transport-list": transportListCommand,
    "transport-get": transportGetCommand,
    "transport-edit": transportEditCommand,
    "transport-delete": transportDeleteCommand,
    "recipient-map-add": recipientMapAddCommand,
    "recipient-map-list": recipientMapListCommand,
    "recipient-map-get": recipientMapGetCommand,
    "recipient-map-edit": recipientMapEditCommand,
    "recipient-map-delete": recipientMapDeleteCommand,
    "bcc-add": bccAddCommand,
    "bcc-list": bccListCommand,
    "bcc-get": bccGetCommand,
    "bcc-edit": bccEditCommand,
    "bcc-delete": bccDeleteCommand,
    "fwdhost-add": fwdhostAddCommand,
    "fwdhost-list": fwdhostListCommand,
    "fwdhost-get": fwdhostGetCommand,
    "fwdhost-edit": fwdhostEditCommand,
    "fwdhost-delete": fwdhostDeleteCommand,
  },
  docs: { brief: "Manage mailcow routing and address rewriting" },
})
