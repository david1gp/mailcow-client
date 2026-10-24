import * as a from "valibot"

export const mailcowClientConfigSchema = a.object({
  baseUrl: a.pipe(
    a.string(),
    a.minLength(1),
    a.url(),
    a.transform((s) => s.replace(/\/+$/, "")),
  ),
  apiKey: a.optional(a.string()),
  timeoutMs: a.optional(a.pipe(a.number(), a.integer(), a.minValue(1))),
  retries: a.optional(a.pipe(a.number(), a.integer(), a.minValue(0))),
})

export type MailcowClientConfigInput = a.InferInput<typeof mailcowClientConfigSchema>
export type MailcowClientConfig = a.InferOutput<typeof mailcowClientConfigSchema>
