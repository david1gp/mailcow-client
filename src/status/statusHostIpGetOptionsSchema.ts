import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const statusHostIpGetOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
})

export type StatusHostIpGetOptions = a.InferInput<typeof statusHostIpGetOptionsSchema>
