import { existsSync, realpathSync } from "node:fs"
import { release as osRelease } from "node:os"
import { dirname, relative, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { buildCommand, type CommandContext } from "@stricli/core"
import pkg from "../../package.json" with { type: "json" }
import { PACKAGE_VERSION } from "../client/PACKAGE_VERSION.js"

type VersionFlags = {
  verbose?: boolean
}

type PackageMetadata = {
  name: string
  version: string
  description?: string
  author?: string | { name?: string; url?: string }
  license?: string
  homepage?: string
  repository?: string | { url?: string }
  engines?: Record<string, string>
}

const packageMetadata: PackageMetadata = pkg

function executableResolve(): { entrypoint: string; target?: string } {
  const entrypoint = process.argv[1]
  if (entrypoint === undefined) return { entrypoint: "unavailable" }

  const resolvedEntrypoint = resolve(entrypoint)
  try {
    return { entrypoint: resolvedEntrypoint, target: realpathSync(resolvedEntrypoint) }
  } catch {
    return { entrypoint: resolvedEntrypoint }
  }
}

function installationTypeResolve(executableTarget: string | undefined): string {
  const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..")
  if (existsSync(resolve(packageRoot, ".git"))) return "development checkout"
  if (executableTarget !== undefined && !relative(packageRoot, executableTarget).startsWith(".."))
    return "package installation"
  return "unknown"
}

function authorRender(): string {
  if (typeof packageMetadata.author === "string") return packageMetadata.author
  if (packageMetadata.author === undefined) return "unavailable"
  return [packageMetadata.author.name, packageMetadata.author.url].filter(Boolean).join(" — ") || "unavailable"
}

function projectResolve(): string {
  if (packageMetadata.homepage !== undefined) return packageMetadata.homepage
  if (typeof packageMetadata.repository === "string") return packageMetadata.repository
  return packageMetadata.repository?.url ?? "unavailable"
}

function runtimeResolve(): string {
  if (typeof Bun !== "undefined") return `bun ${Bun.version}`
  return `${process.release.name} ${process.version}`
}

function runtimeRequirementsResolve(): string {
  const engines = packageMetadata.engines
  if (engines === undefined) return "unavailable"

  const requirements = Object.entries(engines)
    .map(([runtime, requirement]) => `${runtime} ${requirement}`)
    .join(", ")
  return requirements || "unavailable"
}

function osReleaseResolve(): string {
  try {
    return osRelease() || "unavailable"
  } catch {
    return "unavailable"
  }
}

function versionOutput(verbose: boolean): string {
  const lines = [PACKAGE_VERSION]
  if (!verbose) return `${lines.join("\n")}\n`

  const executable = executableResolve()
  lines.push(`user agent: ${packageMetadata.name}/${packageMetadata.version}`)
  lines.push(`executable: ${executable.entrypoint}`)
  lines.push(`executable target: ${executable.target ?? "unavailable"}`)
  lines.push(`version: ${packageMetadata.version}`)
  lines.push(`description: ${packageMetadata.description ?? "unavailable"}`)
  lines.push(`author: ${authorRender()}`)
  lines.push(`license: ${packageMetadata.license ?? "unavailable"}`)
  lines.push(`project: ${projectResolve()}`)
  lines.push(`installation type: ${installationTypeResolve(executable.target)}`)
  lines.push(`runtime: ${runtimeResolve()}`)
  lines.push(`runtime requirements: ${runtimeRequirementsResolve()}`)
  lines.push(`platform: ${process.platform} ${process.arch} (OS release ${osReleaseResolve()})`)
  return `${lines.join("\n")}\n`
}

async function versionFunc(this: CommandContext, flags: VersionFlags) {
  this.process.stdout.write(versionOutput(flags.verbose === true))
}

export const versionCommand = buildCommand({
  func: versionFunc,
  parameters: {
    flags: {
      verbose: {
        kind: "boolean",
        optional: true,
        brief: "Include package and runtime details",
      },
    },
  },
  docs: {
    brief: "Print package version",
  },
})
