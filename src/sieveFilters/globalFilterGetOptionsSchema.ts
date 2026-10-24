import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const globalFilterGetOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  scope: a.optional(a.picklist(["all", "prefilter", "postfilter"])),
})

export type GlobalFilterGetOptions = a.InferInput<typeof globalFilterGetOptionsSchema>
