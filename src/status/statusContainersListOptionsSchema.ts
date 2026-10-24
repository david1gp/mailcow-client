import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const statusContainersListOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
})

export type StatusContainersListOptions = a.InferInput<typeof statusContainersListOptionsSchema>
