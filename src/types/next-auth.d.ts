import "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface User {
        _id?: string;
        email_verified_at?: Date;
        first_name?: string;
        last_name?: string;
        email?: string;
        organization_id?: string;
        organization_name?: string;
        owner?: string; 
        country?: string;
        encryptedPrivateKey?: string;
        salt?: string;
        nonce?: string;
        publicKey?: string;
    }

    interface Session {
        user: {
            _id?: string;
            email_verified_at?: Date;
            first_name?: string;
            last_name?: string;
            email?: string;
            organization_id?: string;
            organization_name?: string;
            owner?: string;
            country?: string;
            aesKey?: string;
            encryptedPrivateKey?: string;
            salt?: string;
            nonce?: string;
            publicKey?: string;
        } & DefaultSession["user"];
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        _id?: string;
        email_verified_at?: Date;
        first_name?: string;
        last_name?: string;
        email?: string;
        organization_id?: string;
        organization_name?: string;
        owner?: string;
        country?: string;
        aesKey?: string;
        encryptedPrivateKey?: string;
        salt?: string;
        nonce?: string;
        publicKey?: string;
    }
}
