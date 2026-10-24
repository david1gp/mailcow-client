import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { QuarantineGetOptions } from "./quarantineGetOptionsSchema.js"
import { quarantineGetOptionsSchema } from "./quarantineGetOptionsSchema.js"
import type { QuarantineItemDetails } from "./quarantineItemDetails.js"

/** `GET /get/quarantine/{id}`. Empty echoes `{}` (returned as-is). */
export async function quarantineGet(options: QuarantineGetOptions): PromiseResult<QuarantineItemDetails> {
  const op = "quarantineGet"
  const parsed = a.safeParse(quarantineGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, id } = parsed.output
  return mailcowRequest<QuarantineItemDetails>({
    config,
    method: "GET",
    path: mailcowPathApi(`/get/quarantine/${encodeURIComponent(String(id))}`),
  })
}
