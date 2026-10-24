import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

const stringOrNumber = a.union([a.string(), a.number()])

export const identityProviderEditOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  attr: a.looseObject({
    host: a.optional(a.string()),
    port: a.optional(stringOrNumber),
    basedn: a.optional(a.string()),
    binddn: a.optional(a.string()),
    bindpass: a.optional(a.string()),
    filter: a.optional(a.string()),
    attribute_field: a.optional(a.string()),
    authsource: a.optional(a.string()),
    client_id: a.optional(a.string()),
    client_secret: a.optional(a.string()),
    authorize_url: a.optional(a.string()),
    login_provisioning: a.optional(stringOrNumber),
    import_users: a.optional(stringOrNumber),
  }),
})

export type IdentityProviderEditOptions = a.InferInput<typeof identityProviderEditOptionsSchema>
