import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const appLinksEditOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  attr: a.looseObject({
    app: a.optional(a.array(a.string())),
    href: a.optional(a.array(a.string())),
    user_href: a.optional(a.array(a.string())),
    hide: a.optional(a.array(a.string())),
  }),
})

export type AppLinksEditOptions = a.InferInput<typeof appLinksEditOptionsSchema>
