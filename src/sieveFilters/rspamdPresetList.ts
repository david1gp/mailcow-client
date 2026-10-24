import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import { mailcowListNormalize } from "../client/mailcowListNormalize.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { PresetDetails } from "./presetDetails.js"
import type { RspamdPresetListOptions } from "./rspamdPresetListOptionsSchema.js"
import { rspamdPresetListOptionsSchema } from "./rspamdPresetListOptionsSchema.js"

/**
 * `GET /get/presets/rspamd` (`json_api.php:1450-1460`). Kept in this
 * context per inventory §8 alongside the sieve presets.
 */
export async function rspamdPresetList(options: RspamdPresetListOptions): PromiseResult<PresetDetails[]> {
  const op = "rspamdPresetList"
  const parsed = a.safeParse(rspamdPresetListOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config } = parsed.output
  const requested = await mailcowRequest<unknown>({
    config,
    method: "GET",
    path: mailcowPathApi("/get/presets/rspamd"),
  })
  if (!requested.success) return requested
  return createResult(mailcowListNormalize<PresetDetails>(requested.data))
}
