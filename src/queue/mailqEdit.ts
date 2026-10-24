import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { MailqEditOptions } from "./mailqEditOptionsSchema.js"
import { mailqEditOptionsSchema } from "./mailqEditOptionsSchema.js"

/**
 * `POST /edit/mailq` (`mailq('edit', ['qid' => $items] + $attr)`).
 * `hold`/`unhold`/`deliver` act on the qids in items; `flush` acts on the
 * whole queue (items may be empty). Raw JSON body is `{attr, items}`.
 */
export async function mailqEdit(options: MailqEditOptions): PromiseResult<string[]> {
  const op = "mailqEdit"
  const parsed = a.safeParse(mailqEditOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, items, attr } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/edit/mailq"),
    body: { attr: bodyOmitUndefined(attr), items },
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
