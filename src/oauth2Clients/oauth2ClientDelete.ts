import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { OAuth2ClientDeleteOptions } from "./oauth2ClientDeleteOptionsSchema.js"
import { oauth2ClientDeleteOptionsSchema } from "./oauth2ClientDeleteOptionsSchema.js"

/**
 * `POST /delete/oauth2-client`. Raw JSON body is the items array itself
 * (`$_POST['items'] = $request`, `json_api.php:92`), NOT `{items}`.
 */
export async function oauth2ClientDelete(options: OAuth2ClientDeleteOptions): PromiseResult<string[]> {
  const op = "oauth2ClientDelete"
  const parsed = a.safeParse(oauth2ClientDeleteOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, items } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/delete/oauth2-client"),
    body: items,
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
