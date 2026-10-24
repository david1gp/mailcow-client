import { buildCommand, buildRouteMap, type CommandContext } from "@stricli/core"
import { cliBinaryOutput } from "../../cli/cliBinaryOutput.js"
import { cliBinaryOutputFlagParams } from "../../cli/cliBinaryOutputFlagParams.js"
import { cliConfigFlagParams } from "../../cli/cliConfigFlagParams.js"
import type { CliConfigFlags } from "../../cli/cliConfigFlags.js"
import { cliConfigLoad } from "../../cli/cliConfigLoad.js"
import { cliFail } from "../../cli/cliFail.js"
import { cliJsonFlagParam } from "../../cli/cliJsonFlagParam.js"
import { cliJsonParse } from "../../cli/cliJsonParse.js"
import { cliRunApi } from "../../cli/cliRunApi.js"
import { cliScalarFlagParams } from "../../cli/cliScalarFlagParams.js"
import { cliWriteJson } from "../../cli/cliWriteJson.js"
import { mailqDelete } from "../mailqDelete.js"
import { mailqEdit } from "../mailqEdit.js"
import { mailqList } from "../mailqList.js"
import { postcatGet } from "../postcatGet.js"

function queueOptionalJsonFlag(brief: string) {
  return cliJsonFlagParam(brief) as { kind: "parsed"; parse: typeof String; optional: true; brief: string }
}

function queueItemsParse(value: string | undefined, op: string): (string | number)[] | undefined {
  const parsed = cliJsonParse(value, op, "itemsJson")
  if (!parsed.success) cliFail(parsed)
  return parsed.data as (string | number)[] | undefined
}

const listCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags) {
    await cliRunApi(this, flags, (config) => mailqList({ config }))
  },
  parameters: { flags: { ...cliConfigFlagParams } },
  docs: { brief: "List Postfix queue entries" },
})

const postcatCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { qid: string; output?: string }) {
    const configResult = cliConfigLoad(flags)
    if (!configResult.success) cliFail(configResult)
    const result = await postcatGet({ config: configResult.data, qid: flags.qid })
    if (!result.success) cliFail(result)
    const output = await cliBinaryOutput(result.data as Uint8Array, flags.output)
    if (!output.success) cliFail(output)
    if (output.data !== undefined) cliWriteJson(this, output.data)
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      qid: cliScalarFlagParams.requiredString("Queue id to dump"),
      ...cliBinaryOutputFlagParams,
    },
  },
  docs: { brief: "Dump raw bytes of a queued message" },
})

const editCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { action?: string; itemsJson?: string }) {
    const items = queueItemsParse(flags.itemsJson, "mailqEdit")
    await cliRunApi(this, flags, (config) =>
      mailqEdit({
        config,
        items: items ?? [],
        attr: {
          ...(flags.action === undefined ? {} : { action: flags.action }),
        } as { action: "hold" | "unhold" | "deliver" | "flush" },
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      action: cliScalarFlagParams.optionalString("Queue action: hold, unhold, deliver, or flush"),
      itemsJson: queueOptionalJsonFlag("JSON array of queue ids (may be empty for flush)"),
    },
  },
  docs: { brief: "Hold, unhold, deliver, or flush queued mail" },
})

const deleteCommand = buildCommand({
  async func(this: CommandContext, flags: CliConfigFlags & { superDelete?: boolean; itemsJson?: string }) {
    const items = queueItemsParse(flags.itemsJson, "mailqDelete")
    await cliRunApi(this, flags, (config) =>
      mailqDelete({
        config,
        ...(flags.superDelete === true ? { action: "super_delete" as const } : {}),
        ...(items === undefined ? {} : { items }),
      }),
    )
  },
  parameters: {
    flags: {
      ...cliConfigFlagParams,
      superDelete: cliScalarFlagParams.optionalBoolean("Delete the whole queue ({action: super_delete})"),
      itemsJson: queueOptionalJsonFlag("JSON array of queue ids to delete"),
    },
  },
  docs: { brief: "Delete queued messages or the whole queue" },
})

export const queueCommands = buildRouteMap({
  routes: {
    list: listCommand,
    postcat: postcatCommand,
    edit: editCommand,
    delete: deleteCommand,
  },
  docs: { brief: "Inspect and manage the Postfix mail queue" },
})
