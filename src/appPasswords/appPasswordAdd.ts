import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { AppPasswordAddOptions } from "./appPasswordAddOptionsSchema.js"
import { appPasswordAddOptionsSchema } from "./appPasswordAddOptionsSchema.js"

/**
 * `POST /add/app-passwd`. Raw JSON body is the attr object top-level
 * (`$_POST['attr'] = $request`, `json_api.php:80-83`). The cleartext
 * password is hashed server-side.
 */
export async function appPasswordAdd(options: AppPasswordAddOptions): PromiseResult<string[]> {
  const op = "appPasswordAdd"
  const parsed = a.safeParse(appPasswordAddOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, attr } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/add/app-passwd"),
    body: bodyOmitUndefined(attr),
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
