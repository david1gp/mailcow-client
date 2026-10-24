import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const qitemEditOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  items: a.array(a.union([a.string(), a.number()])),
  attr: a.looseObject({
    action: a.picklist(["release", "learnham", "learnspam"]),
    release_format: a.optional(a.picklist(["attachment", "raw"])),
  }),
})

export type QitemEditOptions = a.InferInput<typeof qitemEditOptionsSchema>
