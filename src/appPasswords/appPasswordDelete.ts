import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { AppPasswordDeleteOptions } from "./appPasswordDeleteOptionsSchema.js"
import { appPasswordDeleteOptionsSchema } from "./appPasswordDeleteOptionsSchema.js"

/**
 * `POST /delete/app-passwd`. Raw JSON body is the items array itself
 * (`$_POST['items'] = $request`, `json_api.php:92`), NOT `{items}`.
 */
export async function appPasswordDelete(options: AppPasswordDeleteOptions): PromiseResult<string[]> {
  const op = "appPasswordDelete"
  const parsed = a.safeParse(appPasswordDeleteOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, items } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/delete/app-passwd"),
    body: items,
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
