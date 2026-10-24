import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const postcatGetOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  qid: a.string(),
})

export type PostcatGetOptions = a.InferInput<typeof postcatGetOptionsSchema>
