import "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface User {
        _id?: string;
        isVerified?: boolean;
        firstName?: string;
        lastName?: string;
        email?: string;
        Phone?: string;
        company?: string;

    }

    interface Session {
        user: {
            _id?: string;
            isVerified?: boolean;
            firstName?: string;
            lastName?: string;
            email?: string;
            Phone?: string;
            company?: string;
        } & DefaultSession["user"];
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        _id?: string;
        isVerified?: boolean;
        firstName?: string;
        lastName?: string;
        email?: string;
        Phone?: string;
        company?: string;
    }
}
