import {createEnv} from '@t3-oss/env-nextjs'
import {z} from 'zod'

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(['development', 'test', 'production']),

    // CLOUDINARY
    CLOUDINARY_CLOUD_NAME: z.string(),
    CLOUDINARY_API_KEY: z.string(),
    CLOUDINARY_API_SECRET: z.string(),
    CLOUDINARY_URL: z.string(),

    // RESEND
    RESEND_API: z.string(),
    RESEND_FROM: z.string(),

    // GOOGLE CLOUD
    GOOGLE_CLOUD_PROJECT_ID: z.string(),
    GOOGLE_CLOUD_PRIVATE_KEY: z.string(),
    GOOGLE_CLOUD_CLIENT_EMAIL: z.string(),

    // IPAPI
    IPAPI_API_KEY: z.string(),

    // GEMINI
    GEMINI_API_KEY: z.string(),
  },

  client: {
    // CLOUDINARY
    NEXT_PUBLIC_CLOUDINARY_SECURE_DISTRIBUTION: z.string(),
    NEXT_PUBLIC_CLOUDINARY_PRIVATE_CDN: z.string(),

    // FIREBASE
    NEXT_PUBLIC_APIKEY: z.string(),
    NEXT_PUBLIC_AUTHDOMAIN: z.string(),
    NEXT_PUBLIC_PROJECTID: z.string(),
    NEXT_PUBLIC_STORAGEBUCKET: z.string(),
    NEXT_PUBLIC_MESSAGINGSENDERID: z.string(),
    NEXT_PUBLIC_APPID: z.string(),
    NEXT_PUBLIC_MEASUREMENTID: z.string(),

    // GOOGLE CLIENT
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: z.string(),
  },

  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    // CONVEX
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    CLOUDINARY_URL: process.env.CLOUDINARY_URL,

    NEXT_PUBLIC_CLOUDINARY_SECURE_DISTRIBUTION:
      process.env.NEXT_PUBLIC_CLOUDINARY_SECURE_DISTRIBUTION,
    NEXT_PUBLIC_CLOUDINARY_PRIVATE_CDN:
      process.env.NEXT_PUBLIC_CLOUDINARY_PRIVATE_CDN,

    // FIREBASE CLIENT
    NEXT_PUBLIC_APIKEY: process.env.NEXT_PUBLIC_APIKEY,
    NEXT_PUBLIC_AUTHDOMAIN: process.env.NEXT_PUBLIC_AUTHDOMAIN,
    NEXT_PUBLIC_PROJECTID: process.env.NEXT_PUBLIC_PROJECTID,
    NEXT_PUBLIC_STORAGEBUCKET: process.env.NEXT_PUBLIC_STORAGEBUCKET,
    NEXT_PUBLIC_MESSAGINGSENDERID: process.env.NEXT_PUBLIC_MESSAGINGSENDERID,
    NEXT_PUBLIC_APPID: process.env.NEXT_PUBLIC_APPID,
    NEXT_PUBLIC_MEASUREMENTID: process.env.NEXT_PUBLIC_MEASUREMENTID,

    // GOOGLE CLIENT
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,

    // RESEND
    RESEND_API: process.env.RESEND_API,
    RESEND_FROM: process.env.RESEND_FROM,

    // GOOGLE CLOUD
    GOOGLE_CLOUD_PROJECT_ID: process.env.GOOGLE_CLOUD_PROJECT_ID,
    GOOGLE_CLOUD_PRIVATE_KEY: process.env.GOOGLE_CLOUD_PRIVATE_KEY,
    GOOGLE_CLOUD_CLIENT_EMAIL: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,

    // IPAPI
    IPAPI_API_KEY: process.env.IPAPI_API_KEY,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  },

  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
})
