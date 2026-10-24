/** DataTables SSP envelope returned by `POST /search/*` (`inc/lib/ssp.class.php`). */
export type MailcowSearchResult<T> = {
  draw?: number
  recordsTotal?: number
  recordsFiltered?: number
  data?: T[]
}
