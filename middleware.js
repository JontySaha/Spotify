import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.JWT_SECRET });

  const { pathname } = req.nextUrl;

  if (pathname.includes("/api/auth") || token) {
    return NextResponse.next();
  }

  if (!token && pathname !== "/login") {
    // const { newpath } = req.nextUrl.clone();
    // console.log(newpath);
    // url.pathname = "/login";
    // const loginUrl = new URL("/login", req.nextUrl);
    // console.log(new URL("/login", req.nextUrl));
    // const url = req.nextUrl.clone();
    // console.log((url.pathname = "/login"));
    return NextResponse.redirect("http://localhost:3000/login");
  }
}
