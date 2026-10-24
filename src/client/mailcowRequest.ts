import { createResult, createResultError, type PromiseResult, resultTryParsingFetchErr } from "#result"
import type { MailcowRequestOptions } from "./mailcowRequestOptions.js"
import { mailcowRequestUrl } from "./mailcowRequestUrl.js"

const DEFAULT_TIMEOUT_MS = 30_000
const DEFAULT_RETRIES = 0

export async function mailcowRequest(
  options: MailcowRequestOptions & { responseType: "void" },
): PromiseResult<undefined>
export async function mailcowRequest(options: MailcowRequestOptions & { responseType: "text" }): PromiseResult<string>
export async function mailcowRequest(
  options: MailcowRequestOptions & { responseType: "bytes" },
): PromiseResult<Uint8Array>
export async function mailcowRequest<T = unknown>(
  options: MailcowRequestOptions & { responseType?: "json" },
): PromiseResult<T>
export async function mailcowRequest(options: MailcowRequestOptions): PromiseResult<unknown> {
  const op = "mailcowRequest"
  const { config, method, path, query, body, headers: extraHeaders } = options
  const responseType = options.responseType ?? "json"
  const timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS
  const retries = config.retries ?? DEFAULT_RETRIES
  const maxAttempts = retries + 1

  let url: string
  let headers: Record<string, string>
  let bodyInit: string | undefined
  try {
    url = mailcowRequestUrl(config.baseUrl, path, query)
    headers = {
      Accept: "application/json",
      ...extraHeaders,
    }
    if (config.apiKey) headers["X-API-Key"] = config.apiKey

    if (body !== undefined) {
      headers["Content-Type"] = headers["Content-Type"] ?? "application/json"
      bodyInit = JSON.stringify(body)
    }
  } catch (error) {
    return createResultError(op, "Request preparation failed", error instanceof Error ? error.message : String(error))
  }

  let lastError: ReturnType<typeof createResultError> | undefined

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
    try {
      let response: Response
      try {
        response = await fetch(url, {
          method,
          headers,
          body: bodyInit,
          signal: controller.signal,
        })
      } catch (error) {
        lastError = createResultError(op, "Fetch failed", error instanceof Error ? error.message : String(error))
        if (attempt < maxAttempts - 1) continue
        return lastError
      }

      if (!response.ok) {
        let text: string
        try {
          text = await response.text()
        } catch (error) {
          lastError = createResultError(
            op,
            "Reading response failed",
            error instanceof Error ? error.message : String(error),
          )
          if (response.status >= 500 && attempt < maxAttempts - 1) continue
          return lastError
        }
        const err = resultTryParsingFetchErr(op, text, response.status, response.statusText)
        if (response.status >= 500 && attempt < maxAttempts - 1) {
          lastError = err
          continue
        }
        return err
      }

      if (responseType === "void" || response.status === 204) {
        return createResult(undefined)
      }

      if (responseType === "bytes") {
        try {
          const buf = await response.arrayBuffer()
          return createResult(new Uint8Array(buf))
        } catch (error) {
          return createResultError(
            op,
            "Reading binary response failed",
            error instanceof Error ? error.message : String(error),
          )
        }
      }

      let text: string
      try {
        text = await response.text()
      } catch (error) {
        return createResultError(op, "Reading response failed", error instanceof Error ? error.message : String(error))
      }

      if (responseType === "text") {
        return createResult(text)
      }

      // json
      if (text === "") return createResult(undefined)
      try {
        return createResult(JSON.parse(text) as unknown)
      } catch (error) {
        return createResultError(op, "Invalid JSON response", error instanceof Error ? error.message : text)
      }
    } finally {
      clearTimeout(timeoutId)
    }
  }

  return lastError ?? createResultError(op, "Request failed after retries")
}
