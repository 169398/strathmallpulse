import * as z from "zod";


// USER
export const signInFormSchema = z.object({
  email: z.string().email().min(3, "Email must be at least 3 characters"),
  password: z.string().min(3, "Password must be at least 3 characters"),
});

export const signUpFormSchema = z
  .object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    email: z.string().email().min(3, "Email must be at least 3 characters"),
    password: z.string().min(3, "Password must be at least 3 characters"),
    confirmPassword: z
      .string()
      .min(3, "Confirm password must be at least 3 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
export const updateProfileSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email().min(3, "Email must be at least 3 characters"),
});

export const updateUserSchema = updateProfileSchema.extend({
  id: z.string().min(1, "Id is required"),
  role: z.string().min(1, "Role is required"),
});

export const onboardingSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  gender: z.enum(["Male", "Female", "Other"], {
    errorMap: () => ({ message: "Gender must be Male, Female, or Other" }),
  }),
  dateOfBirth: z.string().refine((val) => {
    const date = new Date(val);
    return !isNaN(date.getTime()) && date < new Date();
  }, "Please enter a valid date of birth"),
  course: z.string().min(2, "Course must be at least 2 characters"),
  year: z.enum(["1", "2", "3", "4", "5", "6"], {
    errorMap: () => ({ message: "Year must be between 1 and 6" }),
  }),
  relationshipStatus: z.enum(
    ["Single", "In a relationship"  ],
    {
      errorMap: () => ({ message: "Invalid relationship status" }),
    }
  ),
  university: z
    .string()
    .min(3, "University name must be at least 3 characters"),
  interests: z.array(z.string()).min(1, "At least one interest is required"),
});
