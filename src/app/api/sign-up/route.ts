import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User.model";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    await dbConnect();

    try {
        const { username, email, password } = await req.json();

        const existingUsername = await UserModel.findOne({
            username, 
            isVerified: true,
        });
        if (existingUsername) {
            return Response.json(
                {
                    success: false,
                    message: "Username already exists",
                },
                { status: 400 }
            );
        }

        const existingEmail = await UserModel.findOne({
            email,
        });
        let verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        if (existingEmail) {
            if (existingEmail.isVerified) {
                return Response.json(
                    {
                        success: false,
                        message: "user already exists with this email address",
                    },
                    { status: 400 }
                );
            } else {
                existingEmail.password = password;
                existingEmail.verificationCode = verificationCode;
                existingEmail.verificationCodeExpiry = new Date(Date.now() + 3600000);
                await existingEmail.save();
            }
        } else {
            const verificationCodeExpiry = new Date(Date.now() + 3600000);

            const newUser = new UserModel({
                username,
                email,
                password,
                verificationCode,
                verificationCodeExpiry,
                isVerified: false,
                isAcceptingMessage: true,
                messsages: [],
            });
            await newUser.save();
        }
        const emailResponse = await sendVerificationEmail(email, username, verificationCode);
        if (!emailResponse.success) {
            return Response.json(
                {
                    success: false,
                    message: emailResponse.message,
                },
                { status: 500 }
            );
        }
        return Response.json(
            {
                success: true,
                message: "User registered successfully. Please verify your account.",
            },
            { status: 201 }
        );
    } catch (error) {
        console.log("Error while registering user ", error);
        return Response.json(
            {
                success: false,
                message: "Error while registering user",
            },
            {
                status: 500,
            }
        );
    }
}
