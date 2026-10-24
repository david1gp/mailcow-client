import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const rspamdMapEditOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  items: a.array(a.string()),
  attr: a.looseObject({
    rspamd_map_data: a.string(),
  }),
})

export type RspamdMapEditOptions = a.InferInput<typeof rspamdMapEditOptionsSchema>
