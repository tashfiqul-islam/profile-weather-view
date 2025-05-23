# 📦 Dependency Update

## 🔄 Update Details
<!-- Dependabot will automatically update the PR title with the dependency name -->
- **Package**: `{{packageName}}`
- **From version**: `{{currentVersion}}`
- **To version**: `{{newVersion}}`
- **Change type**: `{{type}}` <!-- Will be "version-update:semver-patch", "version-update:semver-minor", or "version-update:semver-major" -->
- **Direct dependency**: <!-- Yes if in your direct dependencies, No if transitive -->
- **Full changelog**: <!-- Dependabot will link to the release notes if available -->

## 🤖 Auto-Detection
<!-- These will be automatically checked by Dependabot based on the update type -->
- [x] This is a {{type}} update <!-- patch/minor/major -->
- [x] Auto-merge is {{#if autoMerge}}enabled{{else}}disabled{{/if}} for this type of change

## 🛡️ Risk Assessment
<!-- These checkboxes help you evaluate each update -->
{{#if isPatch}}
- [x] Low risk (patch update - bug fixes only)
{{else if isMinor}}
- [x] Medium risk (minor update - new features, backwards compatible)
{{else}}
- [x] High risk (major update - breaking changes possible)
{{/if}}

## 🔍 Verification Checklist
<!-- Only check these if you've manually verified them -->
- [ ] I've reviewed the updated dependency's changes
- [ ] Tests pass with these updates
- [ ] The update aligns with project requirements
- [ ] No breaking changes were introduced

## 📝 Additional Notes
<!-- Leave blank for Dependabot to fill with info about the update -->

---
<details>
<summary>Click to expand technical details</summary>

### 📊 Compatibility Score
{{#if compatibilityScore}}
- **Score**: {{compatibilityScore}} <!-- High/Medium/Low if data available -->
- **Based on**: {{compatibilityScoreSource}} <!-- Number of projects successfully upgraded -->
{{else}}
- No compatibility data available for this update
{{/if}}

### 🔗 Related Dependencies
<!-- If this update is part of a group or affects other packages -->

### 📋 System Information
- **Repository**: {{repository}}
- **PR created by**: Dependabot
- **PR created on**: {{date}}
</details>
