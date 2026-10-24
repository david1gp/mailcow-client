import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { RsettingDetails } from "./rsettingDetails.js"
import type { RsettingGetOptions } from "./rsettingGetOptionsSchema.js"
import { rsettingGetOptionsSchema } from "./rsettingGetOptionsSchema.js"

/** `GET /get/rsetting/{id}`. Empty echoes `{}` (returned as-is). */
export async function rsettingGet(options: RsettingGetOptions): PromiseResult<RsettingDetails> {
  const op = "rsettingGet"
  const parsed = a.safeParse(rsettingGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, id } = parsed.output
  return mailcowRequest<RsettingDetails>({
    config,
    method: "GET",
    path: mailcowPathApi(`/get/rsetting/${encodeURIComponent(String(id))}`),
  })
}
