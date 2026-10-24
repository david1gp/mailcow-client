#!/usr/bin/env bun
import { run } from "@stricli/core"
import { mailcowClientApp } from "./cli/cliApp.js"

await run(mailcowClientApp, process.argv.slice(2), { process })
