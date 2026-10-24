import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

/**
 * `da_acl` is a list of enabled ACL names, NOT a map: the handler casts
 * `$_data['da_acl']` to array and sets each named entry to 1
 * (`functions.acl.inc.php:83-88`). Known names include syncjobs, quarantine,
 * login_as, sogo_access, app_passwds, bcc_maps, pushover, filters, ratelimit,
 * spam_policy, extend_sender_acl, unlimited_quota, protocol_access,
 * smtp_ip_access, alias_domains, domain_desc.
 */
export const domainAdminAclEditOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  items: a.array(a.union([a.string(), a.number()])),
  attr: a.looseObject({
    da_acl: a.array(a.string()),
  }),
})

export type DomainAdminAclEditOptions = a.InferInput<typeof domainAdminAclEditOptionsSchema>
