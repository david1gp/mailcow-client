import type { CommandContext } from "@stricli/core"

export function cliWriteJson(ctx: CommandContext, data: unknown) {
  ctx.process.stdout.write(`${JSON.stringify(data, null, 2)}\n`)
}
