"use client";
import { signOut } from "firebase/auth";
import { deleteCookie } from "cookies-next";  // To remove the cookie
import { auth } from "@/configs/fireconfig";  // Adjust this to your actual firebase config import
import { useRouter } from "next/navigation";
import LogoutBtn from "./components/LogoutBtn";

export default function Home() {

  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Step 1: Sign out the user from Firebase Authentication
      await signOut(auth);

      // Step 2: Remove the token from the cookies
      deleteCookie("token");  // Remove token cookie

      // Step 3: Redirect to the login page
      router.push("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <LogoutBtn />
    </div>
  );
}
