# 🚚 Logistics Dashboard

A modern, full-stack logistics management dashboard built with Next.js, Firebase, and Tailwind CSS. This application provides comprehensive shipment tracking, user management, and payment integration for logistics operations.

## ✨ Features

### 🎯 Core Functionality
- **Real-time Shipment Tracking** - Track shipments with live status updates
- **Dashboard Analytics** - View comprehensive statistics and metrics
- **User Authentication** - Secure Firebase-based login/signup system
- **Profile Management** - User profile customization and management
- **Admin Panel** - Dedicated admin interface for drivers and shipments

### 📦 Shipment Management
- **Create Shipments** - Easy shipment creation with detailed forms
- **Status Tracking** - Real-time status updates (pending, in-transit, delivered)
- **Shipment History** - Complete shipment history and tracking
- **Driver Management** - Admin interface for managing drivers

### 💳 Payment Integration
- **Razorpay Integration** - Secure payment processing
- **Payment Tracking** - Monitor payment status for shipments

### 🎨 Modern UI/UX
- **Responsive Design** - Mobile-first responsive interface
- **Dark/Light Theme** - Theme switching capability
- **Modern Components** - Built with Radix UI and shadcn/ui
- **Smooth Animations** - Enhanced user experience with Tailwind animations

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - Latest React with modern features
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern UI component library
- **Radix UI** - Accessible component primitives

### Backend & Database
- **Firebase** - Backend-as-a-Service
  - Authentication
  - Firestore Database
  - Real-time updates

### Payment & Forms
- **Razorpay** - Payment gateway integration
- **React Hook Form** - Form state management
- **Zod** - Schema validation

### Additional Libraries
- **Lucide React** - Modern icon library
- **Recharts** - Data visualization
- **Date-fns** - Date manipulation
- **Sonner** - Toast notifications

## 📁 Project Structure

```
logistics-dashboard/
├── app/                    # Next.js App Router
│   ├── dashboard/         # Dashboard pages
│   │   ├── admin/         # Admin-only pages
│   │   │   ├── drivers/   # Driver management
│   │   │   └── shipments/ # Admin shipment view
│   │   ├── create-shipment/ # Create new shipments
│   │   ├── profile/       # User profile
│   │   ├── shipments/     # User shipments
│   │   └── tracking/      # Shipment tracking
│   ├── login/             # Authentication pages
│   └── signup/
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui components
│   ├── RazorpayButton.tsx # Payment integration
│   └── theme-provider.tsx # Theme management
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
│   ├── firebase-config.ts # Firebase configuration
│   └── utils.ts          # Helper utilities
├── public/               # Static assets
└── styles/              # Global styles
```

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **pnpm** (recommended) or npm
- **Firebase project** with Firestore enabled
- **Razorpay account** (for payment features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/harsh-pandhe/logistics-dashboard.git
   cd logistics-dashboard
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   
   # Razorpay Configuration
   NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
   ```

4. **Configure Firebase**
   - Update `lib/firebase-config.ts` with your Firebase configuration
   - Set up Firestore security rules
   - Enable Authentication (Email/Password)

### Development

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linting
pnpm lint
```

The application will be available at `http://localhost:3000`

## 🔥 Firebase Setup

### Firestore Collections

The application uses the following Firestore collections:

```javascript
// Collection: shipments
{
  id: string,
  userId: string,
  trackingNumber: string,
  status: "pending" | "in_transit" | "delivered",
  origin: string,
  destination: string,
  weight: number,
  dimensions: object,
  createdAt: timestamp,
  updatedAt: timestamp
}

// Collection: users
{
  id: string,
  email: string,
  name: string,
  role: "user" | "admin",
  createdAt: timestamp
}
```

### Security Rules

Basic Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can read/write their own shipments
    match /shipments/{shipmentId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
  }
}
```

## 🎨 Customization

### Theme Configuration
The project uses Tailwind CSS with custom theme configuration in `tailwind.config.ts`. Modify colors, fonts, and other design tokens here.

### Adding New Components
Follow the shadcn/ui pattern for adding new components:

```bash
npx shadcn-ui@latest add [component-name]
```

## 📱 Features Overview

### User Dashboard
- View shipment statistics
- Recent shipments overview
- Quick access to main features

### Shipment Management
- Create new shipments with detailed information
- Track existing shipments
- View shipment history

### Admin Features
- Manage drivers
- Oversee all shipments
- Administrative controls

### Payment Integration
- Secure payment processing with Razorpay
- Payment status tracking
- Invoice generation

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Harsh Pandhe**
- GitHub: [@harsh-pandhe](https://github.com/harsh-pandhe)

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the amazing component library
- [Radix UI](https://www.radix-ui.com/) for accessible primitives
- [Firebase](https://firebase.google.com/) for backend services
- [Razorpay](https://razorpay.com/) for payment integration

## Contact

Harsh Pandhe - harshpandhehome@gmail.com
Project Link: https://github.com/harsh-pandhe/logistics-dashboard