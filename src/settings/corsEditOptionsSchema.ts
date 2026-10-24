import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const corsEditOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  attr: a.looseObject({
    allowed_origins: a.optional(a.array(a.string())),
    allowed_methods: a.optional(a.array(a.picklist(["GET", "POST", "PUT", "DELETE"]))),
  }),
})

export type CorsEditOptions = a.InferInput<typeof corsEditOptionsSchema>
