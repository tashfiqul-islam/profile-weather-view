# Troubleshooting

<br>

<div align="center" style="display: flex; justify-content: center; gap: 5px; flex-wrap: wrap;">
  <img src="https://img.shields.io/badge/Support-Active-success" alt="Support Status">
  <img src="https://img.shields.io/badge/Documentation-Comprehensive-blue" alt="Documentation">
  <img src="https://img.shields.io/badge/Issues-GitHub_Tracker-orange" alt="Issue Tracking">
</div>

<div align="center">
  <p><em>A comprehensive guide to resolving common issues with Profile Weather View</em></p>
</div>

## Table of Contents

- [Environment Issues](#environment-issues)
- [API Integration Issues](#api-integration-issues)
- [GitHub Actions Issues](#github-actions-issues)
- [Development Issues](#development-issues)
- [Advanced Debugging](#advanced-debugging)
- [Getting Help](#getting-help)

## Environment Issues

### Missing API Key

<table>
<tr>
<td width="15%" align="center">🔑</td>
<td>

**Error Message**:

```
❌ Missing required environment variable: OPEN_WEATHER_KEY
```

**Cause**: The application cannot find the OpenWeather API key in your environment variables.

**Solutions**:

1. **Create or verify your `.env` file** in the project root:

   ```
   OPEN_WEATHER_KEY=your_api_key_here
   ```

2. **Check file permissions** to ensure the application can read the `.env` file.

3. **Restart the application** after adding the API key to ensure it's loaded correctly.

4. **Verify the key format** - it should be a string of alphanumeric characters with no quotes.

</td>
</tr>
</table>

### Environment Configuration Issues

<table>
<tr>
<td width="15%" align="center">⚙️</td>
<td>

**Error Message**:

```
[preload.ts] ❌ Missing required environment variable: OPEN_WEATHER_KEY
```

**Cause**: The `preload.ts` utility failed to load or validate environment variables.

**Solutions**:

1. **Check Bun configuration** in `bunfig.toml` to ensure preload is configured correctly:

   ```toml
   preload = ["./src/utils/preload.ts"]
   ```

2. **Verify dotenv installation** by running:

   ```bash
   bun install dotenv --dev
   ```

3. **Debug environment loading** by adding temporary console logs to `preload.ts`.

</td>
</tr>
</table>

## API Integration Issues

### Weather Data Fetch Failed

<table>
<tr>
<td width="15%" align="center">🌦️</td>
<td>

**Error Message**:

```
❌ Weather data fetch failed. Check logs for details.
```

**Causes & Solutions**:

1. **Network Connectivity**

   - Check your internet connection
   - Test if you can access `api.openweathermap.org` in a browser

2. **API Key Issues**

   - Verify your API key is valid and active
   - Try generating a new API key if needed

3. **Rate Limiting**

   - Check if you've exceeded the OpenWeather API free tier limits
   - Consider upgrading your API plan if you're making frequent requests

4. **API Endpoint Changes**
   - Verify the API endpoint in `fetchWeather.ts`:
     ```typescript
     const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${LAT}&lon=${LON}&exclude=minutely,hourly,daily,alerts&appid=${API_KEY}&units=metric`;
     ```

</td>
</tr>
</table>

### Invalid API Response Format

<table>
<tr>
<td width="15%" align="center">📋</td>
<td>

**Error Message**:

```
❌ Invalid API response format: [Zod error details]
```

**Cause**: The API response structure does not match the expected schema defined in `WeatherSchema`.

**Solutions**:

1. **Check API version** - OpenWeather may have updated their API.

2. **Update schema validation** in `fetchWeather.ts`:

   ```typescript
   const WeatherSchema = z.object({
     current: z.object({
       // Updated schema fields to match API response
     }),
   });
   ```

3. **Enable debug logging** to see the full API response:

   ```typescript
   console.log('API response:', JSON.stringify(rawData, null, 2));
   ```

4. **Check OpenWeather documentation** for any announced changes to their API structure.

</td>
</tr>
</table>

## GitHub Actions Issues

### Workflow Execution Failure

<table>
<tr>
<td width="15%" align="center">🔄</td>
<td>

**Issue**: GitHub Actions workflow fails to complete successfully.

**Diagnostic Steps**:

1. **Check workflow logs** in GitHub:

   - Go to your repository → Actions tab
   - Select the failed workflow run
   - Expand the failed step to see detailed logs

2. **Common causes and solutions**:

   | Error                  | Solution                               |
   | ---------------------- | -------------------------------------- |
   | Authentication failure | Verify GitHub token permissions        |
   | Network timeout        | Check if OpenWeather API is accessible |
   | Missing files          | Ensure repository structure is correct |
   | Permission denied      | Check repository access permissions    |

</td>
</tr>
</table>

### README Not Updating

<table>
<tr>
<td width="15%" align="center">📄</td>
<td>

**Issue**: GitHub Actions workflow runs successfully, but README doesn't update.

**Solutions**:

1. **Check for README changes**:

   - The workflow only commits when there are actual changes
   - If the weather data is the same, no update will occur

2. **Verify README format**:

   - Ensure your README has the correct markers for update:
     ```html
     <!-- Hourly Weather Update -->
     <!-- Content goes here -->
     <!-- End of Hourly Weather Update -->
     ```

3. **Check repository paths** in the workflow file:

   ```yaml
   - name: Checkout Personal Repository
     uses: actions/checkout@v4
     with:
       repository: yourusername/your-repository
       path: your-repository
   ```

4. **Verify commit configuration**:
   - Ensure the workflow has permission to commit changes
   - Check the Git configuration for user name and email

</td>
</tr>
</table>

## Development Issues

### Type Checking Errors

<table>
<tr>
<td width="15%" align="center">📝</td>
<td>

**Issue**: TypeScript errors when running `bun run type-check`

**Example Error**:

```
src/services/fetchWeather.ts:42:5 - error TS2322: Type 'string | undefined' is not assignable to type 'string'.
```

**Solutions**:

1. **Fix type assertion issues**:

   - Use proper TypeScript type narrowing:

     ```typescript
     // Before
     const API_KEY = process.env.OPEN_WEATHER_KEY;

     // After
     const API_KEY = process.env.OPEN_WEATHER_KEY ?? '';
     if (!API_KEY) {
       throw new Error('Missing API key');
     }
     ```

2. **Update type definitions**:

   - Ensure types accurately reflect data structures
   - Use more specific types instead of `any`

3. **Check TypeScript configuration** in `tsconfig.json`:
   - Verify `strict` mode settings
   - Check path aliases configuration

</td>
</tr>
</table>

### Testing Failures

<table>
<tr>
<td width="15%" align="center">🧪</td>
<td>

**Issue**: Tests failing when running `bun run test`

**Solutions**:

1. **Check test environment**:

   - Ensure all required mocks are set up
   - Verify environment variables are properly set for tests

2. **Run specific failing tests** to isolate issues:

   ```bash
   bun test src/__tests__/services/fetchWeather.test.ts
   ```

3. **Update test expectations** if code implementation has changed:

   ```typescript
   // Before
   expect(weatherData).toBe(
     `Cloudy|30|${expectedSunrise}|${expectedSunset}|60|03d`,
   );

   // After - if format changed
   expect(weatherData).toContain('Cloudy');
   expect(weatherData).toContain('30');
   ```

4. **Restore mocks** after tests:
   ```typescript
   afterEach(() => {
     vi.restoreAllMocks();
     process.env = originalEnv;
   });
   ```

</td>
</tr>
</table>

## Advanced Debugging

### Debugging Workflow

<table>
<tr>
<td width="15%" align="center">🔍</td>
<td>

Follow this systematic debugging approach for complex issues:

1. **Enable verbose logging**:

   ```typescript
   console.log('Debug - API URL:', url);
   console.log('Debug - API response:', JSON.stringify(response, null, 2));
   ```

2. **Check network requests** using browser developer tools:

   - Test the API endpoint directly
   - Examine request/response headers and body

3. **Isolate components** for testing:

   ```bash
   # Test just the fetch weather function
   bun run src/isolate-fetch.ts
   ```

4. **Use temporary test files** to validate specific functionality without running the entire application.

5. **Review recent changes** that might have introduced regressions:
   ```bash
   git log -p src/services/fetchWeather.ts
   ```

</td>
</tr>
</table>

### Debugging GitHub Actions

<table>
<tr>
<td width="15%" align="center">🔧</td>
<td>

For debugging GitHub Actions workflows:

1. **Enable debug logging** in workflows:

   - Set repository secret `ACTIONS_RUNNER_DEBUG` to `true`
   - Set repository secret `ACTIONS_STEP_DEBUG` to `true`

2. **Use the `workflow_dispatch` trigger** to manually run and test workflows.

3. **Add debug steps** to your workflow:

   ```yaml
   - name: Debug Environment
     run: |
       echo "Working directory: $GITHUB_WORKSPACE"
       echo "Repository: $GITHUB_REPOSITORY"
       echo "Actor: $GITHUB_ACTOR"
       env
   ```

4. **Check workflow artifacts** for any intermediate files or outputs.

</td>
</tr>
</table>

## Getting Help

If you encounter any issues not covered in this guide:

### Reporting Issues

<table>
<tr>
<td width="15%" align="center">🆘</td>
<td>

Please report issues on the GitHub repository with:

1. **A clear description** of the problem
2. **Steps to reproduce** the issue
3. **Expected vs. actual behavior**
4. **Environment information**:
   - Bun version (`bun --version`)
   - Operating system
   - Node.js version (if relevant)
5. **Log outputs** (with sensitive information redacted)
6. **Screenshots** if applicable

Use the issue template when available for a standardized format.

</td>
</tr>
</table>

### Community Resources

<table>
<tr>
<td width="15%" align="center">👥</td>
<td>

- **GitHub Discussions**: For questions and community support
- **Documentation**: Refer to other sections of the documentation for specific guidance
- **Code Examples**: Check the `examples/` directory for demonstration code
- **Related Tools**:
  - [OpenWeather API Documentation](https://openweathermap.org/api)
  - [Bun Documentation](https://bun.sh/docs)
  - [GitHub Actions Documentation](https://docs.github.com/en/actions)

</td>
</tr>
</table>

---

<div align="center">
  <p>
    <strong>Profile Weather View</strong> | Troubleshooting Guide
  </p>
  <p>
    <small>If you've tried these solutions and are still experiencing issues, please open a GitHub issue for assistance.</small>
  </p>
</div>
