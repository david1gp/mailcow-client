import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { DkimImportAddOptions } from "./dkimImportAddOptionsSchema.js"
import { dkimImportAddOptionsSchema } from "./dkimImportAddOptionsSchema.js"

/**
 * `POST /add/dkim_import` (`functions.dkim.inc.php:143-`). `private_key_file`
 * is the PEM private key content itself; it travels in the request body but
 * is never logged by this client. Raw JSON body is the attr object top-level.
 */
export async function dkimImportAdd(options: DkimImportAddOptions): PromiseResult<string[]> {
  const op = "dkimImportAdd"
  const parsed = a.safeParse(dkimImportAddOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, attr } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/add/dkim_import"),
    body: bodyOmitUndefined(attr),
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
