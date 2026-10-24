import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const mailboxPolicyAddOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  attr: a.looseObject({
    username: a.string(),
    object_from: a.string(),
    object_list: a.picklist(["wl", "bl"]),
  }),
})

export type MailboxPolicyAddOptions = a.InferInput<typeof mailboxPolicyAddOptionsSchema>
