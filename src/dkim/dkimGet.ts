import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { DkimDetails } from "./dkimDetails.js"
import type { DkimGetOptions } from "./dkimGetOptionsSchema.js"
import { dkimGetOptionsSchema } from "./dkimGetOptionsSchema.js"

/**
 * `GET /get/dkim/{domain}`. Only public key material (`pubkey`, `length`,
 * `dkim_txt`) is surfaced; the private key is never returned by this client.
 */
export async function dkimGet(options: DkimGetOptions): PromiseResult<DkimDetails> {
  const op = "dkimGet"
  const parsed = a.safeParse(dkimGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, domain } = parsed.output
  return mailcowRequest<DkimDetails>({
    config,
    method: "GET",
    path: mailcowPathApi(`/get/dkim/${encodeURIComponent(domain)}`),
  })
}
