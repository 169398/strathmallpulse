"use server";

import { isRedirectError } from "next/dist/client/components/redirect";

import { auth, signIn, signOut } from "@/auth";
import {
  
  onboardingSchema,
  signInFormSchema,
  signUpFormSchema,
  updateUserSchema,
} from "../validator";
import { formatError } from "../utils";
import { hashSync } from "bcrypt-ts-edge";
import {  users } from "@/db/schema";
import { count, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { PAGE_SIZE } from "../constants";
import db from "@/db/drizzle";

import { sendVerificationEmail } from "@/emailverify";
import { sendResetPasswordEmail } from "@/emailreset-password";
import { addMinutes } from "date-fns";

// USER

export async function signUp(prevState: unknown, formData: FormData) {
  try {
    const user = signUpFormSchema.parse({
      name: formData.get("name"),
      email: formData.get("email"),
      confirmPassword: formData.get("confirmPassword"),
      password: formData.get("password"),
    });
    const values = {
      id: crypto.randomUUID(),
      ...user,
      password: hashSync(user.password, 10),
    };

    await db.insert(users).values(values);

    await sendVerificationEmail({
      name: "",
      resetToken: "",
      resetTokenExpires: null,
      email: user.email ?? "",
      password: null,
      id: "",
      role: "",
      emailVerified: null,
      image: null,
      createdAt: null,
      gender: null,
      dateOfBirth: null,
      course: null,
      year: null,
      relationshipStatus: null,
      university: null,
      interests: null
    });

    return {
      success: true,
      message:
        "User created successfully. Please check your email for verification.",
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error).includes(
        'duplicate key value violates unique constraint "user_email_idx"'
      )
        ? "Email already exists"
        : formatError(error),
    };
  }
}
export async function signInWithCredentials(
  prevState: unknown,
  formData: FormData
) {
  try {
    const user = signInFormSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });
    await signIn("credentials", user);
    return { success: true, message: "Sign in successfully" };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    return { success: false, message: "Invalid email or password" };
  }
}

export const SignInWithEmail = async (formData:any) => {
  await signIn("email", formData);
};

export const SignInWithGoogle = async () => {
  await signIn("google");
};

export const SignOut = async () => {
  await signOut();
};

//RESET PASSWORD
const requestResetSchema = z.object({
  email: z.string().email(),
});

// Reset Password Schema
const resetPasswordSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(8),
});

export const requestPasswordReset = async (formData: FormData) => {
  try {
    const data = requestResetSchema.parse({
      email: formData.get("email"),
    });

    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, data.email),
    });

    if (!user) {
      throw new Error("No user found with this email address.");
    }

    // Generate a reset token
    const resetToken = crypto.randomUUID();
    const expiresAt = addMinutes(new Date(), 60);
    console.log(resetToken);
    await db
      .update(users)
      .set({ resetToken, resetTokenExpires: expiresAt })
      .where(eq(users.id, user.id));

    // Send reset email
    await sendResetPasswordEmail(user, resetToken);

    return {
      success: true,
      message: "Password reset email sent successfully.",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
};

export const resetPassword = async (formData: FormData) => {
  try {
    const token = formData.get("token") as string;
    const newPassword = formData.get("newPassword") as string;

    const data = resetPasswordSchema.parse({
      token,
      newPassword,
    });

    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.resetToken, data.token),
    });

    if (!user) {
      throw new Error("Invalid or expired reset token.");
    }

    if (
      user.resetTokenExpires &&
      new Date() > new Date(user.resetTokenExpires)
    ) {
      throw new Error("Reset token has expired.");
    }

    const hashedPassword = hashSync(data.newPassword, 10);
    await db
      .update(users)
      .set({
        password: hashedPassword,
        resetToken: null,
        resetTokenExpires: null,
      })
      .where(eq(users.id, user.id));

    revalidatePath("/sign-in");

    return { success: true, message: "Password reset successfully." };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
};

// GET
export async function getAllUsers({
  limit = PAGE_SIZE,
  page,
}: {
  limit?: number;
  page: number;
}) {
  const data = await db.query.users.findMany({
    orderBy: [desc(users.createdAt)],
    limit,
    offset: (page - 1) * limit,
  });
  const dataCount = await db.select({ count: count() }).from(users);
  return {
    data,
    totalPages: Math.ceil(dataCount[0].count / limit),
  };
}

export async function getUserById(userId: string) {
  const user = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.id, userId),
  });
  if (!user) throw new Error("User not found");
  return user;
}

// DELETE

export async function deleteUser(id: string) {
  try {
    await db.delete(users).where(eq(users.id, id));
    revalidatePath("/admin/users/seller");
    return {
      success: true,
      message: "User deleted successfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// UPDATE
export async function updateUser(user: z.infer<typeof updateUserSchema>) {
  try {
    await db
      .update(users)
      .set({
        name: user.name,
        role: user.role,
      })
      .where(eq(users.id, user.id));
    revalidatePath("/admin/users");
    return {
      success: true,
      message: "User updated successfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

export async function updateProfile(user: { name: string; email: string }) {
  try {
    const session = await auth();
    const currentUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, session?.user.id!),
    });
    if (!currentUser) throw new Error("User not found");
    await db
      .update(users)
      .set({
        name: user.name,
      })
      .where(eq(users.id, currentUser.id));

    return {
      success: true,
      message: "User updated successfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

export async function submitOnboarding(formData: FormData) {
  try {
    // Parse and validate form data using the schema
    const onboardingData = onboardingSchema.parse({
      name: formData.get("name"),
      gender: formData.get("gender"),
      dateOfBirth: formData.get("dateOfBirth"),
      course: formData.get("course"),
      year: formData.get("year"),
      relationshipStatus: formData.get("relationshipStatus"),
      university: formData.get("university"),
      interests: formData.getAll("interests"),
    });

    const session = await auth(); // Fetch the current authenticated user
    if (!session?.user?.id) throw new Error("User is not authenticated");

    const hashedPassword = hashSync(formData.get("password") as string, 10);

    // Update the user in the database with the onboarding data
    await db
      .update(users)
      .set({
        name: onboardingData.name,
        gender: onboardingData.gender,
        dateOfBirth: new Date(onboardingData.dateOfBirth),
        course: onboardingData.course,
        year: onboardingData.year,
        relationshipStatus: onboardingData.relationshipStatus,
        university: onboardingData.university,
        interests: onboardingData.interests, 
      })
      .where(eq(users.id, session.user.id));

    revalidatePath("/"); 

    return { success: true, message: "Onboarding completed successfully" };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

export async function getOnboardingData(userId: string) {
  try {
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, userId),
    });
    if (!user) throw new Error("User not found");

    // Parse and return the user's onboarding data
    return {
      name: user.name,
      gender: user.gender,
      dateOfBirth: user.dateOfBirth,
      course: user.course,
      year: user.year,
      relationshipStatus: user.relationshipStatus,
      university: user.university,
      interests: Array.isArray(user.interests) ? user.interests : (typeof user.interests === 'string' ? (user.interests as string).split(", ") : [])
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}