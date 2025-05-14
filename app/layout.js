import { Roboto } from 'next/font/google';
import { AuthProvider } from "./Providers";
import "./globals.css";
const roboto = Roboto({
  weight: '400',
  subsets: ['latin'],
});

export const metadata = {
  title: "TIFA EDUCATION PVT LTD| Best institutute with 100 % Placement",
  description: "An Education training institute since 2010. Formally our institute known as balaji computer.",
}


export default function RootLayout({ children }) {

  return (
    <html lang="en">
      <body className={roboto.className}>

        <AuthProvider>

          {children}
        </AuthProvider>

      </body>
    </html>
  );
}
