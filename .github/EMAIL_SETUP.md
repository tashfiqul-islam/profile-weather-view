# 📧 Email Notification Setup Guide

This guide walks you through setting up email notifications for major
dependency updates.

## 🔐 Required Secrets

You need to configure the following GitHub repository secrets for email
notifications to work:

### 1. EMAIL_USERNAME

Your email address (Gmail recommended for best compatibility)

```text
Example: your-notifications@gmail.com
```

### 2. EMAIL_PASSWORD

- **For Gmail**: Use an App Password (not your regular password)
- **For other providers**: Use your email password or app-specific password

### 3. NOTIFICATION_EMAIL

The email address where you want to receive notifications

```text
Example: admin@yourcompany.com or your-personal@email.com
```

## 🚀 Setup Instructions

### Step 1: Create Gmail App Password (Recommended)

1. **Enable 2FA on Gmail** (required for app passwords)
   - Go to: <https://myaccount.google.com/security>
   - Turn on 2-Step Verification

2. **Generate App Password**
   - Go to: <https://myaccount.google.com/apppasswords>
   - Select "Mail" as the app
   - Select "Other" as the device
   - Name it "GitHub Dependency Notifications"
   - Copy the generated 16-character password

### Step 2: Add GitHub Secrets

1. **Navigate to Repository Settings**

   ```text
   Repository → Settings → Secrets and variables → Actions
   ```

2. **Add Repository Secrets**
   - Click "New repository secret"
   - Add each of the three secrets:

   | Name | Value | Example |
   |------|-------|---------|
   | `EMAIL_USERNAME` | Your Gmail address | `notifications@gmail.com` |
   | `EMAIL_PASSWORD` | Gmail App Password | `abcd efgh ijkl mnop` |
   | `NOTIFICATION_EMAIL` | Where to send alerts | `admin@company.com` |

### Step 3: Test the Setup

1. **Manual Test**
   - Go to: Actions → Major Update Notifications
   - Click "Run workflow"
   - Enable "Test notification system"
   - Run the workflow

2. **Check Email**
   - You should receive a test notification
   - Check spam folder if not in inbox

## 🏥 Alternative Email Providers

### Microsoft Outlook/Hotmail

```yaml
server_address: smtp-mail.outlook.com
server_port: 587
# Use your regular email password or app password
```

### Yahoo Mail

```yaml
server_address: smtp.mail.yahoo.com
server_port: 587
# Use an app password (not regular password)
```

### Custom SMTP Server

```yaml
server_address: smtp.yourdomain.com
server_port: 587 # or 465 for SSL
# Use your SMTP credentials
```

## 🔧 Troubleshooting

### ❌ Authentication Failed

- **Gmail**: Ensure you're using an App Password, not your regular password
- **2FA Required**: Most providers require 2FA to be enabled for app passwords
- **Check Username**: Use the full email address as username

### 📧 Emails Not Arriving

- **Check Spam Folder**: Automated emails often go to spam initially
- **Gmail Filters**: Create a filter for GitHub Actions emails
- **Test Different Recipients**: Try a different email address

### 🔐 Security Considerations

- **Never commit secrets**: Always use GitHub Secrets, never hardcode
- **Use App Passwords**: More secure than regular passwords
- **Rotate Regularly**: Change app passwords periodically

## 📋 Email Template Preview

The system sends HTML emails with:

- 🚨 **Major Update Alerts** with package details
- 📦 **Version Information** (current → latest)
- ⚠️ **Breaking Change Warnings**
- 🔗 **Direct Links** to pull requests
- 📊 **Action Items** checklist

## 🎛️ Customization Options

### Email Frequency

Edit the cron schedule in `major-update-notification.yml`:

```yaml
schedule:
  - cron: '0 3 * * 1'  # Weekly on Monday 3:00 AM UTC
```

### Recipients

Add multiple recipients by separating with commas:

```yaml
to: ${{ secrets.NOTIFICATION_EMAIL }},backup@company.com
```

### SMTP Settings

Modify the email action configuration:

```yaml
- name: "📧 Send Email Notification"
  uses: dawidd6/action-send-mail@v3
  with:
    server_address: smtp.gmail.com
    server_port: 587
    secure: true  # Use TLS
    username: ${{ secrets.EMAIL_USERNAME }}
    password: ${{ secrets.EMAIL_PASSWORD }}
```

## ✅ Verification Checklist

- [ ] Gmail 2FA enabled
- [ ] App password generated
- [ ] All three secrets configured in GitHub
- [ ] Test notification sent successfully
- [ ] Email received (check spam folder)
- [ ] GitHub issue creation working
- [ ] Workflow permissions properly set

---

**Need help?** Check the
[GitHub Actions logs](../../actions) for detailed error messages.
