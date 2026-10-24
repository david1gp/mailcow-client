import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import { mailcowListNormalize } from "../client/mailcowListNormalize.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { ResourceDetails } from "./resourceDetails.js"
import type { ResourceListOptions } from "./resourceListOptionsSchema.js"
import { resourceListOptionsSchema } from "./resourceListOptionsSchema.js"

/** `GET /get/resource/all`. Empty lists echo `{}` — normalized to `[]`. */
export async function resourceList(options: ResourceListOptions): PromiseResult<ResourceDetails[]> {
  const op = "resourceList"
  const parsed = a.safeParse(resourceListOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config } = parsed.output
  const requested = await mailcowRequest<unknown>({
    config,
    method: "GET",
    path: mailcowPathApi("/get/resource/all"),
  })
  if (!requested.success) return requested
  return createResult(mailcowListNormalize<ResourceDetails>(requested.data))
}
