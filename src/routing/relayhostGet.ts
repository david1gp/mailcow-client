import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { RelayhostDetails } from "./relayhostDetails.js"
import type { RelayhostGetOptions } from "./relayhostGetOptionsSchema.js"
import { relayhostGetOptionsSchema } from "./relayhostGetOptionsSchema.js"

/** `GET /get/relayhost/{id}`. Empty echoes `{}` (returned as-is). */
export async function relayhostGet(options: RelayhostGetOptions): PromiseResult<RelayhostDetails> {
  const op = "relayhostGet"
  const parsed = a.safeParse(relayhostGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, id } = parsed.output
  return mailcowRequest<RelayhostDetails>({
    config,
    method: "GET",
    path: mailcowPathApi(`/get/relayhost/${encodeURIComponent(String(id))}`),
  })
}
