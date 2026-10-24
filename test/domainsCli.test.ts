import { describe, expect, test } from "bun:test"
import { join } from "node:path"

const cliPath = join(import.meta.dir, "../src/cli.ts")

type CliResult = {
  stdout: string
  stderr: string
  exitCode: number
}

type CapturedRequest = {
  method: string
  path: string
  body: unknown
}

async function runCli(args: string[], env: Record<string, string> = {}): Promise<CliResult> {
  const proc = Bun.spawn(["bun", "run", cliPath, ...args], {
    env: { ...process.env, ...env },
    stdout: "pipe",
    stderr: "pipe",
  })
  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ])
  return { stdout, stderr, exitCode }
}

async function withMockMailcow<T>(callback: (baseUrl: string, requests: CapturedRequest[]) => Promise<T>): Promise<T> {
  const requests: CapturedRequest[] = []
  const server = Bun.serve({
    port: 0,
    async fetch(request) {
      const url = new URL(request.url)
      requests.push({
        method: request.method,
        path: url.pathname + url.search,
        body: request.method === "GET" ? undefined : await request.json(),
      })
      if (url.pathname === "/api/v1/get/domain/all") return Response.json([{ domain: "example.com" }])
      if (url.pathname === "/api/v1/add/domain") {
        return Response.json([{ type: "success", msg: ["domain_added", "example.com"] }])
      }
      return Response.json([{ type: "success", msg: "Task completed" }])
    },
  })

  try {
    return await callback(`http://127.0.0.1:${server.port}`, requests)
  } finally {
    await server.stop(true)
  }
}

describe("domainsCli round-trip against a Bun.serve mock", () => {
  test("domains list prints pretty JSON from the mock", async () => {
    await withMockMailcow(async (baseUrl, requests) => {
      const r = await runCli(["domains", "list"], { MAILCOW_BASE_URL: baseUrl, MAILCOW_API_KEY: "k" })
      expect(r.exitCode).toBe(0)
      expect(JSON.parse(r.stdout)).toEqual([{ domain: "example.com" }])
      expect(requests.length).toBe(1)
      const first = requests[0] as CapturedRequest
      expect(first.method).toBe("GET")
      expect(first.path).toBe("/api/v1/get/domain/all")
    })
  })

  test("domains add sends raw attr JSON and prints envelope msgs", async () => {
    await withMockMailcow(async (baseUrl, requests) => {
      const r = await runCli(["domains", "add", "--domain", "example.com"], {
        MAILCOW_BASE_URL: baseUrl,
        MAILCOW_API_KEY: "k",
      })
      expect(r.exitCode).toBe(0)
      expect(JSON.parse(r.stdout)).toEqual(["domain_added example.com"])
      expect(requests.length).toBe(1)
      const first = requests[0] as CapturedRequest
      expect(first.method).toBe("POST")
      expect(first.path).toBe("/api/v1/add/domain")
      expect(first.body).toEqual({ domain: "example.com" })
    })
  })

  test("--help lists the new contexts", async () => {
    const r = await runCli(["--help"])
    expect(r.exitCode).toBe(0)
    for (const context of ["domains", "mailboxes", "aliases", "alias-domains", "resources"]) {
      expect(r.stdout).toContain(context)
    }
  })
})
