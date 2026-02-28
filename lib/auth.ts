// import { NextAuthOptions } from "next-auth";
// import GoogleProvider from "next-auth/providers/google";
// import FacebookProvider from "next-auth/providers/facebook";
// import CredentialsProvider from "next-auth/providers/credentials";
// import dbConnect from "@/lib/db";
// import User from "@/models/User";
// import bcrypt from "bcryptjs";

// export const authOptions: NextAuthOptions = {
//   providers: [
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID || "",
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
//     }),
//     FacebookProvider({
//       clientId: process.env.FACEBOOK_CLIENT_ID || "",
//       clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "",
//     }),
//     CredentialsProvider({
//       name: "Credentials",
//       credentials: {
//         email: { label: "Email", type: "email" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials) {
//         if (!credentials?.email || !credentials?.password) {
//           return null;
//         }
//         await dbConnect();

//         // We need to explicitly type the user find result or cast it
//         const user = await User.findOne({ email: credentials.email }).select(
//           "+password",
//         );

//         if (!user) {
//           return null;
//         }

//         //                 if (user.status === 'pending') {
//         //   throw new Error('Your account is pending approval by an administrator.');
//         // }
//         if (user.status === "banned" || user.status === "suspended") {
//           throw new Error(`Your account has been ${user.status}.`);
//         }

//         const isMatch = await bcrypt.compare(
//           credentials.password,
//           user.password as string,
//         );

//         if (!isMatch) {
//           return null;
//         }

//         return {
//           id: user._id.toString(),
//           name: user.name,
//           email: user.email,
//           image: user.image,
//           role: user.role,
//           status: user.status,
//         };
//       },
//     }),
//   ],
//   callbacks: {
//     async session({ session, token }) {
//       if (token && session.user) {
//         session.user.id = token.sub;
//         session.user.role = token.role as string;
//         session.user.status = token.status as string;
//       }
//       return session;
//     },
//     async jwt({ token, user }) {
//       if (user) {
//         token.role = user.role;
//         token.status = user.status;
//       }
//       return token;
//     },
//   },
//   pages: {
//     signIn: "/auth/signin",
//   },
//   session: {
//     strategy: "jwt",
//   },
//   secret: process.env.NEXTAUTH_SECRET,
// };

import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Business from "@/models/Business";
import bcrypt from "bcryptjs";
// import { fetchExternalBusiness } from "@/lib/externalSync";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID || "",
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        await dbConnect();
        const user = await User.findOne({ email: credentials.email }).select(
          "+password",
        );
        if (!user) return null;

        if (user.status === "banned" || user.status === "suspended") {
          throw new Error(`Your account has been ${user.status}.`);
        }

        const isMatch = await bcrypt.compare(
          credentials.password,
          user.password as string,
        );
        if (!isMatch) return null;

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          status: user.status,
        };
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }: any) {
      // Only handle OAuth providers — credentials users are created via /api/auth/register
      if (account?.provider === "credentials") return true;

      try {
        await dbConnect();

        let dbUser = await User.findOne({ email: user.email });

        if (!dbUser) {
          // First time OAuth sign-in — create the user
          dbUser = await User.create({
            name: user?.name || "Unknown User",
            email: user?.email,
            image: user?.image,
            provider: account?.provider, // "google" or "facebook"
            role: "buyer",
            status: "pending",
          });
        } else {
          // Existing user — block if banned/suspended
          if (dbUser.status === "banned" || dbUser.status === "suspended") {
            return `/auth/signin?error=Your account has been ${dbUser.status}.`;
          }

          // Keep image in sync with OAuth provider
          if (user.image && dbUser.image !== user.image) {
            await User.findByIdAndUpdate(dbUser._id, { image: user.image });
          }
        }

        // Sync business from external API if not already done
        const existingBusiness = await Business.findOne({ owner: dbUser._id });
        if (!existingBusiness) {
          const externalData: any = await fetch(
            `${process.env.ACD_API}/users/${user.email}`,
          );
          const { data } = await externalData.json();
          console.log("ACD Response Data:", data);
          if (data.business) {
            await Business.create({
              owner: dbUser._id,
              name: data.business.businessName || dbUser.name,
              description: data.business.description,
              phone: data.business.phone,
              email: data.business.email,
              address: data.business.address,
              type: data.business.type,
              image: data.business.logo,
              categories: data.business.categories || [],
              socials: data.business.socials || [],
              bankDetails: data.business.bankDetails || [],
              certifications: data.business.certifications || [],
              businessHours: data.business.businessHours,
              qrCode: data.business.qrCode,
            });
          } else {
            // if no returned from ACD API, create a default business for the user
            await Business.create({
              owner: dbUser._id,
              name: dbUser.name,
              email: dbUser.email,
            });
          }
        }

        // Pass db values back onto the user object so jwt callback can read them
        user.id = dbUser._id.toString();
        user.role = dbUser.role;
        user.status = dbUser.status;
      } catch (err) {
        console.error("OAuth signIn error:", err);
        // Don't block sign-in for non-auth errors
      }

      return true;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub;
        session.user.role = token.role as string;
        session.user.status = token.status as string;
      }
      return session;
    },

    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.role = user.role;
        token.status = user.status;
      }
      return token;
    },
  },

  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
