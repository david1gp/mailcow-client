import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import { mailcowListNormalize } from "../client/mailcowListNormalize.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { PresetDetails } from "./presetDetails.js"
import type { SievePresetListOptions } from "./sievePresetListOptionsSchema.js"
import { sievePresetListOptionsSchema } from "./sievePresetListOptionsSchema.js"

/** `GET /get/presets/sieve` (`json_api.php:1450-1460`). */
export async function sievePresetList(options: SievePresetListOptions): PromiseResult<PresetDetails[]> {
  const op = "sievePresetList"
  const parsed = a.safeParse(sievePresetListOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config } = parsed.output
  const requested = await mailcowRequest<unknown>({
    config,
    method: "GET",
    path: mailcowPathApi("/get/presets/sieve"),
  })
  if (!requested.success) return requested
  return createResult(mailcowListNormalize<PresetDetails>(requested.data))
}
