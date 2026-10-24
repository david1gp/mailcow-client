import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { MailqDeleteOptions } from "./mailqDeleteOptionsSchema.js"
import { mailqDeleteOptionsSchema } from "./mailqDeleteOptionsSchema.js"

/**
 * `POST /delete/mailq`. Two shapes, both raw top-level bodies:
 * per-message delete sends the qid items array; whole-queue delete sends
 * `{action: "super_delete"}` per the openapi contract
 * (`api/openapi.yaml#/api/v1/delete/mailq`) even though the router wraps
 * whatever body it receives as `['qid' => $items]`.
 */
export async function mailqDelete(options: MailqDeleteOptions): PromiseResult<string[]> {
  const op = "mailqDelete"
  const parsed = a.safeParse(mailqDeleteOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, items, action } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/delete/mailq"),
    body: action === "super_delete" ? { action } : (items ?? []),
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
