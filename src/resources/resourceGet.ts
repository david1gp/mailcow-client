import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { ResourceDetails } from "./resourceDetails.js"
import type { ResourceGetOptions } from "./resourceGetOptionsSchema.js"
import { resourceGetOptionsSchema } from "./resourceGetOptionsSchema.js"

/** `GET /get/resource/{name}`. Empty echoes `{}` (returned as-is). */
export async function resourceGet(options: ResourceGetOptions): PromiseResult<ResourceDetails> {
  const op = "resourceGet"
  const parsed = a.safeParse(resourceGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, name } = parsed.output
  return mailcowRequest<ResourceDetails>({
    config,
    method: "GET",
    path: mailcowPathApi(`/get/resource/${encodeURIComponent(name)}`),
  })
}
