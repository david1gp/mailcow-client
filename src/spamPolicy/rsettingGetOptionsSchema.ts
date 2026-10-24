import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const rsettingGetOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  id: a.union([a.string(), a.number()]),
})

export type RsettingGetOptions = a.InferInput<typeof rsettingGetOptionsSchema>
