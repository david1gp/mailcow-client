import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import { mailcowListNormalize } from "../client/mailcowListNormalize.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { AliasDomainDetails } from "./aliasDomainDetails.js"
import type { AliasDomainListOptions } from "./aliasDomainListOptionsSchema.js"
import { aliasDomainListOptionsSchema } from "./aliasDomainListOptionsSchema.js"

/** `GET /get/alias-domain/all`. Empty lists echo `{}` — normalized to `[]`. */
export async function aliasDomainList(options: AliasDomainListOptions): PromiseResult<AliasDomainDetails[]> {
  const op = "aliasDomainList"
  const parsed = a.safeParse(aliasDomainListOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config } = parsed.output
  const requested = await mailcowRequest<unknown>({
    config,
    method: "GET",
    path: mailcowPathApi("/get/alias-domain/all"),
  })
  if (!requested.success) return requested
  return createResult(mailcowListNormalize<AliasDomainDetails>(requested.data))
}
