// import { FirebaseServiceAccount } from 'next-firebase-auth-edge/lib/models';
// serverConfig.ts

import {FirebaseServiceAccount} from "next-firebase-auth-edge/libs";

const serviceAccount: FirebaseServiceAccount =  JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT_KEY || "{}"
);

if (Object.keys(serviceAccount).length === 0) {
  throw new Error(
    "The FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set. "+
    "Please set it to the contents of your service account key file."
  );
}

const serverConfig = {
  serviceAccount: serviceAccount,
  cookieName: process.env.COOKIE_NAME || "AuthToken",
  cookieSignatureKeys: [process.env.COOKIE_SIGNATURE_KEY || "default-secret-key"], // Rotate keys for security
  cookieSerializeOptions: {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Set to true in production
    sameSite: "strict" as "lax" | "strict" | "none" | undefined,
  },
};

export default serverConfig;
