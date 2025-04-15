#!/usr/bin/env bun

/**
 * Changelog Generation Utility
 *
 * Next-generation changelog management for Profile Weather View
 * Designed for modern, automated documentation workflows
 *
 * @fileoverview Generates and maintains comprehensive changelogs
 * @module changelog-generator
 */

import * as path from 'path';
import { parse } from '@commitlint/parse';

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
 * Parse git date string to handle various formats
 * Specifically handles the ISO format from git log: "YYYY-MM-DD HH:MM:SS +ZZZZ"
 */
function parseGitDate(dateString: string): Date {
  try {
    // Split the date string into components
    const [datePart, timePart, timezonePart] = dateString.split(' ');

    if (!datePart || !timePart) {
      throw new Error(`Invalid date format: ${dateString}`);
    }

    // Format it to an ISO 8601 string that JavaScript can reliably parse
    const isoString = `${datePart}T${timePart}${timezonePart ? timezonePart.replace(/(\+|-)(\d{2})(\d{2})/, '$1$2:$3') : ''}`;
    const date = new Date(isoString);

    if (isNaN(date.getTime())) {
      throw new Error(`Resulting date is invalid: ${isoString}`);
    }

    return date;
  } catch (error) {
    console.error(`Error parsing date "${dateString}":`, error);
    // Return current date as fallback to avoid breaking the changelog generation
    return new Date();
  }
}

class ChangelogGenerator {
  private changelogPath: string;
  private repoRoot: string;
  private debug: boolean;

  constructor(changelogPath: string, repoRoot: string, debug = false) {
    this.changelogPath = changelogPath;
    this.repoRoot = repoRoot;
    this.debug = debug;
  }

  /**
   * Fetch git commit history with comprehensive parsing
   */
  private async fetchCommitHistory(): Promise<ChangelogEntry[]> {
    const gitLogCommand = Bun.spawn(
      [
        'git',
        'log',
        '--pretty=format:%H%n%ad%n%s%n%b%n---COMMIT_SEPARATOR---',
        '--date=iso',
        '--no-merges',
      ],
      {
        cwd: this.repoRoot,
        stdout: 'pipe',
      },
    );

    const output = await new Response(gitLogCommand.stdout).text();
    const commits = output
      .split('---COMMIT_SEPARATOR---')
      .filter((commit) => commit.trim());

    return Promise.all(
      commits.map(async (commitText) => {
        const [hash, date, ...messageParts] = commitText.split('\n');

        // Enhanced error handling for missing date
        if (!date) {
          console.warn(`Skipping commit: Missing date for hash ${hash}`);
          return null;
        }

        const message = messageParts.join('\n').trim();

        try {
          const parsedCommit = await parse(message);

          // Use our improved date parser
          const parsedDate = parseGitDate(date);

          if (this.debug) {
            console.log(
              `Successfully parsed date: ${date} → ${parsedDate.toISOString()}`,
            );
          }

          return {
            type: parsedCommit.type || 'chore',
            scope: parsedCommit.scope,
            subject: parsedCommit.subject || '',
            body: parsedCommit.body,
            breaking: parsedCommit.notes.some((note) =>
              note.title.toLowerCase().includes('breaking'),
            ),
            date: parsedDate.toISOString(),
            hash,
          };
        } catch (error) {
          console.warn(`Parsing commit failed: ${date}\n${message}`, error);
          return null;
        }
      }),
    ).then((entries) => entries.filter(Boolean) as ChangelogEntry[]);
  }

  /**
   * Generate structured changelog sections with type safety
   */
  private groupChangelogEntries(entries: ChangelogEntry[]) {
    const sections: { [key: string]: ChangelogEntry[] } = {
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
   */
  private renderChangelog(
    groupedEntries: ReturnType<typeof this.groupChangelogEntries>,
    version: string,
  ) {
    let changelogContent = `# Changelog

## [${version}] - ${new Date().toISOString().split('T')[0]}

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
   * @param version Version to generate changelog for
   */
  async generateChangelog(version: string) {
    try {
      const commits = await this.fetchCommitHistory();

      if (this.debug) {
        console.log(`Processed ${commits.length} valid commits`);
      }

      const groupedEntries = this.groupChangelogEntries(commits);
      const newChangelogContent = this.renderChangelog(groupedEntries, version);

      // Preserve existing changelog content with better file handling
      let existingContent = '';
      try {
        existingContent = await Bun.file(this.changelogPath).text();
      } catch (error) {
        console.warn(`No existing changelog found: ${error}`);
      }

      const finalChangelogContent =
        newChangelogContent + '\n' + existingContent;

      // Bun.write automatically creates parent directories if they don't exist.
      await Bun.write(this.changelogPath, finalChangelogContent);
      console.log(`✅ Changelog generated for version ${version}`);
    } catch (error) {
      console.error('❌ Changelog generation failed:', error);
      process.exit(1);
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);

  // Basic argument parsing
  const version = args[0] || 'unreleased';
  const options = {
    debug: args.includes('--debug'),
    force: args.includes('--force'),
    repoState: 'standard', // Default value
  };

  // Parse repo-state if provided
  const repoStateArg = args.find((arg) => arg.startsWith('--repo-state='));
  if (repoStateArg) {
    const splitResult = repoStateArg.split('=');
    // Ensure we have a value after the equals sign
    if (splitResult.length > 1) {
      options.repoState = splitResult[1] || 'standard';
    }
  }

  if (options.debug) {
    console.log('Debug mode enabled');
    console.log('Options:', options);
  }

  const changelogPath = path.resolve(process.cwd(), 'src/docs/CHANGELOG.md');
  const repoRoot = process.cwd();

  const generator = new ChangelogGenerator(
    changelogPath,
    repoRoot,
    options.debug,
  );
  await generator.generateChangelog(version);
}

if (import.meta.main) {
  main().catch(console.error);
}
