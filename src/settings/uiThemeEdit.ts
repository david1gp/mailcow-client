import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { UiThemeEditOptions } from "./uiThemeEditOptionsSchema.js"
import { uiThemeEditOptionsSchema } from "./uiThemeEditOptionsSchema.js"

/**
 * `POST /edit/ui_theme` (admin). Raw JSON body is `{attr}`
 * (`customize('edit', 'ui_theme', $attr)`).
 */
export async function uiThemeEdit(options: UiThemeEditOptions): PromiseResult<string[]> {
  const op = "uiThemeEdit"
  const parsed = a.safeParse(uiThemeEditOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, attr } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/edit/ui_theme"),
    body: { attr: bodyOmitUndefined(attr) },
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
