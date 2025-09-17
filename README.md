# Bharat Legal Bot

A comprehensive legal assistance bot built with modern web technologies to provide legal information and guidance.

## Project Overview

This project is a React-based web application that serves as a legal assistance bot, helping users with legal queries and providing relevant information.

## Technologies Used

This project is built with:

- **Vite** - Fast build tool and development server
- **TypeScript** - Type-safe JavaScript
- **React 18** - Modern React with hooks
- **shadcn/ui** - Beautiful and accessible UI components
- **Tailwind CSS** - Utility-first CSS framework
- **Supabase** - Backend as a Service
- **React Query** - Data fetching and state management
- **React Router** - Client-side routing

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn package manager
- Gemini AI API key (get from [Google AI Studio](https://makersuite.google.com/app/apikey))
- Supabase account (optional, for user authentication)

### Installation

1. **Clone the repository**
   ```bash
   git clone <YOUR_REPOSITORY_URL>
   cd bharat-legal-bot-main
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit .env and add your API keys
   # VITE_GEMINI_API_KEY=your_gemini_api_key_here
   # VITE_SUPABASE_URL=your_supabase_url_here
   # VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:8080` to view the application.

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Required: Gemini AI API Key
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Supabase Configuration (for user authentication)
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Optional: Application Configuration
VITE_APP_NAME=LegalEase India
VITE_APP_VERSION=1.0.0
```

**Important**: Never commit your `.env` file to version control. The `.env.example` file is provided as a template.

### Security Notes

- The `.env` file is already added to `.gitignore` to prevent accidental commits
- API keys are now loaded from environment variables instead of being hardcoded
- For production deployment, set these environment variables in your hosting platform
- Never share your actual API keys in public repositories or chat messages

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run build:dev` - Build for development
- `npm run lint` - Run ESLint to check code quality
- `npm run preview` - Preview production build locally

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── hooks/         # Custom React hooks
├── utils/         # Utility functions
├── types/         # TypeScript type definitions
└── styles/        # Global styles and CSS
```

## Development

The project uses:
- **ESLint** for code linting
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **shadcn/ui** for component library

## Building for Production

To create a production build:

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the MIT License.
