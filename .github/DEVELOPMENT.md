# Development Workflow Guide

## Branch Strategy

This project uses a simplified two-branch strategy optimized for solo development:

- `master` - Production branch, always stable and ready for release
- `develop` - Development branch where all work happens

## Automated Workflow

### 1. Daily Development

As a solo developer, simply work on the `develop` branch:

```bash
# Ensure you're on develop branch
git checkout develop

# Make your changes
# ...code...

# Commit changes using conventional commits
git add .
git commit -m "feat: add cool new feature"

# Push to remote
git push origin develop
```

### 2. Automated PR Creation

When you push to `develop`, the workflow automatically:

1. Creates a PR from `develop` to `master` (if one doesn't exist)
2. Updates an existing PR if one already exists
3. Runs validation tests to ensure code quality

### 3. PR Validation

Every PR and subsequent push triggers automated validation:

- Linting
- Type checking
- Unit tests
- Conventional commit format validation

### 4. Merging to Master

When ready to release:

1. Review the PR on GitHub
2. Use the "Squash and merge" option to merge to `master`
3. This will trigger the semantic release workflow

### 5. Automated Release

The semantic release workflow:

- Analyzes commits to determine version bump
- Creates a new release tag
- Generates release notes
- Updates CHANGELOG.md
- Creates a GitHub release

## Best Practices

1. **Always use conventional commits** - These determine your version numbers
   - `feat: add new feature` (minor version bump)
   - `fix: resolve bug` (patch version bump)
   - `feat!: breaking change` (major version bump)

2. **Keep develop and master in sync** - After a PR merge, update develop:

   ```bash
   git checkout develop
   git pull origin master
   git push origin develop
   ```

3. **Check PR status** - Verify all validation checks pass before merging

## Release Notes

Release notes and changelog entries are automatically generated from your commit messages, making high-quality commit messages essential.
