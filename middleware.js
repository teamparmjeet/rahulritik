import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  const url = req.nextUrl.clone();

  if (!token) {
    console.log("No token found, redirecting to /signin");
    url.pathname = "/signin";
    return NextResponse.redirect(url);
  }
  

  const usertype = token.usertype;

  if (url.pathname.startsWith("/main") && usertype !== "2") {
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  if (url.pathname.startsWith("/branch") && usertype !== "1") {
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  if (url.pathname.startsWith("/staff") && usertype !== "0") {
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/main/:path*", "/branch/:path*","/staff/:path*"],
};