import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { OAuth2ClientAddOptions } from "./oauth2ClientAddOptionsSchema.js"
import { oauth2ClientAddOptionsSchema } from "./oauth2ClientAddOptionsSchema.js"

/**
 * `POST /add/oauth2-client`. Raw JSON body is the attr object top-level.
 * The envelope is returned as-is at the library level; any client secret
 * it carries is never logged.
 */
export async function oauth2ClientAdd(options: OAuth2ClientAddOptions): PromiseResult<string[]> {
  const op = "oauth2ClientAdd"
  const parsed = a.safeParse(oauth2ClientAddOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, attr } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/add/oauth2-client"),
    body: bodyOmitUndefined(attr),
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
