import { NextRequest, NextResponse } from "next/server";
import { getCookie } from "cookies-next";


export async function middleware(req: NextRequest) {


  const role = (await getCookie("userRole", { req })) as string;
  console.log("middleware is running", role);
  const pathname = req.nextUrl.pathname;

  // Prevent infinite redirects
  if (role === "agent" && pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard-agent", req.url));
  }
  if(role === "agent" && pathname === "/dashboard-client"){
    return NextResponse.redirect(new URL("/dashboard-agent", req.url));
  }
  if(role === "agent" && pathname === "/ticket-client"){
    return NextResponse.redirect(new URL("/ticket-agent", req.url));
  }
  if(role === "customer" && pathname === "/"){
    return NextResponse.redirect(new URL("/dashboard-client", req.url));
  }
  if(role === "customer" && pathname === "/dashboard-agent"){
    return NextResponse.redirect(new URL("/dashboard-client", req.url));
  }
  if(role === "customer" && pathname === "/ticket-agent"){
    return NextResponse.redirect(new URL("/ticket-client", req.url));
  }
  if(!role){
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

// Apply middleware only to these routes (excluding API and static files)
export const config = {
  matcher: ["/", "/dashboard-client", "/dashboard-agent", "/ticket-client", "/ticket-agent"],
};

  