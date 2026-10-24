import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { AdminAddOptions } from "./adminAddOptionsSchema.js"
import { adminAddOptionsSchema } from "./adminAddOptionsSchema.js"

/**
 * `POST /add/admin`. Raw JSON body is the attr object top-level
 * (`$_POST['attr'] = $request`, `json_api.php:80-83`).
 */
export async function adminAdd(options: AdminAddOptions): PromiseResult<string[]> {
  const op = "adminAdd"
  const parsed = a.safeParse(adminAddOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, attr } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/add/admin"),
    body: bodyOmitUndefined(attr),
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
