import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const mailboxRenameOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  items: a.array(a.union([a.string(), a.number()])),
  attr: a.looseObject({
    // Upstream builds the old address as old_local_part@domain
    // (`functions.mailbox.inc.php:3537-3544`); without old_local_part the old
    // address degrades to "@". Items are NOT read by the handler (the router
    // passes them as `mailbox`, which `mailbox_rename` ignores), so the old
    // local part must be explicit — never derived from items.
    old_local_part: a.string(),
    new_local_part: a.optional(a.string()),
    domain: a.optional(a.string()),
    create_alias: a.optional(a.union([a.string(), a.number()])),
  }),
})

export type MailboxRenameOptions = a.InferInput<typeof mailboxRenameOptionsSchema>
