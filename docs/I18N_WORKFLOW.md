# 🌍 Translation Workflow Guide

This guide explains how to work with translations in the Duely application.

## 📋 Table of Contents

- [Overview](#overview)
- [Translation System Architecture](#translation-system-architecture)
- [Adding New Translations](#adding-new-translations)
- [Using Translations in Components](#using-translations-in-components)
- [Variable Interpolation](#variable-interpolation)
- [Testing Translations](#testing-translations)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## Overview

Duely uses a custom i18n implementation built with React Context and hooks. The system supports:

- ✅ Multiple languages (currently EN and ID)
- ✅ Real-time language switching
- ✅ Database persistence
- ✅ Variable interpolation
- ✅ TypeScript support
- ✅ Server and Client components

**Current Status:**
- 405 translation keys
- 2 languages (English, Indonesian)
- 16 translation categories
- 100% coverage across all pages and components

---

## Translation System Architecture

### File Structure

```
src/
├── locales/
│   ├── en.json                 # English translations
│   └── id.json                 # Indonesian translations
├── lib/
│   └── i18n/
│       ├── config.ts           # Language configuration
│       ├── hooks.ts            # Translation hooks
│       └── utils.ts            # Translation utilities
├── contexts/
│   └── LanguageContext.tsx     # Language state management
└── components/
    └── providers/
        └── language-sync-provider.tsx  # Database sync
```

### Key Components

1. **LanguageContext** - Global language state
2. **useTranslations()** - Hook to access translation function
3. **useLanguage()** - Hook to access language state and setter
4. **LanguageSyncProvider** - Syncs language with database

---

## Adding New Translations

### Step 1: Add Keys to Translation Files

Translation keys are organized by feature/page. Add your new keys to **both** `en.json` and `id.json`.

#### Example: Adding Dashboard Keys

**src/locales/en.json**
```json
{
  "dashboard": {
    "title": "Dashboard",
    "welcome": "Welcome back, {name}!",
    "monthlySpending": "Monthly Spending",
    "activeSubscriptions": "Active Subscriptions",
    "noData": "No data available"
  }
}
```

**src/locales/id.json**
```json
{
  "dashboard": {
    "title": "Dasbor",
    "welcome": "Selamat datang kembali, {name}!",
    "monthlySpending": "Pengeluaran Bulanan",
    "activeSubscriptions": "Langganan Aktif",
    "noData": "Tidak ada data"
  }
}
```

### Step 2: Maintain Key Parity

**CRITICAL**: Every key in `en.json` **must** have a corresponding key in `id.json` and vice versa.

Use our verification script to check:

```bash
node phase9-test.js
```

This will report any missing keys or parity issues.

### Step 3: Naming Conventions

Follow these naming conventions:

- Use **camelCase** for all keys
- Use **dot notation** for nested keys
- Be descriptive but concise

**Good Examples:**
```
dashboard.title
subscriptions.addNew
categories.deleteConfirmation
settings.languagePreference
```

**Bad Examples:**
```
dash_title          # Use camelCase, not snake_case
subscriptions.btn   # Too abbreviated
cat1                # Not descriptive
```

### Step 4: Organize by Category

Current categories:
- `common` - Shared UI elements (buttons, actions)
- `nav` - Navigation items
- `auth` - Authentication pages
- `dashboard` - Dashboard page
- `subscriptions` - Subscriptions management
- `subscriptionForm` - Subscription forms
- `categories` - Categories management
- `categoryForm` - Category forms
- `members` - Members management
- `memberForm` - Member forms
- `analytics` - Analytics page
- `settings` - Settings page
- `notifications` - Notifications system
- `errors` - Error messages
- `validation` - Form validation messages
- `footer` - Footer content

Add new keys to the appropriate category, or create a new category if needed.

---

## Using Translations in Components

### Client Components

For client components (with `"use client"` directive):

```tsx
"use client";

import { useTranslations } from "@/lib/i18n/hooks";

export function MyClientComponent() {
  const t = useTranslations();

  return (
    <div>
      <h1>{t('dashboard.title')}</h1>
      <p>{t('dashboard.welcome', { name: 'John' })}</p>
      <button>{t('common.save')}</button>
    </div>
  );
}
```

### Server Components with Client Wrapper

For server components that need translations, create a client wrapper:

**page.tsx (Server Component)**
```tsx
import { MyClientComponent } from "@/components/MyClientComponent";

export default async function Page() {
  // Fetch data on server
  const data = await fetchData();

  // Pass data to client component
  return <MyClientComponent data={data} />;
}
```

**MyClientComponent.tsx (Client Component)**
```tsx
"use client";

import { useTranslations } from "@/lib/i18n/hooks";

export function MyClientComponent({ data }) {
  const t = useTranslations();

  return (
    <div>
      <h1>{t('page.title')}</h1>
      <p>{t('page.description')}</p>
    </div>
  );
}
```

### In Forms

```tsx
"use client";

import { useTranslations } from "@/lib/i18n/hooks";
import { useForm } from "react-hook-form";

export function MyForm() {
  const t = useTranslations();
  const form = useForm();

  return (
    <form>
      <label>{t('form.emailLabel')}</label>
      <input
        type="email"
        placeholder={t('form.emailPlaceholder')}
      />
      <button type="submit">{t('common.submit')}</button>
    </form>
  );
}
```

### In Toast Notifications

```tsx
import { toast } from "sonner";
import { useTranslations } from "@/lib/i18n/hooks";

export function MyComponent() {
  const t = useTranslations();

  const handleSave = () => {
    try {
      // Save logic
      toast.success(t('notifications.saveSuccess'));
    } catch (error) {
      toast.error(t('errors.saveFailed'));
    }
  };

  return <button onClick={handleSave}>{t('common.save')}</button>;
}
```

---

## Variable Interpolation

### Basic Interpolation

Use `{variableName}` syntax in translation strings:

**Translation Files:**
```json
{
  "welcome": "Welcome, {name}!",
  "itemCount": "You have {count} items"
}
```

**Usage:**
```tsx
const t = useTranslations();

<p>{t('welcome', { name: 'John' })}</p>
<p>{t('itemCount', { count: 5 })}</p>
```

### Multiple Variables

```json
{
  "subscription": "{service} costs ${amount} per {frequency}"
}
```

```tsx
<p>{t('subscription', {
  service: 'Netflix',
  amount: '12.99',
  frequency: 'month'
})}</p>
```

### Variable Naming

Variables must:
- Use same names in EN and ID files
- Be surrounded by curly braces `{}`
- Use camelCase naming

**Example:**
```json
// ✅ Good
"deleteConfirm": "Delete \"{name}\"? This cannot be undone."

// ❌ Bad
"deleteConfirm": "Delete {Name}? This cannot be undone."  // Capital N
"deleteConfirm": "Delete {item_name}? ..."                // snake_case
```

---

## Testing Translations

### Automated Testing

Run our comprehensive test suite:

```bash
# Full translation verification
node phase9-test.js

# Phase 2 re-verification
node phase2-verify.js
```

These scripts check:
- ✅ JSON validity
- ✅ Key parity (EN vs ID)
- ✅ Empty values
- ✅ Variable interpolation consistency
- ✅ Duplicate keys
- ✅ Translation coverage

### Manual Testing

1. **Build Test**
   ```bash
   npm run build
   ```
   Ensure build completes without errors.

2. **TypeScript Test**
   ```bash
   npx tsc --noEmit
   ```
   Ensure no type errors.

3. **Visual Test**
   - Switch between English and Indonesian in Settings
   - Navigate to all pages
   - Test all forms and interactions
   - Verify toast notifications
   - Check mobile responsiveness

### Testing Checklist

When adding new translations:

- [ ] Keys added to both `en.json` and `id.json`
- [ ] Key names follow camelCase convention
- [ ] Keys organized in appropriate category
- [ ] Variable interpolation matches between EN and ID
- [ ] No empty or null values
- [ ] Translation is natural and culturally appropriate
- [ ] Tested in both languages
- [ ] Build completes successfully
- [ ] TypeScript check passes
- [ ] Verification script passes

---

## Best Practices

### 1. Never Hardcode Strings

❌ **Bad:**
```tsx
<button>Save Changes</button>
<p>Welcome to the dashboard</p>
```

✅ **Good:**
```tsx
const t = useTranslations();
<button>{t('common.save')}</button>
<p>{t('dashboard.welcome')}</p>
```

### 2. Use Descriptive Keys

❌ **Bad:**
```json
{
  "btn1": "Save",
  "msg": "Success",
  "txt": "Hello"
}
```

✅ **Good:**
```json
{
  "common.save": "Save",
  "notifications.saveSuccess": "Successfully saved",
  "dashboard.welcome": "Hello"
}
```

### 3. Group Related Keys

✅ **Good:**
```json
{
  "subscriptions": {
    "title": "Subscriptions",
    "addNew": "Add Subscription",
    "edit": "Edit Subscription",
    "delete": "Delete Subscription",
    "deleteConfirm": "Are you sure?"
  }
}
```

### 4. Keep Translations Concise

Translations should be:
- Clear and concise
- Action-oriented for buttons
- Descriptive for labels
- Helpful for error messages

### 5. Use Common Keys for Repeated Text

Create keys in the `common` category for frequently used text:

```json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "add": "Add",
    "close": "Close",
    "confirm": "Confirm",
    "loading": "Loading...",
    "error": "Error",
    "success": "Success"
  }
}
```

### 6. Handle Pluralization

For simple plurals, use interpolation:

```json
{
  "itemCount": "{count} item(s)",
  "subscriptionCount": "{count} subscription(s)"
}
```

For complex plurals, create separate keys:

```json
{
  "itemSingular": "1 item",
  "itemPlural": "{count} items"
}
```

### 7. Maintain Translation Quality

**English:**
- Use clear, professional language
- Follow standard grammar rules
- Use active voice when possible

**Indonesian:**
- Use proper Bahasa Indonesia
- Avoid slang or colloquialisms
- Use formal register for business context
- Ensure culturally appropriate phrasing

---

## Troubleshooting

### Problem: Translation Not Appearing

**Symptoms:** Key appears as-is instead of translated text

**Solutions:**
1. Check key exists in both `en.json` and `id.json`
2. Verify key spelling (case-sensitive)
3. Check component is using `useTranslations()` hook
4. Ensure component is a client component if using hooks
5. Restart dev server

### Problem: Build Fails After Adding Translations

**Symptoms:** Build errors after modifying translation files

**Solutions:**
1. Validate JSON syntax:
   ```bash
   node -e "JSON.parse(require('fs').readFileSync('src/locales/en.json'))"
   node -e "JSON.parse(require('fs').readFileSync('src/locales/id.json'))"
   ```
2. Check for trailing commas
3. Check for missing quotes
4. Run verification script: `node phase9-test.js`

### Problem: Variable Interpolation Not Working

**Symptoms:** Shows `{variable}` instead of value

**Solutions:**
1. Ensure passing second argument to `t()`:
   ```tsx
   t('key', { variable: value })
   ```
2. Check variable name matches between translation and code
3. Verify variable is not undefined

### Problem: Key Parity Mismatch

**Symptoms:** Verification script reports parity errors

**Solutions:**
1. Run `node phase9-test.js` to see missing keys
2. Add missing keys to appropriate file
3. Ensure exact key path matches
4. Re-run verification to confirm fix

### Problem: Language Not Switching

**Symptoms:** Language selection doesn't change UI

**Solutions:**
1. Check LanguageProvider wraps app in layout.tsx
2. Verify LanguageSyncProvider is present
3. Check Settings page calls `setLocale()`
4. Clear localStorage and re-login
5. Check browser console for errors

---

## Quick Reference

### Common Translation Patterns

```tsx
// Simple translation
{t('key')}

// With variable
{t('key', { variable: value })}

// In button
<button>{t('common.save')}</button>

// In placeholder
<input placeholder={t('form.placeholder')} />

// In toast
toast.success(t('notifications.success'))

// In dialog
<DialogTitle>{t('dialog.title')}</DialogTitle>

// In label
<label>{t('form.label')}</label>

// With multiple variables
{t('key', { var1: value1, var2: value2 })}
```

### Hooks Reference

```tsx
// Get translation function
const t = useTranslations();

// Get current locale
const { locale } = useLanguage();

// Change locale
const { setLocale } = useLanguage();
setLocale('id'); // Switch to Indonesian

// Get both locale and setter
const { locale, setLocale } = useLanguage();
```

---

## Resources

- [Main Implementation Tracker](../../I18N_IMPLEMENTATION_TRACKER.md)
- [Translation Guide for Developers](./TRANSLATION_GUIDE.md)
- [Phase 9 Testing Report](../PHASE9_REPORT.md)
- [Phase 2 Verification Report](../PHASE2_REVERIFICATION_REPORT.md)

---

## Need Help?

If you encounter issues:

1. Check this workflow guide
2. Run verification scripts
3. Check implementation tracker for phase details
4. Review existing code for examples
5. Open an issue on GitHub

---

**Last Updated:** 2025-11-02
**Translation System Version:** 1.0 (405 keys)
**Supported Languages:** English (en), Indonesian (id)
