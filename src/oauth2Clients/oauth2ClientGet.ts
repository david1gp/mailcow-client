import * as a from "valibot"
import { createResultError, type PromiseResult } from "#result"
import { mailcowPathApi } from "../client/mailcowPathApi.js"
import { mailcowRequest } from "../client/mailcowRequest.js"
import type { OAuth2ClientDetails } from "./oauth2ClientDetails.js"
import type { OAuth2ClientGetOptions } from "./oauth2ClientGetOptionsSchema.js"
import { oauth2ClientGetOptionsSchema } from "./oauth2ClientGetOptionsSchema.js"

/** `GET /get/oauth2-client/{id}` (`json_api.php:778-802`). */
export async function oauth2ClientGet(options: OAuth2ClientGetOptions): PromiseResult<OAuth2ClientDetails> {
  const op = "oauth2ClientGet"
  const parsed = a.safeParse(oauth2ClientGetOptionsSchema, options)
  if (!parsed.success) return createResultError(op, a.summarize(parsed.issues))
  const { config, id } = parsed.output
  return mailcowRequest<OAuth2ClientDetails>({
    config,
    method: "GET",
    path: mailcowPathApi(`/get/oauth2-client/${encodeURIComponent(String(id))}`),
  })
}
