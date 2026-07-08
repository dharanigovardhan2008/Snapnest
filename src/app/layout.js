import { Outfit, Geist } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '../context/AuthContext'; // Re-adding your context
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
  display: 'swap',
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${outfit.variable} ${geist.variable} scroll-smooth`}>
      <body className="antialiased bg-studio-white text-ink-black font-body">
        {/* Wrapping the app so useAuth() works everywhere */}
        <AuthProvider>
          {children}
          <Toaster position="bottom-center" />
        </AuthProvider>
      </body>
    </html>
  );
}