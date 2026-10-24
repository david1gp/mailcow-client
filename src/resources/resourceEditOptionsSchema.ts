import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const resourceEditOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  items: a.array(a.union([a.string(), a.number()])),
  attr: a.looseObject({
    description: a.optional(a.string()),
    active: a.optional(a.union([a.string(), a.number()])),
    kind: a.optional(a.string()),
    multiple_bookings: a.optional(a.union([a.string(), a.number()])),
  }),
})

export type ResourceEditOptions = a.InferInput<typeof resourceEditOptionsSchema>
