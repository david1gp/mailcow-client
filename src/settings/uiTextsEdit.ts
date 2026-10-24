import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { UiTextsEditOptions } from "./uiTextsEditOptionsSchema.js"
import { uiTextsEditOptionsSchema } from "./uiTextsEditOptionsSchema.js"

/**
 * `POST /edit/ui_texts` (admin). Raw JSON body is `{attr}`
 * (`customize('edit', 'ui_texts', $attr)`).
 */
export async function uiTextsEdit(options: UiTextsEditOptions): PromiseResult<string[]> {
  const op = "uiTextsEdit"
  const parsed = a.safeParse(uiTextsEditOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, attr } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/edit/ui_texts"),
    body: { attr: bodyOmitUndefined(attr) },
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
