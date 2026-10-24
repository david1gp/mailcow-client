import { describe, expect, test } from "bun:test"
import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { mailcowClientApp } from "../src/cli/cliApp.js"

const repoRoot = join(import.meta.dir, "..")
const excludedExports = new Set(["PACKAGE_VERSION"])

function isOperationExport(name: string): boolean {
  if (excludedExports.has(name)) return false
  if (name.endsWith("Schema")) return false
  return true
}

async function readCommandSources(): Promise<readonly { path: string; source: string }[]> {
  const paths: string[] = []
  for await (const path of new Bun.Glob("src/**/cli/*Commands.ts").scan({ cwd: repoRoot })) paths.push(path)
  return Promise.all(paths.map(async (path) => ({ path, source: await readFile(join(repoRoot, path), "utf8") })))
}

type RouteMap = {
  getAllEntries: () => readonly { name: { original: string }; target: RouteTarget }[]
}

type RouteTarget = {
  getAllEntries?: () => readonly { name: { original: string }; target: RouteTarget }[]
  loader?: () => Promise<unknown>
}

async function loadReachableCommands(routeMap: RouteMap, path: string[] = []): Promise<string[]> {
  const commands: string[] = []
  for (const entry of routeMap.getAllEntries()) {
    const entryPath = [...path, entry.name.original]
    if (entry.target.loader !== undefined) {
      expect(typeof entry.target.loader).toBe("function")
      await entry.target.loader()
      commands.push(entryPath.join(" "))
      continue
    }
    if (entry.target.getAllEntries === undefined) throw new Error(`Unreachable route: ${entryPath.join(" ")}`)
    commands.push(...(await loadReachableCommands(entry.target as RouteMap, entryPath)))
  }
  return commands
}

function publicOperations(indexSource: string): readonly string[] {
  const operations: string[] = []
  const exportPattern = /^export \{ ([A-Za-z0-9_]+) \} from "(?!\.\/client\/)(?:[^\"]+)"/gm
  for (const match of indexSource.matchAll(exportPattern)) {
    const operation = match[1]
    if (operation !== undefined && isOperationExport(operation)) operations.push(operation)
  }
  return operations
}

describe("CLI operation coverage", () => {
  test("every public library operation has an explicit reachable CLI command", async () => {
    const [indexSource, commandSources] = await Promise.all([
      readFile(join(repoRoot, "src/index.ts"), "utf8"),
      readCommandSources(),
    ])
    const commandSource = commandSources.map(({ source }) => source).join("\n")
    const operations = publicOperations(indexSource)
    const missingOperations = operations.filter(
      (operation) => !new RegExp(`\\b${operation}\\s*\\(`).test(commandSource),
    )
    const reachableCommands = await loadReachableCommands(mailcowClientApp.root as unknown as RouteMap)

    expect(missingOperations).toEqual([])
    expect(reachableCommands.length).toBeGreaterThan(0)
    expect(reachableCommands).toContain("ratelimits hash-delete")
    expect(reachableCommands).toContain("fail2ban banlist-edit")
    expect(reachableCommands).toContain("logs rspamd-stats")
    expect(reachableCommands).toContain("status identity-provider")
    expect(reachableCommands).toContain("settings self-edit")
    expect(reachableCommands).toContain("fido2 registration-add")
    expect(operations).toContain("ratelimitHashDelete")
    expect(operations).toContain("fail2banBanlistEdit")
    expect(operations).toContain("logList")
    expect(operations).toContain("rspamdStatsGet")
    expect(operations).toContain("identityProviderGet")
    expect(operations).toContain("userSelfEdit")
    expect(operations).toContain("fido2RegistrationAdd")
    expect(operations).toContain("webauthnTfaRegistrationAdd")
  })
})
