/** Attr fields for `POST /add/syncjob` (`functions.mailbox.inc.php:305-`). */
export type SyncJobAddRequest = {
  username: string
  host1: string
  port1: string | number
  user1: string
  password1: string
  enc1?: string
  mins_interval: string | number
  subfolder2?: string
  maxage?: string | number
  maxbytespersecond?: string | number
  timeout1?: string | number
  timeout2?: string | number
  exclude?: string
  custom_params?: string
  delete1?: string | number
  delete2?: string | number
  delete2duplicates?: string | number
  automap?: string | number
  skipcrossduplicates?: string | number
  subscribeall?: string | number
  dry?: string | number
  active?: string | number
}
