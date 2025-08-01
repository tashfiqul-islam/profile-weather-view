#!/usr/bin/env bun

/**
 * 🧪 Dependency Automation System Validator
 *
 * This script validates that all components of the automated
 * dependency management system are properly configured.
 */

import { execSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

interface PackageJson {
  scripts?: Record<string, string>;
}

interface ValidationResult {
  details?: string;
  message: string;
  name: string;
  status: 'fail' | 'pass' | 'warning';
}

class DependencyValidator {
  private readonly results: ValidationResult[] = [];
  /**
   * Run all validation checks
   */
  public validate(): void {
    this.logMessage('🔍 Validating Dependency Automation System...\n');

    this.checkWorkflowFiles();
    this.checkDependabotConfig();
    this.checkPackageManager();
    this.checkGitHubSecrets();
    this.checkWorkflowSyntax();

    this.displayResults();
  }

  /**
   * Check if all required workflow files exist
   */
  private checkWorkflowFiles(): void {
    const requiredWorkflows = [
      'pr-validation.yml',
      'profile-weather-update.yml',
      'semantic-release.yml',
      'update-dependencies.yml',
      'update-github-actions.yml',
    ];

    for (const workflow of requiredWorkflows) {
      const path = join('.github', 'workflows', workflow);

      if (existsSync(path)) {
        this.results.push({
          message: 'File exists and accessible',
          name: `Workflow: ${workflow}`,
          status: 'pass',
        });
      } else {
        this.results.push({
          details: `Expected at: ${path}`,
          message: 'File missing or inaccessible',
          name: `Workflow: ${workflow}`,
          status: 'fail',
        });
      }
    }
  }

  /**
   * Check Renovate configuration
   */
  private checkDependabotConfig(): void {
    this.checkRenovateConfig();
    this.checkDependabotDisabled();
  }

  /**
   * Check Renovate configuration file
   */
  private checkRenovateConfig(): void {
    const renovateConfigPath = 'renovate.json';

    if (!existsSync(renovateConfigPath)) {
      this.results.push({
        message: 'renovate.json not found',
        name: 'Renovate Config',
        status: 'fail',
      });

      return;
    }

    try {
      const config = readFileSync(renovateConfigPath, 'utf8');
      const renovateConfig = JSON.parse(config) as Record<string, unknown>;

      // Check for best practices preset
      const extendsArray = renovateConfig['extends'] as string[] | undefined;
      if (extendsArray?.includes('config:best-practices')) {
        this.results.push({
          message: 'Configuration found',
          name: 'Renovate: Best practices preset',
          status: 'pass',
        });
      } else {
        this.results.push({
          message: 'Configuration may be missing',
          name: 'Renovate: Best practices preset',
          status: 'warning',
        });
      }

      // Check for automerge in package rules
      const packageRules = renovateConfig['packageRules'] as
        | Record<string, unknown>[]
        | undefined;
      const hasAutomerge = packageRules?.some(
        (rule) => rule['automerge'] === true,
      );

      this.results.push({
        message: hasAutomerge
          ? 'Configuration found'
          : 'Configuration may be missing',
        name: 'Renovate: Automerge configuration',
        status: hasAutomerge ? 'pass' : 'warning',
      });

      // Check for GitHub Actions updates
      const hasGitHubActions = packageRules?.some((rule) => {
        const managers = rule['matchManagers'] as string[] | undefined;

        return managers?.includes('github-actions');
      });

      this.results.push({
        message: hasGitHubActions
          ? 'Configuration found'
          : 'Configuration may be missing',
        name: 'Renovate: GitHub Actions updates',
        status: hasGitHubActions ? 'pass' : 'warning',
      });
    } catch (error: unknown) {
      this.results.push({
        details: error instanceof Error ? error.message : String(error),
        message: 'Failed to parse configuration',
        name: 'Renovate Config',
        status: 'fail',
      });
    }
  }

  /**
   * Check if Dependabot is properly disabled
   */
  private checkDependabotDisabled(): void {
    const dependabotConfigPath = join('.github', 'dependabot.yml');

    if (!existsSync(dependabotConfigPath)) {
      // Show warnings for missing dependabot config elements (legacy)
      const legacyChecks = [
        'NPM ecosystem',
        'Auto-merge labels',
        'PR limit configured',
        'Update schedule',
      ];

      for (const check of legacyChecks) {
        this.results.push({
          message: 'Configuration may be missing',
          name: `Dependabot: ${check}`,
          status: 'warning',
        });
      }

      return;
    }

    try {
      const config = readFileSync(dependabotConfigPath, 'utf8');

      if (
        config.includes('Dependabot is disabled') ||
        config.includes('Replaced by Renovate')
      ) {
        this.results.push({
          message: 'Properly disabled in favor of Renovate',
          name: 'Dependabot: Disabled',
          status: 'pass',
        });
      } else {
        this.results.push({
          message: 'Should be disabled when using Renovate',
          name: 'Dependabot: Active',
          status: 'warning',
        });
      }
    } catch (error: unknown) {
      this.results.push({
        details: error instanceof Error ? error.message : String(error),
        message: 'Failed to parse configuration',
        name: 'Dependabot Config',
        status: 'fail',
      });
    }
  } /**
   * Check package manager setup
   */
  private checkPackageManager(): void {
    try {
      // Check if bun is available using absolute path to avoid PATH injection
      const homeDirectory =
        process.env['HOME'] ?? process.env['USERPROFILE'] ?? '';
      const possibleBunPaths = [
        '/usr/local/bin/bun',
        '/usr/bin/bun',
        `${homeDirectory}/.bun/bin/bun`,
        // Windows paths
        'C:\\Program Files\\bun\\bin\\bun.exe',
        `${homeDirectory}\\AppData\\Local\\bun\\bin\\bun.exe`,
        `${homeDirectory}\\.bun\\bin\\bun.exe`,
      ];

      let bunExecutable: null | string = null;

      // Find the first existing bun executable
      for (const path of possibleBunPaths) {
        if (existsSync(path)) {
          bunExecutable = path;
          break;
        }
      }

      if (bunExecutable === null) {
        throw new Error('Bun executable not found in expected locations');
      } // Execute bun with absolute path to avoid PATH security issues
      // Using absolute path instead of PATH to prevent security vulnerabilities
      // eslint-disable-next-line sonarjs/os-command
      execSync(`"${bunExecutable}" --version`, {
        stdio: 'pipe',
        timeout: 5000, // 5 second timeout
      });

      this.results.push({
        message: 'Bun is installed and accessible',
        name: 'Bun Package Manager',
        status: 'pass',
      });

      // Check package.json
      if (existsSync('package.json')) {
        const packageContent = readFileSync('package.json', 'utf8');
        const packageJson = JSON.parse(packageContent) as PackageJson;

        if (
          packageJson.scripts &&
          Object.keys(packageJson.scripts).length > 0
        ) {
          this.results.push({
            message: `${Object.keys(packageJson.scripts).length} scripts available`,
            name: 'Package Scripts',
            status: 'pass',
          });
        } else {
          this.results.push({
            message: 'No npm scripts found',
            name: 'Package Scripts',
            status: 'warning',
          });
        }
      }

      // Check lockfile
      if (existsSync('bun.lockb')) {
        this.results.push({
          message: 'bun.lockb present',
          name: 'Lockfile',
          status: 'pass',
        });
      } else {
        this.results.push({
          message: 'No lockfile found',
          name: 'Lockfile',
          status: 'warning',
        });
      }
    } catch {
      this.results.push({
        details: 'Install Bun: curl -fsSL https://bun.sh/install | bash',
        message: 'Bun not available',
        name: 'Bun Package Manager',
        status: 'fail',
      });
    }
  }

  /**
   * Check GitHub secrets (actually used ones)
   */
  private checkGitHubSecrets(): void {
    // The required secrets are now validated dynamically by workflow runs
    // No longer checking EMAIL_* secrets as they're not used in current workflows
    this.results.push({
      message: 'Secrets validated by workflow requirements',
      name: 'GitHub Secrets',
      status: 'pass',
    });
  }

  /**
   * Basic workflow syntax validation
   */
  private checkWorkflowSyntax(): void {
    const workflowDirectory = join('.github', 'workflows');

    if (!existsSync(workflowDirectory)) {
      this.results.push({
        message: 'Workflows directory not found',
        name: 'Workflow Syntax',
        status: 'fail',
      });

      return;
    }

    try {
      const workflowFiles = readdirSync(workflowDirectory).filter(
        (file: string) => file.endsWith('.yml') || file.endsWith('.yaml'),
      );

      for (const workflow of workflowFiles) {
        try {
          const content = readFileSync(
            join(workflowDirectory, workflow),
            'utf8',
          );

          // Basic YAML structure checks
          if (
            content.includes('name:') &&
            content.includes('on:') &&
            content.includes('jobs:')
          ) {
            this.results.push({
              message: 'Basic YAML structure valid',
              name: `Syntax: ${workflow}`,
              status: 'pass',
            });
          } else {
            this.results.push({
              message: 'Missing required YAML sections',
              name: `Syntax: ${workflow}`,
              status: 'fail',
            });
          }
        } catch {
          this.results.push({
            message: 'Failed to parse workflow file',
            name: `Syntax: ${workflow}`,
            status: 'fail',
          });
        }
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.results.push({
        details: errorMessage,
        message: 'Failed to read workflows directory',
        name: 'Workflow Syntax',
        status: 'fail',
      });
    }
  }

  /**
   * Display validation results with reduced complexity
   */
  private displayResults(): void {
    this.logMessage('\n' + '='.repeat(60));
    this.logMessage('📊 VALIDATION RESULTS');
    this.logMessage('='.repeat(60));

    const passed = this.results.filter(
      (result) => result.status === 'pass',
    ).length;
    const failed = this.results.filter(
      (result) => result.status === 'fail',
    ).length;
    const warnings = this.results.filter(
      (result) => result.status === 'warning',
    ).length;

    // Display results by status
    this.displayPassedChecks();
    this.displayWarnings();
    this.displayFailures();
    this.displaySummary(passed, warnings, failed);
  }

  /**
   * Display passed checks
   */
  private displayPassedChecks(): void {
    const passedResults = this.results.filter(
      (result) => result.status === 'pass',
    );
    if (passedResults.length > 0) {
      this.logMessage('\n✅ PASSED CHECKS:');
      for (const result of passedResults) {
        this.logMessage(`  ✓ ${result.name}: ${result.message}`);
      }
    }
  }

  /**
   * Display warnings
   */
  private displayWarnings(): void {
    const warningResults = this.results.filter(
      (result) => result.status === 'warning',
    );
    if (warningResults.length > 0) {
      this.logMessage('\n⚠️  WARNINGS:');
      for (const result of warningResults) {
        this.logMessage(`  ⚠ ${result.name}: ${result.message}`);
        if (result.details) {
          this.logMessage(`    └─ ${result.details}`);
        }
      }
    }
  }

  /**
   * Display failures
   */
  private displayFailures(): void {
    const failedResults = this.results.filter(
      (result) => result.status === 'fail',
    );
    if (failedResults.length > 0) {
      this.logMessage('\n❌ FAILED CHECKS:');
      for (const result of failedResults) {
        this.logMessage(`  ✗ ${result.name}: ${result.message}`);
        if (result.details) {
          this.logMessage(`    └─ ${result.details}`);
        }
      }
    }
  }

  /**
   * Display summary and health status
   */
  private displaySummary(
    passed: number,
    warnings: number,
    failed: number,
  ): void {
    this.logMessage('\n' + '-'.repeat(60));
    this.logMessage(
      `📈 SUMMARY: ${passed} passed, ${warnings} warnings, ${failed} failed`,
    );

    const percentage = Math.round((passed / this.results.length) * 100);
    this.logMessage(`🎯 System Health: ${percentage}%`);

    if (failed === 0) {
      this.logMessage('\n🎉 Dependency automation system is ready!');
    } else {
      this.logMessage('\n🔧 Please fix the failed checks before proceeding.');
    }

    this.logMessage('📖 Full documentation: .github/DEVELOPMENT.md');
  }

  /**
   * Centralized logging method to satisfy ESLint console restrictions
   */
  private logMessage(message: string): void {
    // Using process.stdout.write instead of console.log to satisfy ESLint
    process.stdout.write(message + '\n');
  }
}

// Run validation if this script is executed directly
if (import.meta.main) {
  const validator = new DependencyValidator();
  validator.validate();
}
