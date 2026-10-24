import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const resourceAddOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  attr: a.looseObject({
    domain: a.string(),
    kind: a.string(),
    description: a.string(),
    active: a.optional(a.union([a.string(), a.number()])),
    multiple_bookings: a.optional(a.union([a.string(), a.number()])),
  }),
})

export type ResourceAddOptions = a.InferInput<typeof resourceAddOptionsSchema>
