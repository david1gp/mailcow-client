/**
 * Sync job details row (`mailbox('get', 'syncjob_details')`, i.e. an
 * `imapsync` row, `functions.mailbox.inc.php:4606-4650`). `password1` is
 * only present when the `with_password` field is requested; `log` mirrors
 * `returned_text`.
 */
export type SyncJobDetails = {
  id?: number
  user2?: string
  host1?: string
  port1?: string
  user1?: string
  password1?: string
  exclude?: string
  maxage?: string
  maxbytespersecond?: string
  subfolder2?: string
  mins_interval?: string
  enc1?: string
  custom_params?: string
  active?: number
  last_run?: string | null
  success?: string | null
  delete2duplicates?: number
  subscribeall?: number
  dry?: number
  delete1?: number
  delete2?: number
  automap?: number
  skipcrossduplicates?: number
  timeout1?: string
  timeout2?: string
  log?: string
}
