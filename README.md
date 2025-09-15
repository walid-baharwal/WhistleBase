# WhistleBase - Anonymous Whistleblowing Platform

WhistleBase is a secure, anonymous whistleblowing platform that empowers users to report misconduct, fraud, and unethical behavior while protecting their identity through end-to-end encryption and zero-tracking policies.

## 🛡️ Features

- **Complete Anonymity**: Your identity remains completely protected with no IP logging or metadata collection
- **End-to-End Encryption**: Military-grade encryption ensures reports are secure from submission to resolution
- **Zero Tracking**: No digital footprint collection - your privacy is guaranteed
- **Detailed Reporting**: Comprehensive forms to capture all necessary details while maintaining anonymity
- **Secure Communication**: Anonymous two-way communication channel for follow-ups and clarifications
- **Case Tracking**: Monitor the progress of your report through secure, anonymous case tracking
- **File Attachments**: Secure file upload with encryption support
- **Organization Dashboard**: Management interface for organizations to handle reports
- **Email Verification**: Secure email verification system for user registration

## 🏗️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, tRPC
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js
- **File Storage**: Cloudflare R2 (S3-compatible)
- **Encryption**: LibSodium (cryptographic library)
- **Email**: Nodemailer with Gmail
- **UI Components**: Radix UI, Lucide React Icons

## 🚀 Getting Started

### Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (v18 or higher)
- **npm**, **yarn**, **pnpm**, or **bun** package manager
- **MongoDB** database (local or cloud instance)
- **Cloudflare R2** account for file storage
- **Gmail** account for email verification

### Environment Variables

Create a `.env.local` file in the root directory and add the following environment variables:

```bash
# Database Configuration
MONGO_URI=mongodb://localhost:27017/whistlebase
# OR for MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/whistlebase

# NextAuth Configuration
NEXTAUTH_SECRET=your-super-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Cloudflare R2 Configuration (File Storage)
CLOUDFLARE_ACCOUNT_ID=your-cloudflare-account-id
CLOUDFLARE_ACCESS_KEY_ID=your-r2-access-key-id
CLOUDFLARE_SECRET_ACCESS_KEY=your-r2-secret-access-key
CLOUDFLARE_BUCKET_NAME=your-bucket-name

# Gmail Configuration (Email Verification)
GMAIL_USER=your-gmail-address@gmail.com
GMAIL_APP_PASSWORD=your-gmail-app-password

# Optional: Storage Key (for client-side encryption)
NEXT_PUBLIC_STORAGE_KEY=temp_case_keys_v1
```

### Environment Variables Setup Guide

#### 1. MongoDB Setup
- **Local MongoDB**: Install MongoDB locally and use `mongodb://localhost:27017/whistlebase`
- **MongoDB Atlas**: Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas) and get your connection string

#### 2. Cloudflare R2 Setup
1. Create a [Cloudflare](https://cloudflare.com) account
2. Go to R2 Object Storage in your dashboard
3. Create a new bucket
4. Generate API tokens with R2 permissions
5. Get your Account ID from the dashboard

#### 3. Gmail App Password Setup
1. Enable 2-factor authentication on your Gmail account
2. Go to Google Account settings → Security
3. Generate an "App Password" for this application
4. Use this app password (not your regular Gmail password)

#### 4. NextAuth Secret
Generate a random secret key:
```bash
openssl rand -base64 32
```

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd whistle-base
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your actual values
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (app)/             # Protected app routes
│   │   ├── (anon)/        # Anonymous user routes
│   │   ├── auth/          # Authentication pages
│   │   └── dashboard/     # Organization dashboard
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/            # Reusable React components
│   ├── auth/              # Authentication components
│   ├── ui/                # UI components (Radix UI)
│   └── sidebar/           # Navigation components
├── lib/                   # Utility libraries
│   ├── actions/           # Server actions
│   ├── dbConnect.ts       # Database connection
│   └── s3.ts             # File storage client
├── models/                # MongoDB models
├── schemas/               # Zod validation schemas
├── server/                # tRPC server setup
├── screens/               # Page components
├── utils/                 # Utility functions
│   ├── encryption/        # Encryption utilities
│   └── keys/              # Key management
└── types/                 # TypeScript type definitions
```

## 🔐 Security Features

- **Client-side encryption** using LibSodium
- **Secure key generation** and management
- **End-to-end encrypted** file attachments
- **No IP logging** or metadata collection
- **Secure session management** with NextAuth.js
- **Input validation** with Zod schemas
- **CSRF protection** built into Next.js

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Add all environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 📝 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint for code quality

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the environment variables are correctly set
2. Ensure MongoDB is running and accessible
3. Verify Cloudflare R2 credentials are correct
4. Check Gmail app password is properly configured
5. Review the browser console for any client-side errors

## 🔍 Troubleshooting

### Common Issues

**Database Connection Error**
- Verify `MONGO_URI` is correct and MongoDB is running
- Check network connectivity for MongoDB Atlas

**File Upload Issues**
- Verify Cloudflare R2 credentials
- Check bucket permissions and CORS settings

**Email Not Sending**
- Verify Gmail credentials and app password
- Check Gmail account has 2FA enabled
- Ensure app password is used (not regular password)

**Authentication Issues**
- Verify `NEXTAUTH_SECRET` is set and secure
- Check `NEXTAUTH_URL` matches your domain

---

Built with ❤️ for secure and anonymous whistleblowing.
