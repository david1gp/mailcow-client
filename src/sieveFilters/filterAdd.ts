import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { FilterAddOptions } from "./filterAddOptionsSchema.js"
import { filterAddOptionsSchema } from "./filterAddOptionsSchema.js"

/**
 * `POST /add/filter`. Raw JSON body is the attr object top-level
 * (`$_POST['attr'] = $request`, `json_api.php:80-83`).
 */
export async function filterAdd(options: FilterAddOptions): PromiseResult<string[]> {
  const op = "filterAdd"
  const parsed = a.safeParse(filterAddOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, attr } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/add/filter"),
    body: bodyOmitUndefined(attr),
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
