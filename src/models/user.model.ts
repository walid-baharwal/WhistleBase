import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface User extends Document {
    firstName: string;
    lastName: string;
    email: string;
    Phone: string;
    company: string;
    password: string;
    verificationCode: string;
    verificationCodeExpiry: Date;
    isVerified: boolean;
    isPasswordCorrect: (password: string) => Promise<boolean>;
}

const userSchema: Schema<User> = new Schema(
    {
        firstName: {
            type: String,
            required: [true, "First name is required"],
            trim: true,
        },
        lastName: {
            type: String,
            required: [true, "Last name is required"],
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/.+\@.+\..+/, "Please use a valid email address"],
        },
        Phone: {
            type: String,
            required: [true, "Phone number is required"],
            unique: true,
            trim: true,
        },
        company: {
            type: String,
            required: [true, "Company name is required"],
            trim: true,
        },
        password: {
            type: String,
            required: [true, "Password is required"],
        },
        verificationCode: {
            type: String,
            required: [true, "Verification key is required"],
        },
        verificationCodeExpiry: {
            type: Date,
            required: [true, "Verification key Expiry is required"],
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.isPasswordCorrect = async function (
    this: User,
    password: string
): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
};

const UserModel =
    (mongoose.models.User as mongoose.Model<User>) || mongoose.model<User>("User", userSchema);

export default UserModel;
