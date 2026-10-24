import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { GlobalFilterDetails } from "./globalFilterDetails.js"
import type { GlobalFilterGetOptions } from "./globalFilterGetOptionsSchema.js"
import { globalFilterGetOptionsSchema } from "./globalFilterGetOptionsSchema.js"

/**
 * `GET /get/global_filters/{all|prefilter|postfilter}`
 * (`json_api.php:585-611`). `all` returns `{prefilter, postfilter}`;
 * the single scopes return the raw sieve text (JSON string).
 */
export async function globalFilterGet(options: GlobalFilterGetOptions): PromiseResult<GlobalFilterDetails | string> {
  const op = "globalFilterGet"
  const parsed = a.safeParse(globalFilterGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, scope } = parsed.output
  return mailcowRequest<GlobalFilterDetails | string>({
    config,
    method: "GET",
    path: mailcowPathApi(`/get/global_filters/${scope ?? "all"}`),
  })
}
