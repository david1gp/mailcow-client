import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { AliasDetails } from "./aliasDetails.js"
import type { AliasGetOptions } from "./aliasGetOptionsSchema.js"
import { aliasGetOptionsSchema } from "./aliasGetOptionsSchema.js"

/** `GET /get/alias/{address}`. Empty echoes `{}` (returned as-is). */
export async function aliasGet(options: AliasGetOptions): PromiseResult<AliasDetails> {
  const op = "aliasGet"
  const parsed = a.safeParse(aliasGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, address } = parsed.output
  return mailcowRequest<AliasDetails>({
    config,
    method: "GET",
    path: mailcowPathApi(`/get/alias/${encodeURIComponent(address)}`),
  })
}
