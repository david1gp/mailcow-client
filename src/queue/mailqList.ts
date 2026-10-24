import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { MailqEntryDetails } from "./mailqEntryDetails.js"
import type { MailqListOptions } from "./mailqListOptionsSchema.js"
import { mailqListOptionsSchema } from "./mailqListOptionsSchema.js"

/**
 * `GET /get/mailq/all`. The router echoes the handler's raw JSON string
 * verbatim (`echo $mailq`, `json_api.php:562-574`; `'[]'` when empty) instead
 * of routing it through `process_get_return`, so this op reads the body as
 * text: a parsed entry array when the body is valid queue JSON, otherwise the
 * raw string passthrough.
 */
export async function mailqList(options: MailqListOptions): PromiseResult<MailqEntryDetails[] | string> {
  const op = "mailqList"
  const parsed = a.safeParse(mailqListOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "GET",
    path: mailcowPathApi("/get/mailq/all"),
    responseType: "text",
  })
  if (!requested.success) return requested
  try {
    const decoded = JSON.parse(requested.data) as unknown
    if (Array.isArray(decoded)) return createResult(decoded as MailqEntryDetails[])
    return createResult(requested.data)
  } catch {
    return createResult(requested.data)
  }
}
