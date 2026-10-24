import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const statusVmailGetOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
})

export type StatusVmailGetOptions = a.InferInput<typeof statusVmailGetOptionsSchema>
