# 📘 Translation Guide for Developers

A comprehensive guide for developers working with translations in Duely.

## 🎯 Quick Start

### For Impatient Developers

```tsx
// 1. Import the hook
import { useTranslations } from "@/lib/i18n/hooks";

// 2. Use in component
const t = useTranslations();

// 3. Translate text
<h1>{t('dashboard.title')}</h1>
<p>{t('dashboard.welcome', { name: user.name })}</p>
```

**Done!** Now add the keys to `src/locales/en.json` and `src/locales/id.json`.

---

## 📚 Table of Contents

1. [Basic Usage](#basic-usage)
2. [Advanced Patterns](#advanced-patterns)
3. [Real-World Examples](#real-world-examples)
4. [Common Scenarios](#common-scenarios)
5. [Error Handling](#error-handling)
6. [Performance Tips](#performance-tips)
7. [Migration Guide](#migration-guide)

---

## Basic Usage

### Simple Translation

**Translation Files:**
```json
// en.json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel"
  }
}

// id.json
{
  "common": {
    "save": "Simpan",
    "cancel": "Batal"
  }
}
```

**Component:**
```tsx
"use client";

import { useTranslations } from "@/lib/i18n/hooks";

export function SaveButton() {
  const t = useTranslations();

  return (
    <button onClick={handleSave}>
      {t('common.save')}
    </button>
  );
}
```

### With Variables

**Translation Files:**
```json
// en.json
{
  "dashboard": {
    "greeting": "Hello, {name}!",
    "subscriptionCount": "You have {count} active subscriptions"
  }
}

// id.json
{
  "dashboard": {
    "greeting": "Halo, {name}!",
    "subscriptionCount": "Anda memiliki {count} langganan aktif"
  }
}
```

**Component:**
```tsx
export function Dashboard({ user, subscriptions }) {
  const t = useTranslations();

  return (
    <div>
      <h1>{t('dashboard.greeting', { name: user.name })}</h1>
      <p>{t('dashboard.subscriptionCount', { count: subscriptions.length })}</p>
    </div>
  );
}
```

---

## Advanced Patterns

### Nested Translation Keys

**Translation Files:**
```json
{
  "subscriptions": {
    "table": {
      "headers": {
        "name": "Service Name",
        "amount": "Amount",
        "frequency": "Frequency"
      },
      "actions": {
        "edit": "Edit",
        "delete": "Delete",
        "renew": "Renew"
      }
    }
  }
}
```

**Component:**
```tsx
export function SubscriptionsTable() {
  const t = useTranslations();

  return (
    <table>
      <thead>
        <tr>
          <th>{t('subscriptions.table.headers.name')}</th>
          <th>{t('subscriptions.table.headers.amount')}</th>
          <th>{t('subscriptions.table.headers.frequency')}</th>
        </tr>
      </thead>
      <tbody>
        {/* ... */}
      </tbody>
    </table>
  );
}
```

### Dynamic Keys (Avoid This)

❌ **Bad Practice:**
```tsx
// DON'T DO THIS - Dynamic keys are not type-safe
const status = 'active';
<span>{t(`subscriptions.status.${status}`)}</span>
```

✅ **Good Practice:**
```tsx
// Use a lookup object instead
const statusTranslations = {
  active: t('subscriptions.status.active'),
  paused: t('subscriptions.status.paused'),
  canceled: t('subscriptions.status.canceled'),
};

<span>{statusTranslations[status]}</span>
```

### Conditional Translations

```tsx
export function SubscriptionCard({ subscription }) {
  const t = useTranslations();

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return t('subscriptions.status.active');
      case 'trial':
        return t('subscriptions.status.trial');
      case 'paused':
        return t('subscriptions.status.paused');
      case 'canceled':
        return t('subscriptions.status.canceled');
      default:
        return status;
    }
  };

  return (
    <Badge>{getStatusText(subscription.status)}</Badge>
  );
}
```

---

## Real-World Examples

### Example 1: Form with Validation

**Translation Files:**
```json
{
  "subscriptionForm": {
    "title": "Add Subscription",
    "serviceName": "Service Name",
    "serviceNamePlaceholder": "e.g., Netflix, Spotify",
    "amount": "Amount",
    "amountPlaceholder": "0.00",
    "submit": "Save Subscription",
    "cancel": "Cancel"
  },
  "validation": {
    "serviceNameRequired": "Service name is required",
    "amountRequired": "Amount is required",
    "amountMin": "Amount must be greater than 0"
  },
  "notifications": {
    "subscriptionAdded": "Subscription added successfully",
    "subscriptionFailed": "Failed to add subscription"
  }
}
```

**Component:**
```tsx
"use client";

import { useTranslations } from "@/lib/i18n/hooks";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export function SubscriptionForm() {
  const t = useTranslations();
  const form = useForm();

  const onSubmit = async (data) => {
    try {
      await addSubscription(data);
      toast.success(t('notifications.subscriptionAdded'));
    } catch (error) {
      toast.error(t('notifications.subscriptionFailed'));
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <DialogTitle>{t('subscriptionForm.title')}</DialogTitle>

      <div>
        <label>{t('subscriptionForm.serviceName')}</label>
        <input
          {...form.register('serviceName', {
            required: t('validation.serviceNameRequired')
          })}
          placeholder={t('subscriptionForm.serviceNamePlaceholder')}
        />
        {form.errors.serviceName && (
          <span>{form.errors.serviceName.message}</span>
        )}
      </div>

      <div>
        <label>{t('subscriptionForm.amount')}</label>
        <input
          type="number"
          {...form.register('amount', {
            required: t('validation.amountRequired'),
            min: {
              value: 0.01,
              message: t('validation.amountMin')
            }
          })}
          placeholder={t('subscriptionForm.amountPlaceholder')}
        />
      </div>

      <div className="flex gap-2">
        <button type="submit">{t('subscriptionForm.submit')}</button>
        <button type="button">{t('subscriptionForm.cancel')}</button>
      </div>
    </form>
  );
}
```

### Example 2: Confirmation Dialog

**Translation Files:**
```json
{
  "categories": {
    "deleteTitle": "Delete Category",
    "deleteConfirmation": "This will delete the category \"{name}\" and all associated data. This action cannot be undone.",
    "deleteButton": "Delete Category",
    "cancelButton": "Cancel"
  },
  "notifications": {
    "categoryDeleted": "Category deleted successfully",
    "categoryDeleteFailed": "Failed to delete category"
  }
}
```

**Component:**
```tsx
"use client";

import { useTranslations } from "@/lib/i18n/hooks";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function DeleteCategoryDialog({ category, open, onOpenChange }) {
  const t = useTranslations();

  const handleDelete = async () => {
    try {
      await deleteCategory(category.id);
      toast.success(t('notifications.categoryDeleted'));
      onOpenChange(false);
    } catch (error) {
      toast.error(t('notifications.categoryDeleteFailed'));
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogTitle>
          {t('categories.deleteTitle')}
        </AlertDialogTitle>
        <AlertDialogDescription>
          {t('categories.deleteConfirmation', { name: category.name })}
        </AlertDialogDescription>
        <div className="flex gap-2">
          <button onClick={handleDelete}>
            {t('categories.deleteButton')}
          </button>
          <button onClick={() => onOpenChange(false)}>
            {t('categories.cancelButton')}
          </button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

### Example 3: Data Table with Actions

**Translation Files:**
```json
{
  "subscriptions": {
    "title": "Subscriptions",
    "loading": "Loading subscriptions...",
    "noSubscriptions": "No subscriptions found",
    "addNew": "Add Subscription"
  },
  "subscriptionsTable": {
    "service": "Service",
    "amount": "Amount",
    "frequency": "Frequency",
    "nextBilling": "Next Billing",
    "actions": "Actions",
    "edit": "Edit",
    "delete": "Delete",
    "markRenewed": "Mark as Renewed"
  }
}
```

**Component:**
```tsx
"use client";

import { useTranslations } from "@/lib/i18n/hooks";

export function SubscriptionsPage({ subscriptions, isLoading }) {
  const t = useTranslations();

  if (isLoading) {
    return <p>{t('subscriptions.loading')}</p>;
  }

  if (subscriptions.length === 0) {
    return (
      <div>
        <p>{t('subscriptions.noSubscriptions')}</p>
        <button>{t('subscriptions.addNew')}</button>
      </div>
    );
  }

  return (
    <div>
      <h1>{t('subscriptions.title')}</h1>

      <table>
        <thead>
          <tr>
            <th>{t('subscriptionsTable.service')}</th>
            <th>{t('subscriptionsTable.amount')}</th>
            <th>{t('subscriptionsTable.frequency')}</th>
            <th>{t('subscriptionsTable.nextBilling')}</th>
            <th>{t('subscriptionsTable.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {subscriptions.map(sub => (
            <tr key={sub.id}>
              <td>{sub.serviceName}</td>
              <td>${sub.amount}</td>
              <td>{sub.frequency}</td>
              <td>{formatDate(sub.nextBillingDate)}</td>
              <td>
                <button>{t('subscriptionsTable.edit')}</button>
                <button>{t('subscriptionsTable.markRenewed')}</button>
                <button>{t('subscriptionsTable.delete')}</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### Example 4: Settings Page with Language Selector

**Translation Files:**
```json
{
  "settings": {
    "title": "Settings",
    "language": "Language",
    "languageDescription": "Select your preferred language",
    "english": "English",
    "indonesian": "Indonesia",
    "currency": "Default Currency",
    "save": "Save Settings",
    "reset": "Reset to Defaults"
  },
  "notifications": {
    "settingsSaved": "Settings saved successfully",
    "settingsSaveFailed": "Failed to save settings"
  }
}
```

**Component:**
```tsx
"use client";

import { useTranslations } from "@/lib/i18n/hooks";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

export function SettingsPage() {
  const t = useTranslations();
  const { locale, setLocale } = useLanguage();

  const handleSave = async () => {
    try {
      await saveSettings({ locale });
      toast.success(t('notifications.settingsSaved'));
    } catch (error) {
      toast.error(t('notifications.settingsSaveFailed'));
    }
  };

  return (
    <div>
      <h1>{t('settings.title')}</h1>

      <div>
        <label>{t('settings.language')}</label>
        <p className="text-sm text-muted">
          {t('settings.languageDescription')}
        </p>
        <select
          value={locale}
          onChange={(e) => setLocale(e.target.value)}
        >
          <option value="en">{t('settings.english')}</option>
          <option value="id">{t('settings.indonesian')}</option>
        </select>
      </div>

      <div>
        <label>{t('settings.currency')}</label>
        <select>
          <option value="USD">USD</option>
          <option value="IDR">IDR</option>
        </select>
      </div>

      <div className="flex gap-2">
        <button onClick={handleSave}>{t('settings.save')}</button>
        <button>{t('settings.reset')}</button>
      </div>
    </div>
  );
}
```

---

## Common Scenarios

### Scenario 1: Adding a New Page

1. **Create translation keys:**

```json
// en.json
{
  "newFeature": {
    "title": "New Feature",
    "description": "Description of the new feature",
    "action": "Get Started"
  }
}

// id.json
{
  "newFeature": {
    "title": "Fitur Baru",
    "description": "Deskripsi fitur baru",
    "action": "Mulai"
  }
}
```

2. **Create the page component:**

```tsx
"use client";

import { useTranslations } from "@/lib/i18n/hooks";

export default function NewFeaturePage() {
  const t = useTranslations();

  return (
    <div>
      <h1>{t('newFeature.title')}</h1>
      <p>{t('newFeature.description')}</p>
      <button>{t('newFeature.action')}</button>
    </div>
  );
}
```

3. **Test in both languages**

### Scenario 2: Adding Dropdown Options

**Translation Files:**
```json
{
  "subscriptionForm": {
    "frequency": "Billing Frequency",
    "selectFrequency": "Select frequency",
    "monthly": "Monthly",
    "yearly": "Yearly",
    "quarterly": "Quarterly",
    "weekly": "Weekly"
  }
}
```

**Component:**
```tsx
export function FrequencySelect() {
  const t = useTranslations();

  const frequencies = [
    { value: 'monthly', label: t('subscriptionForm.monthly') },
    { value: 'yearly', label: t('subscriptionForm.yearly') },
    { value: 'quarterly', label: t('subscriptionForm.quarterly') },
    { value: 'weekly', label: t('subscriptionForm.weekly') },
  ];

  return (
    <select>
      <option value="">{t('subscriptionForm.selectFrequency')}</option>
      {frequencies.map(freq => (
        <option key={freq.value} value={freq.value}>
          {freq.label}
        </option>
      ))}
    </select>
  );
}
```

### Scenario 3: Error Messages

**Translation Files:**
```json
{
  "errors": {
    "generic": "An unexpected error occurred",
    "networkError": "Network error. Please check your connection.",
    "unauthorized": "You are not authorized to perform this action",
    "notFound": "The requested resource was not found",
    "validationError": "Please check your input and try again"
  }
}
```

**Component:**
```tsx
export function ErrorHandler({ error }) {
  const t = useTranslations();

  const getErrorMessage = (error) => {
    if (error.status === 401) return t('errors.unauthorized');
    if (error.status === 404) return t('errors.notFound');
    if (error.message.includes('network')) return t('errors.networkError');
    return t('errors.generic');
  };

  return (
    <div className="error">
      {getErrorMessage(error)}
    </div>
  );
}
```

### Scenario 4: Loading States

**Translation Files:**
```json
{
  "common": {
    "loading": "Loading...",
    "loadingData": "Loading data...",
    "pleaseWait": "Please wait"
  }
}
```

**Component:**
```tsx
export function DataComponent({ isLoading, data }) {
  const t = useTranslations();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Spinner />
        <span>{t('common.loadingData')}</span>
      </div>
    );
  }

  return <DataDisplay data={data} />;
}
```

---

## Error Handling

### Missing Translation Keys

If a key is not found, it will return the key itself:

```tsx
t('nonexistent.key') // Returns: 'nonexistent.key'
```

### Undefined Variables

If a variable is undefined, it will show as empty:

```tsx
// Bad: name is undefined
t('welcome', { name: undefined }) // Returns: "Welcome, !"

// Good: Provide fallback
t('welcome', { name: user?.name || 'Guest' }) // Returns: "Welcome, Guest!"
```

### Type Safety

TypeScript will warn you about typos (future enhancement):

```tsx
// Typo in key name
t('dashbord.title') // TypeScript could warn about this
```

---

## Performance Tips

### 1. Don't Call `useTranslations()` Multiple Times

❌ **Bad:**
```tsx
export function MyComponent() {
  return (
    <div>
      <Header />
      <Content />
      <Footer />
    </div>
  );
}

function Header() {
  const t = useTranslations(); // ❌ Unnecessary call
  return <h1>{t('header.title')}</h1>;
}

function Content() {
  const t = useTranslations(); // ❌ Unnecessary call
  return <p>{t('content.text')}</p>;
}
```

✅ **Good:**
```tsx
export function MyComponent() {
  const t = useTranslations(); // ✅ Single call

  return (
    <div>
      <Header title={t('header.title')} />
      <Content text={t('content.text')} />
      <Footer />
    </div>
  );
}

function Header({ title }) {
  return <h1>{title}</h1>; // ✅ No hook needed
}
```

### 2. Memoize Complex Translation Lookups

```tsx
import { useMemo } from "react";

export function StatusBadge({ status }) {
  const t = useTranslations();

  const statusText = useMemo(() => {
    switch (status) {
      case 'active': return t('status.active');
      case 'paused': return t('status.paused');
      default: return status;
    }
  }, [status, t]);

  return <Badge>{statusText}</Badge>;
}
```

### 3. Avoid Inline Objects

❌ **Bad:**
```tsx
{items.map(item => (
  <p key={item.id}>
    {t('item.description', { name: item.name })} {/* ❌ Creates new object every render */}
  </p>
))}
```

✅ **Better (if list is large):**
```tsx
{items.map(item => {
  const vars = useMemo(() => ({ name: item.name }), [item.name]);
  return (
    <p key={item.id}>
      {t('item.description', vars)}
    </p>
  );
})}
```

---

## Migration Guide

### From Hardcoded Strings

**Before:**
```tsx
export function OldComponent() {
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome back, {user.name}!</p>
      <button>Save Changes</button>
    </div>
  );
}
```

**After:**
```tsx
"use client";

import { useTranslations } from "@/lib/i18n/hooks";

export function NewComponent() {
  const t = useTranslations();

  return (
    <div>
      <h1>{t('dashboard.title')}</h1>
      <p>{t('dashboard.welcome', { name: user.name })}</p>
      <button>{t('common.save')}</button>
    </div>
  );
}
```

### From Other i18n Libraries

If migrating from `next-i18next` or `react-i18next`:

**Before (react-i18next):**
```tsx
import { useTranslation } from 'react-i18next';

export function Component() {
  const { t } = useTranslation();
  return <h1>{t('dashboard:title')}</h1>;
}
```

**After (Duely):**
```tsx
import { useTranslations } from '@/lib/i18n/hooks';

export function Component() {
  const t = useTranslations();
  return <h1>{t('dashboard.title')}</h1>;
}
```

**Key Differences:**
- Use `useTranslations()` instead of `useTranslation()`
- Use dot notation (`dashboard.title`) instead of namespace syntax (`dashboard:title`)
- No need for namespace parameter

---

## Cheat Sheet

```tsx
// Import
import { useTranslations } from "@/lib/i18n/hooks";
import { useLanguage } from "@/contexts/LanguageContext";

// Get translation function
const t = useTranslations();

// Simple translation
{t('key')}

// With variable
{t('key', { variable: value })}

// Multiple variables
{t('key', { var1: val1, var2: val2 })}

// Get current locale
const { locale } = useLanguage();

// Change locale
const { setLocale } = useLanguage();
setLocale('id'); // or 'en'

// In forms
<input placeholder={t('form.placeholder')} />

// In buttons
<button>{t('common.save')}</button>

// In toast
toast.success(t('notifications.success'))

// In validation
required: t('validation.required')

// Conditional
status === 'active' ? t('status.active') : t('status.inactive')
```

---

**Need More Help?**

- [Translation Workflow Guide](./I18N_WORKFLOW.md)
- [Implementation Tracker](../../I18N_IMPLEMENTATION_TRACKER.md)
- [Testing Reports](../PHASE9_REPORT.md)

---

**Last Updated:** 2025-11-02
**Version:** 1.0
**Translation Keys:** 405
