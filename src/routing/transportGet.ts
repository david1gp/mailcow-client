import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { TransportDetails } from "./transportDetails.js"
import type { TransportGetOptions } from "./transportGetOptionsSchema.js"
import { transportGetOptionsSchema } from "./transportGetOptionsSchema.js"

/** `GET /get/transport/{id}`. Empty echoes `{}` (returned as-is). */
export async function transportGet(options: TransportGetOptions): PromiseResult<TransportDetails> {
  const op = "transportGet"
  const parsed = a.safeParse(transportGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, id } = parsed.output
  return mailcowRequest<TransportDetails>({
    config,
    method: "GET",
    path: mailcowPathApi(`/get/transport/${encodeURIComponent(String(id))}`),
  })
}
