import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

export const uiThemeEditOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  attr: a.looseObject({
    ui_theme: a.optional(a.string()),
  }),
})

export type UiThemeEditOptions = a.InferInput<typeof uiThemeEditOptionsSchema>
