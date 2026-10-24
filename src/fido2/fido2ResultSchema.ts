import * as a from "valibot"

export const fido2ResultSchema = a.object({
  success: a.boolean(),
  msg: a.optional(a.unknown()),
})

export type Fido2Result = a.InferOutput<typeof fido2ResultSchema>
