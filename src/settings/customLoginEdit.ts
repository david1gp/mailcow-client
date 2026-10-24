import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { CustomLoginEditOptions } from "./customLoginEditOptionsSchema.js"
import { customLoginEditOptionsSchema } from "./customLoginEditOptionsSchema.js"

/**
 * `POST /edit/custom_login` (admin). Raw JSON body is `{attr}`
 * (`customize('edit', 'custom_login', $attr)`).
 */
export async function customLoginEdit(options: CustomLoginEditOptions): PromiseResult<string[]> {
  const op = "customLoginEdit"
  const parsed = a.safeParse(customLoginEditOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, attr } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/edit/custom_login"),
    body: { attr: bodyOmitUndefined(attr) },
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
