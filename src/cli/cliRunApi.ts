import type { CommandContext } from "@stricli/core"
import type { PromiseResult } from "#result"
import type { MailcowClientConfig } from "../client/mailcowClientConfigSchema.js"
import type { CliConfigFlags } from "./cliConfigFlags.js"
import { cliConfigLoad } from "./cliConfigLoad.js"
import { cliFail } from "./cliFail.js"
import { cliWriteJson } from "./cliWriteJson.js"

/** Load config, run API call, print JSON data or Result error + exit 1. */
export async function cliRunApi<T>(
  ctx: CommandContext,
  flags: CliConfigFlags,
  fn: (config: MailcowClientConfig) => PromiseResult<T>,
  mapData?: (data: T) => unknown,
) {
  const configResult = cliConfigLoad(flags)
  if (!configResult.success) cliFail(configResult)
  const result = await fn(configResult.data)
  if (!result.success) cliFail(result)
  const data = mapData ? mapData(result.data) : result.data
  cliWriteJson(ctx, data)
}
