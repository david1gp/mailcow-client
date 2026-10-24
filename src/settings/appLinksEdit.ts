import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { AppLinksEditOptions } from "./appLinksEditOptionsSchema.js"
import { appLinksEditOptionsSchema } from "./appLinksEditOptionsSchema.js"

/**
 * `POST /edit/app_links` (admin). The router passes attr straight through
 * (`customize('edit', 'app_links', $attr)`); raw JSON body is `{attr}`.
 */
export async function appLinksEdit(options: AppLinksEditOptions): PromiseResult<string[]> {
  const op = "appLinksEdit"
  const parsed = a.safeParse(appLinksEditOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, attr } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/edit/app_links"),
    body: { attr: bodyOmitUndefined(attr) },
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
