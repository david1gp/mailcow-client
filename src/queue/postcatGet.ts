import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { PostcatGetOptions } from "./postcatGetOptionsSchema.js"
import { postcatGetOptionsSchema } from "./postcatGetOptionsSchema.js"

/**
 * `GET /get/postcat/{qid}`. The router echoes the queued message bytes
 * verbatim (`mailq('cat')` passthrough, `functions.mailq.inc.php:11-24`),
 * NOT JSON — read as `Uint8Array`.
 */
export async function postcatGet(options: PostcatGetOptions): PromiseResult<Uint8Array> {
  const op = "postcatGet"
  const parsed = a.safeParse(postcatGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, qid } = parsed.output
  return mailcowRequest({
    config,
    method: "GET",
    path: mailcowPathApi(`/get/postcat/${encodeURIComponent(qid)}`),
    responseType: "bytes",
  })
}
