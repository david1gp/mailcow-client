import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { FwdhostDetails } from "./fwdhostDetails.js"
import type { FwdhostGetOptions } from "./fwdhostGetOptionsSchema.js"
import { fwdhostGetOptionsSchema } from "./fwdhostGetOptionsSchema.js"

/** `GET /get/fwdhost/{hostname}`. Empty echoes `{}` (returned as-is). */
export async function fwdhostGet(options: FwdhostGetOptions): PromiseResult<FwdhostDetails> {
  const op = "fwdhostGet"
  const parsed = a.safeParse(fwdhostGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, hostname } = parsed.output
  return mailcowRequest<FwdhostDetails>({
    config,
    method: "GET",
    path: mailcowPathApi(`/get/fwdhost/${encodeURIComponent(hostname)}`),
  })
}
