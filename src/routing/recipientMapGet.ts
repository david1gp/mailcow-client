import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { RecipientMapDetails } from "./recipientMapDetails.js"
import type { RecipientMapGetOptions } from "./recipientMapGetOptionsSchema.js"
import { recipientMapGetOptionsSchema } from "./recipientMapGetOptionsSchema.js"

/**
 * `GET /get/recipient_map/{id}`.
 *
 * Known upstream quirk (faithfully passed through, `json_api.php:1203-1209`):
 * the detail branch appends an undefined `$details` element to the row, so the
 * response carries a trailing `null` entry. Prefer {@link recipientMapList}.
 */
export async function recipientMapGet(options: RecipientMapGetOptions): PromiseResult<RecipientMapDetails> {
  const op = "recipientMapGet"
  const parsed = a.safeParse(recipientMapGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, id } = parsed.output
  return mailcowRequest<RecipientMapDetails>({
    config,
    method: "GET",
    path: mailcowPathApi(`/get/recipient_map/${encodeURIComponent(String(id))}`),
  })
}
