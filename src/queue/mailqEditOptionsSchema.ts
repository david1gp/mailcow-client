import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const mailqEditOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  items: a.array(a.union([a.string(), a.number()])),
  attr: a.looseObject({
    action: a.picklist(["hold", "unhold", "deliver", "flush"]),
  }),
})

export type MailqEditOptions = a.InferInput<typeof mailqEditOptionsSchema>
