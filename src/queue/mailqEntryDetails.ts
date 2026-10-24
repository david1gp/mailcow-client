/**
 * One Postfix queue entry. The handler (`functions.mailq.inc.php:48-`) decodes
 * each docker `mailq` JSON line and flattens `recipients` to address strings
 * (`address (delay_reason)` when a delay reason is present). All fields are
 * optional because queue output varies by Postfix version.
 */
export type MailqEntryDetails = {
  queue_name?: string
  queue_id?: string
  arrival_time?: number
  message_size?: string
  sender?: string
  recipients?: string[]
}
