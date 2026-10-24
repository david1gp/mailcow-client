type MailcowE2eCleanupAction = () => Promise<void>

export function mailcowE2eCleanup() {
  const actions: MailcowE2eCleanupAction[] = []
  const failures: string[] = []

  return {
    add(action: MailcowE2eCleanupAction): void {
      actions.push(action)
    },
    async run(): Promise<void> {
      const pendingActions = actions.splice(0).reverse()
      for (const action of pendingActions) {
        try {
          await action()
        } catch (error) {
          failures.push(error instanceof Error ? error.message : String(error))
        }
      }
      if (failures.length > 0) {
        throw new Error(`Live E2E cleanup failed (${failures.length}): ${failures.join(" | ")}`)
      }
    },
    leftoverReport(): string[] {
      return [...failures]
    },
  }
}
