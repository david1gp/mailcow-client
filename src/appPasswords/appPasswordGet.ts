import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { AppPasswordDetails } from "./appPasswordDetails.js"
import type { AppPasswordGetOptions } from "./appPasswordGetOptionsSchema.js"
import { appPasswordGetOptionsSchema } from "./appPasswordGetOptionsSchema.js"

/**
 * `GET /get/app-passwd/{id}`. Known router bug: the handler receives
 * `$object['id']` on a string, so this route is effectively broken
 * (`json_api.php:555-558`) — prefer {@link appPasswordList}. Implemented
 * faithfully so the pin stays visible; tests assert the routed path.
 */
export async function appPasswordGet(options: AppPasswordGetOptions): PromiseResult<AppPasswordDetails> {
  const op = "appPasswordGet"
  const parsed = a.safeParse(appPasswordGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, id } = parsed.output
  return mailcowRequest<AppPasswordDetails>({
    config,
    method: "GET",
    path: mailcowPathApi(`/get/app-passwd/${encodeURIComponent(String(id))}`),
  })
}
