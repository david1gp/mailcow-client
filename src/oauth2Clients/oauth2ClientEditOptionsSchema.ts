import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

const stringOrNumber = a.union([a.string(), a.number()])

/**
 * `renew_secret` / `revoke_tokens` are presence flags: the handler only
 * checks `isset()` (`functions.oauth2.inc.php:98-140`). `grant_type`,
 * `access_token`, `refresh_token` and `scope` from inventory §11 are not
 * read by the handler and are intentionally absent.
 */
export const oauth2ClientEditOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  items: a.array(a.union([a.string(), a.number()])),
  attr: a.looseObject({
    redirect_uri: a.optional(a.string()),
    renew_secret: a.optional(stringOrNumber),
    revoke_tokens: a.optional(stringOrNumber),
  }),
})

export type OAuth2ClientEditOptions = a.InferInput<typeof oauth2ClientEditOptionsSchema>
