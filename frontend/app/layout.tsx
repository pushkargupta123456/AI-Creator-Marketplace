import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';
import { Providers } from '@/components/Providers';
import { THEME_KEY } from '@/lib/theme';
import type { Metadata, Viewport } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'CRE8R — Find the creators shaping the future of content',
    template: '%s · CRE8R',
  },
  description: 'Discover AI-native filmmakers, animators, designers and creative professionals.',
  applicationName: 'CRE8R',
  openGraph: {
    title: 'CRE8R — Find the creators shaping the future of content',
    description: 'Discover AI-native filmmakers, animators, designers and creative professionals.',
    siteName: 'CRE8R',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Matches --bg in each palette so the browser chrome blends in.
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#070708' },
  ],
};

/**
 * Runs before first paint so the correct palette is applied immediately —
 * without this there is a flash of light theme for dark-mode users.
 * Light is the CSS default, so a no-JS visitor still gets a usable page.
 */
const themeScript = `(function(){try{var s=localStorage.getItem('${THEME_KEY}');var t=(s==='light'||s==='dark')?s:(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme='dark';}})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={geistSans.variable} data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen bg-bg text-fg antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[200] focus:rounded-full focus:bg-purple focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-on-media"
        >
          Skip to content
        </a>
        <Providers>
          <Navbar />
          <main id="main" className="min-h-screen">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
