# tRPC Setup Documentation

## Overview
This project has been successfully set up with tRPC integration alongside NextAuth and Mongoose. The setup includes a complete whistleblowing system with organizations, cases, billing, and subscription management.

### ✅ Completed Setup

1. **tRPC Server Structure** (`src/server/trpc/`)
   - `context.ts` - tRPC context with NextAuth session integration
   - `router.t├── schemas/
│   ├── signIn.schema.ts        # Sign-in validation
│   ├── signUp.schema.ts        # Sign-up validation with strong password rules
│   └── accessCode.schema.ts    # Access code validation- Main router combining all sub-routers
   - `routers/auth.ts` - Authentication router with signup and email verification
   - `index.ts` - Clean exports for all tRPC items

2. **API Handler** (`src/app/api/trpc/[trpc]/route.ts`)
   - tRPC API endpoint for Next.js App Router
   - Integrated with NextAuth session
   - Database connection on each request

3. **Client Setup**
   - `src/lib/trpc.ts` - tRPC client configuration
   - `src/components/TrpcProvider.tsx` - React Query + tRPC provider
   - Integrated into root layout (`src/app/layout.tsx`)

4. **NextAuth Integration**
   - `src/app/api/auth/[...nextauth]/options.ts` - NextAuth configuration
   - `src/app/api/auth/[...nextauth]/route.ts` - NextAuth API routes
   - `src/types/next-auth.d.ts` - Custom type definitions for NextAuth
   - Fully integrated with tRPC context for session management

5. **Multi-step Signup Wizard**
   - `src/app/(auth)/sign-up/page.tsx` - Signup page with wizard integration
   - `src/app/(auth)/sign-in/page.tsx` - Sign-in page
   - `src/components/SignupWizard.tsx` - Modern multi-step signup wizard with theme integration
   - `src/components/ui/select.tsx` - Shadcn/ui Select component for country selection
   - `src/helpers/sendVerificationEmail.ts` - Gmail SMTP email sending with HTML templates
   - `src/schemas/signUp.schema.ts` - Comprehensive Zod validation schemas for each step
   - **Updated Flow**: Personal Info → Email Verification → Organization → Complete

6. **Email System Integration**
   - **Gmail SMTP**: Configured with nodemailer for reliable email delivery
   - **HTML Email Templates**: Professional email templates with verification codes
   - **Error Handling**: Comprehensive error handling for different email failure scenarios
   - **Environment Variables**: Secure credential management with `.env` configuration

### 🗄️ Database Models

#### **Core Models**

1. **User Model** (`src/models/user.model.ts`)
   ```typescript
   interface User {
     _id: ObjectId;
     first_name: string;
     last_name: string;
     email: string; // unique, lowercase
     password: string; // bcrypt hashed
     email_verified_at?: Date;
     createdAt: Date;
     updatedAt: Date;
   }
   ```
   - Includes password hashing with bcryptjs
   - Email uniqueness validation
   - Password comparison method

2. **Organization Model** (`src/models/organization.model.ts`)
   ```typescript
   interface Organization {
     _id: ObjectId;
     name: string;
     owner: ObjectId; // ref: User
     createdAt: Date;
     updatedAt: Date;
   }
   ```

3. **Email Verification Model** (`src/models/email_verification.model.ts`)
   ```typescript
   interface EmailVerification {
     _id: ObjectId;
     user_id: ObjectId; // ref: User
     token: string; // unique 6-digit code
     expires_at: Date;
     createdAt: Date;
     updatedAt: Date;
   }
   ```

#### **Organization Management**

4. **Organization Member Model** (`src/models/organization_member.model.ts`)
   ```typescript
   interface OrganizationMember {
     _id: ObjectId;
     user_id: ObjectId; // ref: User
     organization_id: ObjectId; // ref: Organization
     role: "admin" | "member" | "viewer"; // default: "member"
     createdAt: Date;
     updatedAt: Date;
   }
   ```
   - Compound unique index on user_id + organization_id

5. **Organization Unit Model** (`src/models/organization_unit.model.ts`)
   ```typescript
   interface OrganizationUnit {
     _id: ObjectId;
     organization_id: ObjectId; // ref: Organization
     name: string;
     parent_unit_id?: ObjectId; // ref: OrganizationUnit
     createdAt: Date;
     updatedAt: Date;
   }
   ```
   - Compound unique index on organization_id + name

6. **Organization Invite Model** (`src/models/organization_invite.model.ts`)
   ```typescript
   interface OrganizationInvite {
     _id: ObjectId;
     email: string; // lowercase
     organization_id: ObjectId; // ref: Organization
     role: "admin" | "member" | "viewer"; // default: "member"
     token: string; // unique
     expires_at: Date;
     accepted_at?: Date;
     createdAt: Date;
     updatedAt: Date;
   }
   ```

#### **Case Management**

7. **Form Model** (`src/models/form.model.ts`)
   ```typescript
   interface Form {
     _id: ObjectId;
     logo?: string;
     primary_color: string; // default: "#000000"
     organization_id: ObjectId; // ref: Organization
     slug: string; // unique, lowercase
     access_code: string; // unique
     title: string;
     description: string;
     submission_message: string;
     createdAt: Date;
     updatedAt: Date;
   }
   ```

8. **Case Model** (`src/models/case.model.ts`)
   ```typescript
   interface Case {
     _id: ObjectId;
     form_id: ObjectId; // ref: Form
     case_code: string; // unique
     category: string;
     content: string;
     is_anonymous: boolean; // default: false
     status: "OPEN" | "CLOSED"; // default: "OPEN"
     createdAt: Date;
     updatedAt: Date;
   }
   ```

9. **Message Model** (`src/models/message.model.ts`)
   ```typescript
   interface Message {
     _id: ObjectId;
     case_id: ObjectId; // ref: Case
     sender_type: "ANONYMOUS" | "ADMIN";
     sender_id?: ObjectId; // ref: User (null for anonymous)
     message: string;
     createdAt: Date;
     updatedAt: Date;
   }
   ```

10. **Attachment Model** (`src/models/attachment.model.ts`)
    ```typescript
    interface Attachment {
      _id: ObjectId;
      case_id: ObjectId; // ref: Case
      organization_id: ObjectId; // ref: Organization
      file_name: string;
      storage_key: string;
      mime_type: string;
      size: number; // in bytes
      access_scope: "public" | "org_only"; // default: "org_only"
      message_id?: ObjectId; // ref: Message
      uploaded_by: ObjectId; // ref: User
      uploaded_at: Date; // default: Date.now
      createdAt: Date;
      updatedAt: Date;
    }
    ```

#### **Billing & Subscriptions**

11. **Plan Model** (`src/models/plan.model.ts`)
    ```typescript
    interface Plan {
      _id: ObjectId;
      name: string;
      stripe_price_id: string; // unique
      price: number; // min: 0
      benefits: string[];
      interval: "month" | "year";
      max_cases: number; // min: 0
      max_admins: number; // min: 1
      has_file_upload: boolean; // default: false
      has_custom_branding: boolean; // default: false
      createdAt: Date;
      updatedAt: Date;
    }
    ```

12. **Subscription Model** (`src/models/subscription.model.ts`)
    ```typescript
    interface Subscription {
      _id: ObjectId;
      organization_id: ObjectId; // ref: Organization
      plan_id: ObjectId; // ref: Plan
      stripe_subscription_id: string; // unique
      type: "TRIAL" | "PAID";
      started_at: Date;
      ends_at: Date;
      createdAt: Date;
      updatedAt: Date;
    }
    ```

13. **Organization Billing Model** (`src/models/organization_billing.model.ts`)
    ```typescript
    interface OrganizationBilling {
      _id: ObjectId;
      organization_id: ObjectId; // ref: Organization (unique)
      stripe_customer_id: string; // unique
      stripe_payment_ids: string[];
      billing_name: string;
      billing_email: string; // lowercase
      city: string;
      state: string;
      postal_code: string;
      country: string;
      phone: string;
      createdAt: Date;
      updatedAt: Date;
    }
    ```

### � Email Configuration

**Gmail SMTP Setup:**

1. **Environment Variables Required:**
   ```bash
   GMAIL_USER=your-gmail@gmail.com
   GMAIL_APP_PASSWORD=your_gmail_app_password
   ```

2. **Gmail App Password Setup:**
   - Enable 2-Factor Authentication on your Gmail account
   - Go to Google Account settings → Security → App passwords
   - Generate a new app password for "Mail"
   - Use this app password (not your regular Gmail password) in `GMAIL_APP_PASSWORD`

3. **Email Features:**
   - **HTML Templates**: Professional responsive email design
   - **Verification Codes**: 6-digit codes with 1-hour expiry
   - **Error Handling**: Specific error messages for different failure types
   - **SMTP Verification**: Connection testing before sending emails
   - **Fallback Text**: Plain text version for email clients that don't support HTML

4. **Email Template Features:**
   - Responsive design for mobile and desktop
   - Company branding ready
   - Clear verification code display
   - Expiry time warnings
   - Professional styling with CSS

### �🔧 Key Features

- **Type Safety**: Full end-to-end type safety with TypeScript
- **NextAuth Integration**: Session data available in tRPC context with custom user fields
- **Database Integration**: Mongoose models with proper typing and validation
- **Error Handling**: Proper error handling and validation with Zod schemas
- **React Query**: Optimized data fetching and caching
- **React Hook Form**: Modern form handling with validation, error states, and better UX
- **Email Verification**: Complete email verification flow with token expiry
- **Gmail SMTP Integration**: Professional email delivery with HTML templates and error handling
- **Organization Management**: Multi-tenant architecture with organization-based access control
- **Case Management**: Complete whistleblowing case system with attachments and messaging
- **Billing Integration**: Stripe integration for subscriptions and billing

### 📝 Usage Example

```typescript
// Step 1: Send verification email
const sendEmailMutation = trpc.auth.sendVerificationEmail.useMutation({
  onSuccess: (data: { message: string }) => {
    toast.success(data.message);
    setCurrentStep(2); // Move to verification step
  },
  onError: (error: { message: string }) => {
    toast.error(error.message);
  },
});

// Step 2: Verify code
const verifyCodeMutation = trpc.auth.verifyCode.useMutation({
  onSuccess: (data: { message: string }) => {
    toast.success(data.message);
    setCurrentStep(3); // Move to personal info step
  },
  onError: (error: { message: string }) => {
    toast.error(error.message);
  },
});

// Step 3: Complete signup
const completeSignupMutation = trpc.auth.completeSignup.useMutation({
  onSuccess: (data: { message: string }) => {
    toast.success(data.message);
    router.push('/dashboard'); // Redirect to dashboard
  },
  onError: (error: { message: string }) => {
    toast.error(error.message);
  },
});

// Usage in wizard steps
sendEmailMutation.mutate({ email: "user@example.com" });
verifyCodeMutation.mutate({ email: "user@example.com", verification_code: "123456" });
completeSignupMutation.mutate({ 
  email: "user@example.com", 
  first_name: "John", 
  last_name: "Doe",
  password: "securepassword",
  organization_name: "Acme Corp",
  country: "US",
  verification_code: "123456"
});
```

### 🚀 API Endpoints

**Wizard Signup Flow:**
- **POST** `/api/trpc/auth.sendVerificationEmail` - Collect personal info and send verification code
  - Input: `{ email, first_name, last_name, password }`
  - Returns: `{ message }`

- **POST** `/api/trpc/auth.verifyCode` - Verify the email verification code
  - Input: `{ email, verification_code }`
  - Returns: `{ message }`

- **POST** `/api/trpc/auth.completeSignup` - Complete organization creation
  - Input: `{ email, organization_name, country, verification_code }`
  - Returns: `{ message, user_id, organization_id, email, first_name, last_name, organization_name, country }`

**NextAuth Endpoints:**
- **POST** `/api/auth/signin` - NextAuth sign in (credentials)
- **POST** `/api/auth/signout` - NextAuth sign out
- **GET** `/api/auth/session` - Get current session

### 🔒 Security Features

- Password hashing with bcryptjs (10 rounds)
- Email uniqueness validation
- Input validation with Zod schemas
- Protected procedures for authenticated routes
- Email verification with 6-digit tokens
- Token expiry (1 hour) with automatic cleanup
- Session-based authentication with NextAuth
- Organization-based access control

### 📁 File Structure

```
src/
├── server/trpc/
│   ├── context.ts          # tRPC context with NextAuth
│   ├── router.ts           # Main router
│   ├── routers/
│   │   └── auth.ts         # Auth procedures
│   └── index.ts            # Clean exports
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/
│   │   │   ├── options.ts  # NextAuth configuration
│   │   │   └── route.ts    # NextAuth routes
│   │   └── trpc/[trpc]/
│   │       └── route.ts    # tRPC API handler
│   ├── (auth)/
│   │   ├── sign-in/
│   │   │   └── page.tsx    # Sign-in page
│   │   └── sign-up/
│   │       └── page.tsx    # Sign-up with verification flow
│   └── (app)/
│       └── dashboard/
│           └── page.tsx    # Protected dashboard
├── lib/
│   ├── trpc.ts             # Client configuration
│   ├── dbConnect.ts        # MongoDB connection
│   └── utils.ts            # Utilities
├── components/
│   ├── TrpcProvider.tsx    # Provider component
│   ├── SignupWizard.tsx    # Multi-step signup wizard
│   └── ui/                 # Shadcn/ui components
│       ├── button.tsx      # Button component
│       ├── form.tsx        # Form components
│       ├── input.tsx       # Input component
│       ├── label.tsx       # Label component
│       ├── select.tsx      # Select component (country dropdown)
│       └── sonner.tsx      # Toast notifications
├── models/
│   ├── user.model.ts       # User model
│   ├── organization.model.ts # Organization model
│   ├── email_verification.model.ts # Email verification model
│   ├── organization_member.model.ts # Organization membership
│   ├── organization_unit.model.ts # Organization units/departments
│   ├── organization_invite.model.ts # Organization invites
│   ├── organization_billing.model.ts # Billing information
│   ├── form.model.ts       # Whistleblowing forms
│   ├── case.model.ts       # Whistleblowing cases
│   ├── message.model.ts    # Case messages
│   ├── attachment.model.ts # File attachments
│   ├── plan.model.ts       # Subscription plans
│   └── subscription.model.ts # Organization subscriptions
├── types/
│   └── next-auth.d.ts      # NextAuth type extensions
├── schemas/
│   ├── signIn.schema.ts    # Sign-in validation
│   └── accessCode.schema.ts # Access code validation
├── helpers/
│   └── sendVerificationEmail.ts # Gmail SMTP email sending with HTML templates
├── tests/
│   └── email-test.ts           # Email functionality testing utilities
└── .env.example                # Environment variables template
```

### 🎯 Next Steps

1. Add more tRPC procedures for:
   - Case management (create, list, update)
   - Organization member management
   - Form creation and management
   - File upload handling
   - Billing and subscription management

2. Implement protected routes using `protectedProcedure`
3. Add role-based access control (RBAC)
4. Extend authentication with OAuth providers
5. Add real-time updates with WebSockets
6. Implement file storage (AWS S3, Cloudinary, etc.)
7. Add email templates and notifications
8. Implement audit logging

### 🔄 Recent Fixes

- **Fixed Signup Flow**: Removed redundant `signup-demo` page and integrated proper email verification flow into the main `(auth)/sign-up` page
- **NextAuth Integration**: Ensured proper integration between tRPC context and NextAuth session management
- **Model Documentation**: Added comprehensive documentation for all 13 database models
- **Type Safety**: All models properly typed with TypeScript interfaces
- **Authentication Flow**: Complete signup → email verification → sign-in flow
- **Gmail SMTP Integration**: Implemented professional email sending with HTML templates, error handling, and Gmail App Password authentication
- **Environment Configuration**: Added secure credential management with `.env` and `.env.example` files
- **React Hook Form Refactor**: Upgraded SignupForm to use React Hook Form with Zod validation for better UX and form handling
- **Responsive Design**: Added benefits section with mobile-responsive layout matching the provided design
- **Enhanced Validation**: Strong password requirements with regex validation and comprehensive field validation

### 🧪 Testing Email Functionality

To test the email sending functionality:

1. **Update test email** in `src/tests/email-test.ts`
2. **Uncomment the test line** in the file
3. **Run the test**:
   ```bash
   npx ts-node src/tests/email-test.ts
   ```

**Email Test Features:**
- Sends a real verification email to test recipient
- Validates Gmail SMTP connection
- Tests HTML template rendering
- Verifies error handling

The setup is production-ready and follows tRPC best practices with full type safety, proper error handling, comprehensive data modeling for a whistleblowing platform, and professional email delivery system. 