export function cliFail(result: unknown): never {
  console.error(JSON.stringify(result))
  process.exit(1)
}
