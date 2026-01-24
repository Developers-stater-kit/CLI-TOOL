# DevKit CLI Tool

<div align="center">

```
██████╗ ███████╗██╗   ██╗██╗  ██╗██╗████████╗
██╔══██╗██╔════╝██║   ██║██║ ██╔╝██║╚══██╔══╝
██║  ██║█████╗  ██║   ██║█████╔╝ ██║   ██║   
██║  ██║██╔══╝  ██║   ██║██╔═██╗ ██║   ██║   
██████╔╝███████╗╚██████╔╝██║  ██╗██║   ██║   
╚═════╝ ╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚═╝   ╚═╝   
```

**Create a production-ready web or mobile app with one command**

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![Node](https://img.shields.io/badge/Node-18+-green)](https://nodejs.org/)

</div>

## 📖 Overview

**DevKit** is a powerful command-line tool designed to streamline the process of setting up production-ready web and mobile applications. Instead of spending hours configuring authentication, databases, ORMs, and payment integrations, DevKit guides you through an interactive setup process that generates a fully configured project in minutes.

### Key Features

- 🚀 **One-Command Setup** - Initialize your entire project stack with a single command
- 🎯 **Interactive Wizard** - Step-by-step prompts guide you through configuration
- 🔐 **Multiple Auth Options** - Support for various authentication libraries and methods
- 💾 **Database Flexibility** - Choose between SQL and No-SQL databases with your preferred ORM
- 💳 **Payment Integration** - Built-in support for popular payment providers
- 📱 **Cross-Platform** - Support for both web and mobile app development
- ⚡ **Modern Stack** - Pre-configured with the latest frameworks and best practices

## 🎯 What DevKit Does

DevKit automates the tedious setup process for:

1. **Project Initialization** - Creates a new project with your chosen name
2. **Framework Setup** - Configures Next.js, React, or Expo based on your needs
3. **Authentication** - Sets up authentication with multiple providers and methods
4. **Database & ORM** - Configures database connections and ORM integration
5. **Payment Processing** - Integrates payment providers for e-commerce functionality

## 📋 Prerequisites

Before using DevKit, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **Bun** (for building) or **npm**/**yarn**/**pnpm**
- **Git** (for version control)

## 🚀 Installation

### Global Installation (Recommended)

```bash
npm install -g devkit
# or
yarn global add devkit
# or
pnpm add -g devkit
```

### Local Installation

```bash
npm install devkit
# or
yarn add devkit
# or
pnpm add devkit
```

### Development Setup

If you want to contribute or run from source:

```bash
# Clone the repository
git clone <repository-url>
cd devkit-Cli-Tool

# Install dependencies
npm install
# or
bun install

# Build the project
npm run build
# or
bun run build

# Link globally for development
npm link
```

## 💻 Usage

### Basic Command

```bash
devkit create
```

This command launches an interactive wizard that guides you through the setup process.

### Interactive Setup Flow

When you run `devkit create`, you'll be prompted to configure:

#### 1. **Project Details**
   - **Project Name**: Choose a name for your project
   - **App Type**: Select between Web App or Mobile App
   - **Framework**: 
     - For Web: Next.js or React
     - For Mobile: Expo
   - **Setup Level**: Choose how much setup you want:
     - Framework only
     - Up to Authentication
     - Up to Database & ORM
     - Full setup (including Payments)

#### 2. **Authentication Setup** (if selected)
   - **Authentication Library**: Choose from:
     - BetterAuth
     - Clerk
     - Firebase Auth
     - Supabase Auth
   - **Authentication Methods**: Select one or more:
     - Email / Password
     - Social Login
     - Phone OTP
     - Custom
   - **Social Providers** (if Social Login is selected):
     - Google
     - GitHub
     - Apple
     - Custom Provider

#### 3. **Database & ORM Setup** (if selected)
   - **Database Type**: SQL or No-SQL
   - **Database Provider**:
     - For SQL: Neon, Supabase, Firebase
     - For No-SQL: Neon, MongoDB
   - **ORM**: Choose from:
     - Drizzle
     - Prisma
     - TypeORM

#### 4. **Payment Integration** (if full setup selected)
   - **Payment Provider**: Choose from:
     - Stripe
     - Razorpay
     - Dodo Payments

#### 5. **Confirmation**
   - Review your configuration summary
   - Confirm to proceed or go back to edit

### Example Session

```bash
$ devkit create

██████╗ ███████╗██╗   ██╗██╗  ██╗██╗████████╗
██╔══██╗██╔════╝██║   ██║██║ ██╔╝██║╚══██╔══╝
██║  ██║█████╗  ██║   ██║█████╔╝ ██║   ██║   
██║  ██║██╔══╝  ██║   ██║██╔═██╗ ██║   ██║   
██████╔╝███████╗╚██████╔╝██║  ██╗██║   ██║   
╚═════╝ ╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚═╝   ╚═╝   
...

▶ Project Details
? What will be the name of your project? my-awesome-app
? What type of project is this? Web App
? Choose a framework Next.js
? How much setup do you want? Full setup (Payments)

▶ Authentication Setup
? Choose authentication library BetterAuth
? Select authentication methods Email / Password, Social Login
? Select social providers Google, GitHub

▶ Database & ORM
? Choose database Type SQL
? Choose database provider Supabase
? Choose ORM Prisma

▶ Payments
? Choose payment provider Stripe

Project      my-awesome-app
Type         web
Framework    nextjs
Auth         better-auth
Auth Methods email, social
Social       google, github
DB Type      sql
Database     supabase
ORM          prisma
Payments     stripe

? Do you want to proceed with this setup? ✅ Yes, proceed

🚀 Setup confirmed. Generating project...
```

## 🏗️ Project Structure

After running `devkit create`, your project will be generated with:

```
your-project-name/
├── src/
│   ├── app/              # Application code
│   ├── components/       # Reusable components
│   ├── lib/              # Utilities and helpers
│   └── ...
├── .env.example          # Environment variables template
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── README.md             # Project documentation
```

## 🔧 Configuration

### Environment Variables

After project generation, you'll need to configure environment variables. Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required variables depend on your selected services:
- Authentication provider keys
- Database connection strings
- Payment provider API keys

## 📦 Supported Technologies

### Frameworks
- **Next.js** - React framework for production
- **React** - UI library
- **Expo** - React Native framework

### Authentication Libraries
- **BetterAuth** - Modern authentication solution
- **Clerk** - Complete user management
- **Firebase Auth** - Google's authentication service
- **Supabase Auth** - Open-source authentication

### Databases
- **SQL**: Neon, Supabase, Firebase
- **No-SQL**: Neon, MongoDB

### ORMs
- **Drizzle** - Lightweight and performant
- **Prisma** - Next-generation ORM
- **TypeORM** - Mature TypeScript ORM

### Payment Providers
- **Stripe** - Global payment processing
- **Razorpay** - Payment gateway for India
- **Dodo Payments** - Custom payment solution

## 🛠️ Development

### Building the Project

```bash
npm run build
# or
bun run build
```

### Running in Development Mode

```bash
npm run dev
# or
bun run dev
```

### Project Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm run dev` - Run the CLI tool in development mode
- `npm run test` - Run tests (when implemented)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Debojeet Karmakar**

## 🙏 Acknowledgments

- Built with [Commander.js](https://github.com/tj/commander.js) for CLI functionality
- Interactive prompts powered by [@inquirer/prompts](https://github.com/SBoudrias/Inquirer.js)
- Styled output with [Chalk](https://github.com/chalk/chalk)

## 📞 Support

If you encounter any issues or have questions:

1. Check existing [Issues](../../issues)
2. Create a new issue with detailed information
3. Include your configuration and error messages

## 🗺️ Roadmap

Future enhancements planned:

- [ ] Support for more frameworks (Vue, Svelte, etc.)
- [ ] Additional authentication methods
- [ ] More database providers
- [ ] CI/CD pipeline templates
- [ ] Testing framework integration
- [ ] Docker configuration
- [ ] Deployment scripts

---

**Made with ❤️ for developers who want to focus on building, not configuring.**
