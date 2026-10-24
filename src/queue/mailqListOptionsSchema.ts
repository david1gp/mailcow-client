import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const mailqListOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
})

export type MailqListOptions = a.InferInput<typeof mailqListOptionsSchema>
