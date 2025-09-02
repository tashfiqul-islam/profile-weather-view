import type { Reporter } from "vitest/reporters";

export default class BannersReporter implements Reporter {
  onTestRunStart(): void {
    process.stdout.write("🧪 Setting up test environment...\n\n");
  }

  onTestRunEnd(): void {
    process.stdout.write("\n🧹 Cleaning up test environment...\n");
  }
}
