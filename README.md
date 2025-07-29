# Chat App New

A modern, real-time chat application built with Next.js, React, and Supabase. Features both authenticated and anonymous chat modes with a sleek, responsive design.

## 🚀 Live Demo

**[View Live Application](https://chat-app-new-one.vercel.app/)**

## ✨ Features

- **Real-time Chat**: Instant messaging with live updates
- **Dual Chat Modes**:
  - Authenticated chat for registered users
  - Anonymous chat for quick conversations
- **Responsive Design**: Optimized for desktop and mobile devices
- **Modern UI**: Clean interface built with Tailwind CSS and Radix UI
- **Authentication**: Secure user authentication with Supabase
- **Chat Management**: Create, manage, and navigate between multiple chats
- **Mobile-First**: Touch-friendly interface with swipe gestures
- **Dark/Light Theme**: Theme toggle support
- **TypeScript**: Full type safety throughout the application

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) with App Router
- **Frontend**: [React 18](https://reactjs.org/) with TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/)
- **Backend**: [Supabase](https://supabase.com/) (Database & Authentication)
- **Form Handling**: [React Hook Form](https://react-hook-form.com/) with Zod validation
- **Icons**: [Lucide React](https://lucide.dev/)
- **Deployment**: [Vercel](https://vercel.com/)

## 🏗️ Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── anonymous-chat/     # Anonymous chat page
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── chat/              # Main chat pages
│   ├── login/             # Login page
│   ├── signup/            # Signup page
│   └── reset-password/    # Password reset page
├── components/            # Reusable React components
│   ├── ui/               # UI component library
│   ├── chat-*.tsx        # Chat-specific components
│   └── *.tsx             # Other components
├── context/              # React Context providers
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and services
├── types/                # TypeScript type definitions
├── styles/               # Global styles
└── public/              # Static assets
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- Supabase account

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/ChathuraJanithya/chat-app-new.git
   cd chat-app-new
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Environment Setup**

   Create a `.env.local` file in the root directory:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Database Setup**

   Run the SQL scripts in the `scripts/` folder to set up your Supabase database:

   ```sql
   -- Run these in your Supabase SQL editor
   scripts/create-tables.sql
   scripts/setup-database-v2.sql
   ```

5. **Start the development server**

   ```bash
   pnpm dev
   # or
   npm run dev
   ```

6. **Open your browser**

   Navigate to [http://localhost:3001](http://localhost:3001)

## 📱 Usage

### Anonymous Chat

- Visit the app and start chatting immediately without registration
- Perfect for quick conversations and testing

### Authenticated Chat

- Sign up or log in to access persistent chat history
- Create multiple chat rooms
- Manage your conversations across devices

### Mobile Experience

- Responsive design works seamlessly on mobile devices
- Swipe gestures for navigation
- Touch-optimized interface

## 🔧 Development

### Available Scripts

```bash
# Development
pnpm dev          # Start development server on port 3001

# Building
pnpm build        # Build for production
pnpm start        # Start production server

# Linting
pnpm lint         # Run ESLint
```

### Database Schema

The application uses the following main tables:

- `users` - User authentication and profiles
- `chats` - Chat room information
- `messages` - Individual chat messages

## 🌐 Deployment

This application is deployed on Vercel. To deploy your own instance:

1. Fork this repository
2. Connect your GitHub repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy automatically on every push to main branch

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 📞 Contact

**Chathura Janithya** - [@ChathuraJanithya](https://github.com/ChathuraJanithya)

Project Link: [https://github.com/ChathuraJanithya/chat-app-new](https://github.com/ChathuraJanithya/chat-app-new)

---

⭐ **If you found this project helpful, please give it a star!**
