import * as a from "valibot"

/** One entry of the mailcow mutation envelope: `{ "type": "success|danger|error|warning", "msg": ... }`. */
export const mailcowEnvelopeSchema = a.array(
  a.object({
    type: a.string(),
    msg: a.unknown(),
  }),
)

export type MailcowEnvelopeInput = a.InferInput<typeof mailcowEnvelopeSchema>
export type MailcowEnvelope = a.InferOutput<typeof mailcowEnvelopeSchema>
