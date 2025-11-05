# 🎯 Duely - Subscription Management Platform

A modern, full-featured subscription management platform built with Next.js 16, featuring multi-language support (English & Indonesian), real-time notifications, and comprehensive analytics.

## ✨ Features

### Core Features
- 📊 **Dashboard** - Overview of all subscriptions with spending insights
- 💳 **Subscription Management** - Track recurring payments and billing cycles
- 📈 **Analytics** - Visualize spending patterns and category breakdowns
- 👥 **Family Sharing** - Manage subscriptions for family members
- 🏷️ **Categories** - Organize subscriptions by custom categories
- 🔔 **Smart Notifications** - Automatic renewal reminders and budget alerts
- ⚙️ **Settings** - Customize currency, notifications, and language preferences

### Technical Features
- 🌍 **Internationalization (i18n)** - Full support for English and Indonesian
- 🎨 **Modern UI** - Built with Tailwind CSS and shadcn/ui components
- 🔐 **Authentication** - Secure NextAuth.js integration
- 💾 **Database** - Prisma ORM with PostgreSQL/SQLite
- 🚀 **Performance** - Next.js 16 with Turbopack for fast development
- 📱 **Responsive** - Mobile-first design that works on all devices
- 🌙 **Theming** - System, light, and dark mode support

## 🌍 Internationalization (i18n)

Duely supports multiple languages with a custom i18n implementation that provides:

### Supported Languages
- 🇺🇸 **English** (en) - Default
- 🇮🇩 **Indonesian** (id) - Bahasa Indonesia

### i18n Features
- ✅ **405 Translation Keys** covering the entire application
- ✅ **Real-time Language Switching** without page reload
- ✅ **Database Persistence** - Language preference saved to user settings
- ✅ **Variable Interpolation** - Dynamic content like `{count}`, `{name}`, `{days}`
- ✅ **Type-Safe** - Full TypeScript support for translation keys
- ✅ **Server & Client Components** - Works with Next.js App Router
- ✅ **Context-based** - React Context for global language state

### Using Translations in Components

```tsx
import { useTranslations } from "@/lib/i18n/hooks";

export function MyComponent() {
  const t = useTranslations();

  return (
    <div>
      <h1>{t('dashboard.title')}</h1>
      <p>{t('dashboard.welcome', { name: 'John' })}</p>
    </div>
  );
}
```

### Translation File Structure

```
src/
├── locales/
│   ├── en.json    # English translations (405 keys)
│   └── id.json    # Indonesian translations (405 keys)
├── lib/
│   └── i18n/
│       ├── config.ts   # i18n configuration
│       ├── hooks.ts    # Translation hooks
│       └── utils.ts    # Translation utilities
└── contexts/
    └── LanguageContext.tsx  # Language state management
```

### Changing Language

Users can change their language preference in **Settings** page:
1. Navigate to Settings
2. Select language from dropdown (English/Indonesian)
3. Save settings - language changes immediately
4. Preference is saved to database and persists across sessions

For developers, see [Translation Workflow Guide](./docs/I18N_WORKFLOW.md) for adding new translations.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL (or SQLite for development)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/duely.git
cd duely/Workspace
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```env
DATABASE_URL="your-database-url"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
```

4. Set up the database
```bash
npx prisma generate
npx prisma db push
```

5. Run the development server
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📦 Tech Stack

### Frontend
- **Framework**: Next.js 16.0.1 (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS 3.4
- **Components**: shadcn/ui (Radix UI primitives)
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Notifications**: Sonner (toast notifications)

### Backend
- **Framework**: Next.js API Routes
- **ORM**: Prisma
- **Database**: PostgreSQL / SQLite
- **Authentication**: NextAuth.js
- **Session Management**: JWT + Database sessions

### Development
- **Language**: TypeScript 5
- **Build Tool**: Turbopack (Next.js 16)
- **Linting**: ESLint
- **Package Manager**: npm

## 📁 Project Structure

```
Workspace/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (dashboard)/        # Dashboard layout group
│   │   │   ├── dashboard/      # Dashboard page
│   │   │   ├── subscriptions/  # Subscriptions management
│   │   │   ├── analytics/      # Analytics page
│   │   │   ├── categories/     # Categories management
│   │   │   ├── members/        # Members management
│   │   │   └── settings/       # Settings page
│   │   ├── auth/               # Authentication pages
│   │   ├── api/                # API routes
│   │   └── layout.tsx          # Root layout
│   ├── components/             # React components
│   │   ├── dashboard/          # Dashboard components
│   │   ├── subscriptions/      # Subscription components
│   │   ├── categories/         # Category components
│   │   ├── members/            # Member components
│   │   ├── notifications/      # Notification components
│   │   ├── layout/             # Layout components
│   │   ├── ui/                 # shadcn/ui components
│   │   └── providers/          # React providers
│   ├── lib/                    # Utilities and libraries
│   │   ├── i18n/               # i18n system
│   │   ├── auth.ts             # NextAuth configuration
│   │   └── utils.ts            # Utility functions
│   ├── contexts/               # React contexts
│   ├── locales/                # Translation files
│   └── types/                  # TypeScript types
├── prisma/
│   └── schema.prisma           # Database schema
├── public/                     # Static assets
└── docs/                       # Documentation
```

## 🔧 Configuration

### Database Schema

The application uses Prisma with the following main models:

- **User** - User accounts and authentication
- **Subscription** - Subscription records
- **Category** - Subscription categories
- **Member** - Family members
- **Notification** - System notifications
- **Settings** - User preferences (including language)

### Environment Variables

Required environment variables:

```env
DATABASE_URL            # Database connection string
NEXTAUTH_URL           # Application URL
NEXTAUTH_SECRET        # Secret for NextAuth.js
```

## 🧪 Testing

### Run Build
```bash
npm run build
```

### TypeScript Check
```bash
npx tsc --noEmit
```

### Translation Tests
```bash
# Verify translation files
node phase9-test.js

# Re-verify Phase 2 translations
node phase2-verify.js
```

## 📖 Documentation

- [i18n Implementation Tracker](../I18N_IMPLEMENTATION_TRACKER.md) - Complete i18n implementation history
- [Translation Workflow Guide](./docs/I18N_WORKFLOW.md) - How to add/update translations
- [Translation Guide for Developers](./docs/TRANSLATION_GUIDE.md) - Best practices and examples
- [Phase 9 Report](./PHASE9_REPORT.md) - Final testing and verification
- [Phase 2 Re-verification](./PHASE2_REVERIFICATION_REPORT.md) - Translation files validation

## 🎨 UI Components

This project uses [shadcn/ui](https://ui.shadcn.com/) components:

- Button, Card, Dialog, Dropdown Menu
- Form, Input, Label, Select
- Table, Tabs, Toast
- Avatar, Badge, Progress, Separator
- Checkbox, and more...

All components are customizable and accessible.

## 🔐 Authentication

Authentication is handled by NextAuth.js with:

- Credentials provider (email/password)
- Session management
- Protected routes via middleware
- Database session storage

## 📊 Key Features in Detail

### Subscription Management
- Add/edit/delete subscriptions
- Track billing cycles (monthly, yearly, quarterly, weekly)
- Set renewal dates and amounts
- Categorize by custom categories
- Assign to family members
- Mark as active, trial, paused, or canceled

### Dashboard
- Monthly spending overview
- Active subscriptions count
- Upcoming renewals
- Category breakdown chart
- Yearly spending projection
- Potential savings insights

### Notifications
- Automatic renewal reminders (configurable days before due date)
- Overdue subscription alerts
- Budget threshold warnings
- Mark as read functionality
- Clear read notifications

### Analytics
- Top services by spending
- Category distribution chart
- Spending trends
- Subscription count statistics

### Multi-language Support
- 405 translation keys in EN and ID
- Real-time language switching
- Persisted user preference
- Interpolation for dynamic content
- Full application coverage

## 🛠️ Development

### Adding New Features

1. Create components in appropriate directory
2. Add translations to `src/locales/en.json` and `src/locales/id.json`
3. Use `useTranslations()` hook for all user-facing text
4. Test in both languages
5. Run build and TypeScript checks

### Translation Guidelines

- Never hardcode user-facing strings
- Always add keys to both EN and ID files
- Use descriptive key names (e.g., `dashboard.monthlySpending`)
- Use variable interpolation for dynamic content
- Test language switching after changes

See [Translation Guide](./docs/TRANSLATION_GUIDE.md) for detailed instructions.

## 🚢 Deployment

### Build for Production

```bash
npm run build
npm start
```

### Deploy to Vercel

```bash
vercel deploy
```

Make sure to set environment variables in your deployment platform.

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Add translations for new features (both EN and ID)
4. Test thoroughly
5. Submit a pull request

## 📧 Support

For issues or questions, please open an issue on GitHub.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Prisma](https://www.prisma.io/) - Database ORM
- [NextAuth.js](https://next-auth.js.org/) - Authentication
- [Recharts](https://recharts.org/) - Charts library

---

**Built with ❤️ using Next.js 16 and TypeScript**

🌍 **Now available in English and Indonesian!**
