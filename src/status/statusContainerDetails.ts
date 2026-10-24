/** One entry of `GET /get/status/containers` (`functions.docker.inc.php`). */
export type StatusContainerDetails = {
  type?: string
  container?: string
  state?: string
  started_at?: string
  image?: string
}
