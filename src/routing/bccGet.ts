import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { BccDetails } from "./bccDetails.js"
import type { BccGetOptions } from "./bccGetOptionsSchema.js"
import { bccGetOptionsSchema } from "./bccGetOptionsSchema.js"

/**
 * `GET /get/bcc/{id}`.
 *
 * Known upstream quirk (faithfully passed through, `json_api.php:1178-1183`):
 * the detail branch appends an undefined `$details` element to the row, so the
 * response carries a trailing `null` entry. Prefer {@link bccList}.
 */
export async function bccGet(options: BccGetOptions): PromiseResult<BccDetails> {
  const op = "bccGet"
  const parsed = a.safeParse(bccGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, id } = parsed.output
  return mailcowRequest<BccDetails>({
    config,
    method: "GET",
    path: mailcowPathApi(`/get/bcc/${encodeURIComponent(String(id))}`),
  })
}
