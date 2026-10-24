const mailcowE2eRequestIntervalMilliseconds = 500

export function mailcowE2eFetchCreate(fetchFn: typeof globalThis.fetch = globalThis.fetch) {
  let requestQueue: Promise<void> = Promise.resolve()
  let nextRequestAt = 0

  return (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const request = requestQueue.then(async () => {
      const waitMilliseconds = nextRequestAt - Date.now()
      if (waitMilliseconds > 0) await Bun.sleep(waitMilliseconds)
      const response = await fetchFn(input, init)
      nextRequestAt = Date.now() + mailcowE2eRequestIntervalMilliseconds
      return response
    })

    requestQueue = request.then(
      () => undefined,
      () => undefined,
    )
    return request
  }
}
