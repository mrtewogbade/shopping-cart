//All validation for auth to be done here
import { z } from "zod";
export const registerSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .min(3, "Name must be atleast 3 characters long"),
  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email address"),
  password: z
    .string({ required_error: "Password is required" })
    .min(8, "Password must be at least 8 characters long")
    .refine((val) => /[a-z]/.test(val), {
      message: "Password must contain at least one lowercase letter",
    })
    .refine((val) => /[A-Z]/.test(val), {
      message: "Password must contain at least one uppercase letter",
    })
    .refine((val) => /\d/.test(val), {
      message: "Password must contain at least one digit",
    })
    .refine((val) => /[!@#$%^&*(),.?":{}|<>]/.test(val), {
      message: "Password must contain at least one special character.",
    }),
  role: z
    .enum(["buyer", "seller"], { required_error: "Role is required" })
    .refine((value) => ["buyer", "seller"].includes(value), {
      message: "Role must be either 'buyer or seller'.",
    }),
});
export const verifyEmailOtpSchema = z.object({
  otp: z
    .string({ required_error: "OTP is required" })
    .min(6, "OTP must not be less than six characters")
    .max(6, "OTP must not exceed six characters"),
  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email address"),
});

export const loginSchema = z.object({
  phone_or_email: z
    .string({ required_error: "Email or phone number is required" })
    .refine(
      (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || /^\d{13}$/.test(val),
      {
        message: "Must be a valid email or an 11-digit phone number",
      }
    ),

  password: z
    .string({ required_error: "Password is required" })
    .min(8, "Password must be at least 8 characters long")
    .refine((val) => /[a-z]/.test(val), {
      message: "Password must contain at least one lowercase letter",
    })
    .refine((val) => /[A-Z]/.test(val), {
      message: "Password must contain at least one uppercase letter",
    })
    .refine((val) => /\d/.test(val), {
      message: "Password must contain at least one digit",
    })
    .refine((val) => /[!@#$%^&*(),.?":{}|<>]/.test(val), {
      message: "Password must contain at least one special character.",
    }),
});

export const CreateOtpSchema = z.object({
  phone_number: z
    .string({ required_error: "Phone number is required" })
    .min(8, "Phone number must be at least 8 characters long")
    .refine((val) => /^234\d{10,}$/.test(val), {
      message:
        "Phone number must start with '234' and be followed by at least 10 digits",
    }),
});
export const verifyOtpSchema = z.object({
  otp: z
    .string({ required_error: "OTP is required" })
    .min(4, "OTP must not be less than four characters")
    .max(4, "OTP must not exceed four characters"),
});
export const twoFASchema = z.object({
  two_factor_code: z
    .string({ required_error: "OTP is required" })
    .min(4, "OTP must not be less than four characters")
    .max(9, "OTP must not exceed nine characters"),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email address"),
});


export const resetPasswordSchema = z
  .object({
    password: z
      .string({ required_error: "Password is required" })
      .min(8, "Password must be at least 8 characters long")
      .refine((val) => /[a-z]/.test(val), {
        message: "Password must contain at least one lowercase letter",
      })
      .refine((val) => /[A-Z]/.test(val), {
        message: "Password must contain at least one uppercase letter",
      })
      .refine((val) => /\d/.test(val), {
        message: "Password must contain at least one digit",
      })
      .refine((val) => /[!@#$%^&*(),.?":{}|<>]/.test(val), {
        message: "Password must contain at least one special character.",
      }),

    confirm_password: z
      .string({ required_error: "Confirm password is required" })
      .min(8, "Confirm password must be at least 8 characters long"),
  })
  .refine((data) => data.password === data.confirm_password, {
    path: ["confirm_password"],  
    message: "Passwords do not match",
  });
