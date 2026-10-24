import * as a from "valibot"
import { mailcowClientConfigSchema } from "../client/mailcowClientConfigSchema.js"

const stringOrNumber = a.union([a.string(), a.number()])

export const uiTextsEditOptionsSchema = a.object({
  config: mailcowClientConfigSchema,
  attr: a.looseObject({
    title_name: a.optional(a.string()),
    main_name: a.optional(a.string()),
    apps_name: a.optional(a.string()),
    help_text: a.optional(a.string()),
    ui_footer: a.optional(a.string()),
    ui_announcement_text: a.optional(a.string()),
    ui_announcement_type: a.optional(a.string()),
    ui_announcement_active: a.optional(stringOrNumber),
  }),
})

export type UiTextsEditOptions = a.InferInput<typeof uiTextsEditOptionsSchema>
