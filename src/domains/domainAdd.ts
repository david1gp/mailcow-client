import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { DomainAddOptions } from "./domainAddOptionsSchema.js"
import { domainAddOptionsSchema } from "./domainAddOptionsSchema.js"

/**
 * `POST /add/domain`. Raw JSON body is the attr object top-level
 * (`$_POST['attr'] = $request`, `json_api.php:80-83`). Adding a domain
 * auto-provisions a DKIM key under the default selector (unless one already
 * exists — `domain_add_dkim_available`, `functions.mailbox.inc.php:659-673`),
 * so a follow-up `dkimAdd` for the same selector hits the key-exists branch.
 */
export async function domainAdd(options: DomainAddOptions): PromiseResult<string[]> {
  const op = "domainAdd"
  const parsed = a.safeParse(domainAddOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, attr } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/add/domain"),
    body: bodyOmitUndefined(attr),
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
