import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const mailqDeleteOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  items: a.optional(a.array(a.union([a.string(), a.number()]))),
  action: a.optional(a.picklist(["super_delete"])),
})

export type MailqDeleteOptions = a.InferInput<typeof mailqDeleteOptionsSchema>
