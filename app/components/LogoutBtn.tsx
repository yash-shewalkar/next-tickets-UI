import React from 'react';
import { signOut } from "firebase/auth";
import { deleteCookie } from "cookies-next";  // To remove the cookie
import { auth } from "@/configs/fireconfig";
import { useRouter } from "next/router";  // Correct import for router

const LogoutBtn = () => {
  const router = useRouter();  // Correct use of useRouter inside the component

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
    <button
      onClick={handleLogout}
      className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-200"
    >
      Logout
    </button>
  );
}

export default LogoutBtn;
