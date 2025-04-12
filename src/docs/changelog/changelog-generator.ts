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

class ChangelogGenerator {
  private changelogPath: string;
  private repoRoot: string;

  constructor(changelogPath: string, repoRoot: string) {
    this.changelogPath = changelogPath;
    this.repoRoot = repoRoot;
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
          return {
            type: parsedCommit.type || 'chore',
            scope: parsedCommit.scope,
            subject: parsedCommit.subject || '',
            body: parsedCommit.body,
            breaking: parsedCommit.notes.some((note) =>
              note.title.toLowerCase().includes('breaking'),
            ),
            date: new Date(date).toISOString(),
            hash,
          };
        } catch (error) {
          console.warn(`Parsing commit failed: ${message}`, error);
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
  const version = process.argv[2] || 'unreleased';
  const changelogPath = path.resolve(process.cwd(), 'src/docs/CHANGELOG.md');
  const repoRoot = process.cwd();

  const generator = new ChangelogGenerator(changelogPath, repoRoot);
  await generator.generateChangelog(version);
}

if (import.meta.main) {
  main().catch(console.error);
}
