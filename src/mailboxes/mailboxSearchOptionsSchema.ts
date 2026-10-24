import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const mailboxSearchOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  draw: a.optional(a.pipe(a.number(), a.integer())),
  start: a.optional(a.pipe(a.number(), a.integer())),
  length: a.optional(a.pipe(a.number(), a.integer())),
  search: a.optional(a.looseObject({ value: a.optional(a.string()), regex: a.optional(a.boolean()) })),
  order: a.optional(
    a.array(a.looseObject({ column: a.optional(a.pipe(a.number(), a.integer())), dir: a.optional(a.string()) })),
  ),
  columns: a.optional(a.array(a.looseObject({ data: a.optional(a.union([a.string(), a.number()])) }))),
})

export type MailboxSearchOptions = a.InferInput<typeof mailboxSearchOptionsSchema>
