import * as a from "valibot"
import { createResult, createResultError, type PromiseResult } from "#result"
import { mailcowListNormalize } from "../client/mailcowListNormalize.js"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { OAuth2ClientDetails } from "./oauth2ClientDetails.js"
import type { OAuth2ClientListOptions } from "./oauth2ClientListOptionsSchema.js"
import { oauth2ClientListOptionsSchema } from "./oauth2ClientListOptionsSchema.js"

/** `GET /get/oauth2-client/all`. Empty results echo `{}` — normalized to `[]`. */
export async function oauth2ClientList(options: OAuth2ClientListOptions): PromiseResult<OAuth2ClientDetails[]> {
  const op = "oauth2ClientList"
  const parsed = a.safeParse(oauth2ClientListOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config } = parsed.output
  const requested = await mailcowRequest<unknown>({
    config,
    method: "GET",
    path: mailcowPathApi("/get/oauth2-client/all"),
  })
  if (!requested.success) return requested
  return createResult(mailcowListNormalize<OAuth2ClientDetails>(requested.data))
}
