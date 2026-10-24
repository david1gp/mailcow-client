/** Mailbox template row (`mailbox get mailbox_templates`, stored attributes JSON). */
export type MailboxTemplate = {
  id: number
  template: string
  attributes?: Record<string, unknown>
}
