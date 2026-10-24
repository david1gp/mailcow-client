import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const dkimDeleteOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  items: a.array(a.string()),
})

export type DkimDeleteOptions = a.InferInput<typeof dkimDeleteOptionsSchema>
