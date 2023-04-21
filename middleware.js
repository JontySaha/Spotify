import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.JWT_SECRET });

  const { pathname } = req.nextUrl;
  const url = req.nextUrl.clone();

  if (pathname.includes("/api/auth") || token) {
    return NextResponse.next();
  }

  // if (!token && url.pathname !== "/login") {
  //   req.nextUrl.pathname += "localhost:3000/login";
  //   return NextResponse.redirect(req.nextUrl);
  // }

  // if (!token && pathname !== "/login") {
  //   redirect("http://localhost:3000/login");
  // }
}
