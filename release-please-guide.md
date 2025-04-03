# Release Please Setup Guide

Follow these steps to implement automated semantic versioning in your project:

## Step 1: Add Required Files

Create the following files in your repository:

1. `.github/workflows/release-please.yml` - Workflow definition
2. `release-please-config.json` - Configuration file
3. `.release-please-manifest.json` - Version tracking manifest
4. `src/docs/.vitepress/meta.json` - Documentation version metadata

## Step 2: Update Package Version

Ensure your `package.json` has the correct version:

```json
{
  "name": "profile-weather-view",
  "version": "2.0.0"
  // rest of package.json
}
```

## Step 3: Set Up GitHub Repository Settings

1. Go to your repository's **Settings** tab
2. Navigate to **Actions** > **General**
3. Under "Workflow permissions":
   - Select "Read and write permissions"
   - Check "Allow GitHub Actions to create and approve pull requests"
4. Click "Save"

## Step 4: Make Initial Commit

```bash
# Create directories if they don't exist
mkdir -p .github/workflows
mkdir -p src/docs/.vitepress

# Add new files
git add .github/workflows/release-please.yml
git add release-please-config.json
git add .release-please-manifest.json
git add src/docs/.vitepress/meta.json
git add package.json

# Commit and push
git commit -m "chore: initialize release please configuration"
git push
```

## Step 5: Verify Workflow

1. Go to the **Actions** tab in your repository
2. You should see the "Release Management" workflow either running or completed
3. On first run, Release Please will initialize without creating a release

## Step 6: Make Semantic Commits

Start making commits with conventional commit prefixes:

- `feat: add new feature` - Triggers a MINOR version bump
- `fix: resolve bug` - Triggers a PATCH version bump
- `feat!: breaking change` or `feat: breaking change\n\nBREAKING CHANGE: description` - Triggers a MAJOR version bump

## How It Works

1. Release Please monitors your commits
2. When appropriate, it creates a Release PR
3. When you merge the Release PR:
   - Version numbers are updated
   - CHANGELOG.md is updated
   - A GitHub release is created with artifacts
   - Tags are added to the repository

## Important Version Information

- **Code Version**: Starts at 2.0.0
- **Documentation Version**: Starts at 1.0.0
- These versions are managed separately but linked via the release process

## Troubleshooting

- **No Release PR Created**: Ensure you're using proper conventional commit messages
- **Workflow Failures**: Check the Actions tab for error details
- **Manual Release**: Use the workflow_dispatch trigger with force_version input

## Additional Resources

- [Release Please Documentation](https://github.com/googleapis/release-please)
- [Conventional Commits](https://www.conventionalcommits.org/)
