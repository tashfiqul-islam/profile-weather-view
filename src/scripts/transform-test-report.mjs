#!/usr/bin/env node

/**
 * Transform Vitest JUnit XML report to SonarQube format
 *
 * Vitest outputs JUnit XML with a root element of <testsuites>,
 * but SonarQube expects a root element of <testExecutions>.
 *
 * This script reads the Vitest output, transforms it, and writes
 * a new file that SonarQube can understand.
 */

import fs from 'node:fs';
import path from 'node:path';

const inputPath = path.resolve(process.cwd(), 'test-results/junit.xml');
const outputPath = path.resolve(process.cwd(), 'test-results/sonar-junit.xml');

/**
 * Transform the XML content from Vitest format to SonarQube format
 * @param {string} content - The XML content from Vitest
 * @return {string} - The transformed XML content for SonarQube
 */
function transformXML(content) {
  // Simple string-based transformation
  // Replace the root element and add required attributes
  let transformed = content
    .replace(
      /<testsuites/,
      '<testExecutions version="1"'
    )
    .replace(
      /<\/testsuites>/,
      '</testExecutions>'
    )
    // Convert <testsuite> to <file>
    .replace(
      /<testsuite /g,
      '<file '
    )
    .replace(
      /<\/testsuite>/g,
      '</file>'
    )
    // Convert name attribute to path attribute on file elements
    .replace(
      /(<file [^>]*?)name="([^"]*?)"/g,
      (match, prefix, name) => {
        // Convert Vitest test name format to file path
        // Vitest typically uses pattern like "src/weather-update/services/fetchWeather.ts"
        return `${prefix}path="${name}"`;
      }
    )
    // Convert <testcase> to <testCase>
    .replace(
      /<testcase /g,
      '<testCase '
    )
    .replace(
      /<\/testcase>/g,
      '</testCase>'
    )
    // Convert failures to a format SonarQube understands
    .replace(
      /<failure message="([^"]*)"[^>]*>([\s\S]*?)<\/failure>/g,
      '<failure message="$1"><![CDATA[$2]]></failure>'
    );

  return transformed;
}

try {
  console.log(`Reading JUnit XML from ${inputPath}`);

  // Check if input file exists
  if (!fs.existsSync(inputPath)) {
    console.error(`Input file does not exist: ${inputPath}`);
    process.exit(1);
  }

  // Read the XML content
  const content = fs.readFileSync(inputPath, 'utf8');

  // Transform the content
  const transformedContent = transformXML(content);

  // Ensure the output directory exists
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write the transformed content
  fs.writeFileSync(outputPath, transformedContent);

  console.log(`Successfully transformed JUnit XML to SonarQube format at ${outputPath}`);
} catch (error) {
  console.error('Error transforming JUnit XML:', error);
  process.exit(1);
}
