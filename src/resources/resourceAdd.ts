import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { bodyOmitUndefined } from "../client/bodyOmitUndefined.js"
import { mailcowEnvelope } from "../client/mailcowEnvelope.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { ResourceAddOptions } from "./resourceAddOptionsSchema.js"
import { resourceAddOptionsSchema } from "./resourceAddOptionsSchema.js"

/**
 * `POST /add/resource`. Raw JSON body is the attr object top-level. The
 * server ignores any `name` and derives the address from `description`.
 */
export async function resourceAdd(options: ResourceAddOptions): PromiseResult<string[]> {
  const op = "resourceAdd"
  const parsed = a.safeParse(resourceAddOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, attr } = parsed.output
  const requested = await mailcowRequest({
    config,
    method: "POST",
    path: mailcowPathApi("/add/resource"),
    body: bodyOmitUndefined(attr),
  })
  if (!requested.success) return requested
  const enveloped = mailcowEnvelope(requested.data)
  if (!enveloped.success) return createResultError(op, enveloped.errorMessage)
  return enveloped
}
