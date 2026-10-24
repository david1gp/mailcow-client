import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { BccDestinationOptions } from "./bccDestinationOptions.js"
import type { BccDestinationOptionsGetOptions } from "./bccDestinationOptionsGetOptionsSchema.js"
import { bccDestinationOptionsGetOptionsSchema } from "./bccDestinationOptionsGetOptionsSchema.js"

/** `GET /get/bcc-destination-options` (`json_api.php:1022-1048`). */
export async function bccDestinationOptionsGet(
  options: BccDestinationOptionsGetOptions,
): PromiseResult<BccDestinationOptions> {
  const op = "bccDestinationOptionsGet"
  const parsed = a.safeParse(bccDestinationOptionsGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config } = parsed.output
  return mailcowRequest<BccDestinationOptions>({
    config,
    method: "GET",
    path: mailcowPathApi("/get/bcc-destination-options"),
  })
}
