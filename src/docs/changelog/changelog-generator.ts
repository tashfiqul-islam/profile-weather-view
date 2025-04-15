#!/usr/bin/env bun

/**
 * Changelog Generation Utility
 * ============================
 *
 * Next-generation changelog management for Profile Weather View
 * Designed for modern, automated documentation workflows
 *
 * @fileoverview Generates and maintains comprehensive changelogs based on
 * conventional commit messages. Supports semantic versioning and categorized
 * change entries. Built for modern TypeScript and Bun environments.
 *
 * @module changelog-generator
 * @version 2.0.0
 * @license MIT
 * @copyright 2025 Profile Weather View Contributors
 */

import * as path from 'path';
import { parse } from '@commitlint/parse';

/**
 * Constants for commit parsing and application configuration
 */
const CONSTANTS = {
  COMMIT_DELIMITERS: {
    START: 'COMMIT_START',
    END: 'COMMIT_END',
  },
  REPO_STATES: {
    MINIMAL: 'minimal',
    STANDARD: 'standard',
    COMPLEX: 'complex',
  },
  DEFAULT_REPO_STATE: 'standard',
};

/**
 * Type definitions for the changelog entries
 */
interface ChangelogEntry {
  type: string;
  scope?: string;
  subject: string;
  body?: string;
  breaking?: boolean;
  date: string;
  hash: string;
}

/**
 * Options for the changelog generator
 */
interface ChangelogOptions {
  debug: boolean;
  force: boolean;
  repoState: string;
}

/**
 * Changelog section mapping interface
 */
interface ChangelogSections {
  [key: string]: ChangelogEntry[];
}

/**
 * Parse and format dates from git commit logs
 * Handles ISO 8601 format and provides fallbacks for invalid dates
 *
 * @param dateString - The date string from git log
 * @returns Parsed date object or current date as fallback
 */
function parseGitDate(dateString: string): Date {
  try {
    // Direct parsing for ISO 8601 format from git log
    const date = new Date(dateString);

    // Validate the parsed date
    if (!isNaN(date.getTime())) {
      return date;
    }

    // If direct parsing fails, try manual parsing for various formats
    // Format expected from git log with --date=iso: "YYYY-MM-DD HH:MM:SS +ZZZZ"
    const parts = dateString.split(' ');
    if (parts.length >= 2) {
      const datePart = parts[0]; // YYYY-MM-DD
      const timePart = parts[1]; // HH:MM:SS
      const timezonePart = parts[2]; // +ZZZZ

      if (datePart && timePart) {
        // Construct ISO 8601 compatible string
        const isoString = `${datePart}T${timePart}${
          timezonePart
            ? timezonePart.replace(/(\+|-)(\d{2})(\d{2})/, '$1$2:$3')
            : ''
        }`;

        const parsedDate = new Date(isoString);
        if (!isNaN(parsedDate.getTime())) {
          return parsedDate;
        }
      }
    }

    throw new Error(`Could not parse date string: ${dateString}`);
  } catch (error) {
    console.error(`Error parsing date "${dateString}":`, error);
    // Return current date as fallback to avoid breaking the changelog generation
    return new Date();
  }
}

/**
 * Validates that the provided repo state is in the list of allowed values
 *
 * @param state - The repository state to validate
 * @returns Valid repo state or default if invalid
 */
function validateRepoState(state: string): string {
  const validStates = Object.values(CONSTANTS.REPO_STATES);
  return validStates.includes(state) ? state : CONSTANTS.DEFAULT_REPO_STATE;
}

/**
 * Changelog Generator class for creating and updating changelogs
 * based on git commit history following conventional commit standards
 */
class ChangelogGenerator {
  private readonly changelogPath: string;
  private readonly repoRoot: string;
  private readonly debug: boolean;
  private readonly options: ChangelogOptions;

  /**
   * Create a new ChangelogGenerator instance
   *
   * @param changelogPath - Path to the changelog file
   * @param repoRoot - Path to the repository root
   * @param options - Generator options
   */
  constructor(
    changelogPath: string,
    repoRoot: string,
    options: ChangelogOptions,
  ) {
    this.changelogPath = changelogPath;
    this.repoRoot = repoRoot;
    this.debug = options.debug;

    // Ensure that repoState is valid
    this.options = {
      ...options,
      repoState: validateRepoState(options.repoState),
    };

    if (this.debug) {
      console.log('ChangelogGenerator initialized with options:', {
        changelogPath,
        repoRoot,
        options: this.options,
      });
    }
  }

  /**
   * Fetch git commit history with comprehensive parsing
   * Uses ISO 8601 date format and handles parsing errors gracefully
   *
   * @returns Array of parsed changelog entries
   * @private
   */
  private async fetchCommitHistory(): Promise<ChangelogEntry[]> {
    // Use custom format with clear separator to avoid parsing issues
    const { START, END } = CONSTANTS.COMMIT_DELIMITERS;
    const gitLogCommand = Bun.spawn(
      [
        'git',
        'log',
        `--pretty=format:${START}%n%H%n%aI%n%s%n%b%n${END}`,
        '--no-merges',
      ],
      {
        cwd: this.repoRoot,
        stdout: 'pipe',
      },
    );

    const output = await new Response(gitLogCommand.stdout).text();

    // Use more reliable commit separators
    const commits = output
      .split(START)
      .filter((commit) => commit.includes(END))
      .map((commit) => {
        const endIndex = commit.indexOf(END);
        return commit.substring(0, endIndex).trim();
      })
      .filter(Boolean);

    if (this.debug) {
      console.log(`Found ${commits.length} commits in the git history`);
      // Debug the first commit to see its format
      if (commits.length > 0) {
        console.log('First commit format sample:');
        console.log(commits[0]?.substring(0, 200) + '...');
      }
    }

    return Promise.all(
      commits.map(async (commitText) => {
        const lines = commitText.split('\n');

        // Need at least 2 lines (hash and date)
        if (lines.length < 2) {
          console.warn(
            `Skipping malformed commit: ${commitText.substring(0, 50)}...`,
          );
          return null;
        }

        const hash = lines[0]?.trim() || '';
        const dateString = lines[1]?.trim() || '';
        const subject = lines[2]?.trim() || '';
        const body = lines.slice(3).join('\n').trim();

        if (!dateString || !hash) {
          console.warn(`Skipping commit: Missing hash or date`);
          return null;
        }

        try {
          // Parse the date
          let date: Date;
          try {
            date = parseGitDate(dateString);

            if (this.debug) {
              console.log(
                `Successfully parsed date: ${dateString} → ${date.toISOString()}`,
              );
            }
          } catch (dateError) {
            console.warn(`Error parsing date "${dateString}":`, dateError);
            date = new Date();
          }

          // Parse the commit message
          try {
            const parsedCommit = await parse(
              subject + (body ? '\n\n' + body : ''),
            );

            if (this.debug) {
              console.log(
                `Successfully parsed commit: ${hash.substring(0, 8)} - ${subject.substring(0, 30)}`,
              );
            }

            return {
              type: parsedCommit.type || 'chore',
              scope: parsedCommit.scope,
              subject: parsedCommit.subject || subject, // Fallback to the original subject
              body: parsedCommit.body || body, // Fallback to the original body
              breaking: parsedCommit.notes.some((note) =>
                note.title.toLowerCase().includes('breaking'),
              ),
              date: date.toISOString(),
              hash,
            };
          } catch (parseError) {
            // If commit message parsing fails, still include it with default values
            console.warn(
              `Error parsing commit message: ${subject}`,
              parseError,
            );
            return {
              type: 'chore',
              subject: subject,
              body: body,
              breaking: false,
              date: date.toISOString(),
              hash,
            };
          }
        } catch (error) {
          console.warn(`Failed to process commit: ${hash}`, error);
          return null;
        }
      }),
    ).then((entries) => entries.filter(Boolean) as ChangelogEntry[]);
  }

  /**
   * Group changelog entries by type for structured output
   *
   * @param entries - Array of changelog entries
   * @returns Grouped entries by section
   * @private
   */
  private groupChangelogEntries(entries: ChangelogEntry[]): ChangelogSections {
    const sections: ChangelogSections = {
      '✨ Features': [],
      '🐛 Bug Fixes': [],
      '📚 Documentation': [],
      '🚀 Performance': [],
      '♻️ Refactoring': [],
      '🔒 Security': [],
      '🧩 Other Changes': [],
    };

    entries.forEach((entry) => {
      switch (entry.type) {
        case 'feat':
          sections['✨ Features']!.push(entry);
          break;
        case 'fix':
          sections['🐛 Bug Fixes']!.push(entry);
          break;
        case 'docs':
          sections['📚 Documentation']!.push(entry);
          break;
        case 'perf':
          sections['🚀 Performance']!.push(entry);
          break;
        case 'refactor':
          sections['♻️ Refactoring']!.push(entry);
          break;
        case 'security':
          sections['🔒 Security']!.push(entry);
          break;
        default:
          sections['🧩 Other Changes']!.push(entry);
      }
    });

    return sections;
  }

  /**
   * Render changelog in modern, readable markdown with enhanced formatting
   *
   * @param groupedEntries - Grouped changelog entries
   * @param version - Version to generate changelog for
   * @returns Formatted changelog content
   * @private
   */
  private renderChangelog(
    groupedEntries: ChangelogSections,
    version: string,
  ): string {
    const releaseDate = new Date().toISOString().split('T')[0];
    let changelogContent = `# Changelog

## [${version}] - ${releaseDate}

`;

    Object.entries(groupedEntries).forEach(([section, entries]) => {
      if (entries.length > 0) {
        changelogContent += `### ${section}\n\n`;
        entries.forEach((entry) => {
          const scopePrefix = entry.scope ? `**${entry.scope}**: ` : '';
          const breakingNote = entry.breaking ? '**BREAKING CHANGE** ' : '';
          changelogContent += `- ${breakingNote}${scopePrefix}${entry.subject}\n`;
        });
        changelogContent += '\n';
      }
    });

    return changelogContent;
  }

  /**
   * Main changelog generation workflow
   * Fetches commit history, groups entries, renders markdown,
   * and saves to the changelog file
   *
   * @param version - Version to generate changelog for
   * @returns Promise that resolves when changelog is generated
   */
  async generateChangelog(version: string): Promise<void> {
    try {
      if (this.debug) {
        console.log(`Generating changelog for version ${version}...`);
        console.log(`Repository state: ${this.options.repoState}`);
        console.log(`Force regeneration: ${this.options.force}`);
      }

      const commits = await this.fetchCommitHistory();

      if (this.debug) {
        console.log(`Processed ${commits.length} valid commits`);
      }

      // Skip changelog generation if no commits found
      if (commits.length === 0) {
        console.warn('No valid commits found, skipping changelog generation');
        return;
      }

      const groupedEntries = this.groupChangelogEntries(commits);
      const newChangelogContent = this.renderChangelog(groupedEntries, version);

      // Preserve existing changelog content with better file handling
      let existingContent = '';
      try {
        existingContent = await Bun.file(this.changelogPath).text();
      } catch (error) {
        console.warn(`No existing changelog found: ${error}`);
        // Ensure parent directories exist
        try {
          const dirPath = path.dirname(this.changelogPath);
          await Bun.spawn(['mkdir', '-p', dirPath], {
            stdio: ['inherit', 'inherit', 'inherit'],
          });
        } catch (mkdirError) {
          console.warn(`Failed to create directory: ${mkdirError}`);
        }
      }

      const finalChangelogContent =
        newChangelogContent + '\n' + existingContent;

      // Write the changelog with proper error handling
      try {
        await Bun.write(this.changelogPath, finalChangelogContent);
        console.log(`✅ Changelog generated for version ${version}`);

        // Log additional information in debug mode
        if (this.debug) {
          console.log(`Changelog saved to: ${this.changelogPath}`);
          console.log(
            `Changelog size: ${finalChangelogContent.length} characters`,
          );

          // Count entries by type
          const entryCounts = Object.entries(groupedEntries)
            .map(([section, entries]) => `${section}: ${entries.length}`)
            .join(', ');
          console.log(`Entry distribution: ${entryCounts}`);
        }
      } catch (writeError) {
        console.error(`❌ Failed to write changelog: ${writeError}`);
        throw writeError;
      }
    } catch (error) {
      console.error('❌ Changelog generation failed:', error);
      process.exit(1);
    }
  }
}

/**
 * Parse command line arguments with type safety
 *
 * @param args - Command line arguments
 * @returns Tuple of version and options
 */
function parseCommandLineArgs(args: string[]): [string, ChangelogOptions] {
  // Default options
  const options: ChangelogOptions = {
    debug: false,
    force: false,
    repoState: CONSTANTS.DEFAULT_REPO_STATE,
  };

  // Get version from first positional argument or use default
  const version = args[0] || 'unreleased';

  // Parse flag options
  options.debug = args.includes('--debug');
  options.force = args.includes('--force');

  // Parse repo-state option with validation
  const repoStateArg = args.find((arg) => arg.startsWith('--repo-state='));
  if (repoStateArg) {
    const splitResult = repoStateArg.split('=');
    if (splitResult.length > 1 && splitResult[1]) {
      // Validate against allowed states
      options.repoState = validateRepoState(splitResult[1]);
    }
  }

  return [version, options];
}

/**
 * Main CLI interface for the changelog generator
 * Parses arguments and invokes the ChangelogGenerator
 */
async function main(): Promise<void> {
  const startTime = performance.now();
  const args = process.argv.slice(2);
  const [version, options] = parseCommandLineArgs(args);

  if (options.debug) {
    console.log('==== Changelog Generator v2.0.0 ====');
    console.log('Debug mode enabled');
    console.log('Command line arguments:', args);
    console.log('Parsed options:', options);
  }

  // Define paths
  const changelogPath = path.resolve(process.cwd(), 'src/docs/CHANGELOG.md');
  const repoRoot = process.cwd();

  // Initialize and run generator
  const generator = new ChangelogGenerator(changelogPath, repoRoot, options);
  await generator.generateChangelog(version);

  if (options.debug) {
    const endTime = performance.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    console.log(`==== Changelog generation completed in ${duration}s ====`);
  }
}

// Run main function if this is the entry point
if (import.meta.main) {
  main().catch((error) => {
    console.error('Fatal error in changelog generator:', error);
    process.exit(1);
  });
}

// Export for testing and module usage
export {
  ChangelogGenerator,
  parseGitDate,
  parseCommandLineArgs,
  validateRepoState,
};
