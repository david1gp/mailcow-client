import { describe, expect, test } from "bun:test"
import pkg from "../package.json" with { type: "json" }
import { PACKAGE_VERSION, mailcowClientConfig, mailcowClientFromEnv, packageVersion } from "../src/index.js"

describe("smoke: package version matches package.json", () => {
  test("PACKAGE_VERSION is set", () => {
    expect(PACKAGE_VERSION).toBe(pkg.version)
    expect(packageVersion).toBe(pkg.version)
  })
})

describe("smoke: mailcowClientConfig accepts valid config", () => {
  test("accepts baseUrl with apiKey", () => {
    const r = mailcowClientConfig({
      baseUrl: "https://email.contentoren.de",
      apiKey: "secret",
    })
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data.baseUrl).toBe("https://email.contentoren.de")
      expect(r.data.apiKey).toBe("secret")
    }
  })

  test("apiKey is optional in the schema", () => {
    const r = mailcowClientConfig({ baseUrl: "https://email.contentoren.de" })
    expect(r.success).toBe(true)
  })
})

describe("smoke: mailcowClientConfig rejects invalid config", () => {
  test("rejects empty baseUrl", () => {
    const r = mailcowClientConfig({ baseUrl: "" })
    expect(r.success).toBe(false)
  })
})

describe("smoke: mailcowClientFromEnv requires MAILCOW_BASE_URL", () => {
  test("errors clearly when MAILCOW_BASE_URL is missing", () => {
    const r = mailcowClientFromEnv({})
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(r.op).toBe("mailcowClientFromEnv")
      expect(r.errorMessage).toContain("MAILCOW_BASE_URL")
    }
  })

  test("loads MAILCOW_ env keys", () => {
    const r = mailcowClientFromEnv({
      MAILCOW_BASE_URL: "https://email.contentoren.de/",
      MAILCOW_API_KEY: "secret",
    })
    expect(r.success).toBe(true)
    if (r.success) {
      expect(r.data.baseUrl).toBe("https://email.contentoren.de")
      expect(r.data.apiKey).toBe("secret")
    }
  })
})
