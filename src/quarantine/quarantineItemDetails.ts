/**
 * One quarantine row. The detail read is `SELECT *` (`functions.quarantine.inc.php:809-817`);
 * the list read selects `id, qid, subject, virus_flag, score, rcpt, sender, action,
 * created, notified`. All fields are optional because the list projection is narrower.
 */
export type QuarantineItemDetails = {
  id?: string | number
  qid?: string
  subject?: string
  sender?: string
  rcpt?: string
  score?: string | number
  symbols?: string
  msg?: string
  action?: string
  created?: string | number
  notified?: string | number
  virus_flag?: string | number
}
