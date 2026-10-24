import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const dkimGetOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  domain: a.string(),
})

export type DkimGetOptions = a.InferInput<typeof dkimGetOptionsSchema>
