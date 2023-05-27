import { validateBufferMIMEType } from "validate-image-type";
import * as yup from "yup";

//------------------------------------------------------------------- CUSTOM REUSABLE SCHEMAS
const usernameSchema = yup.string()
    .max(20)
    .matches(/^[a-zA-Z0-9_]*$/);

const emailSchema = yup.string().email();

const passwordSchema = yup.string()
    .matches(/^(?!.* )/)
    .min(6);

const imageFileSchema = yup.mixed<Express.Multer.File>()
    .test(
        "valid-image",
        "the uploaded file is not a valid image",
        async file => {
            if (!file) return true;
            const result = await validateBufferMIMEType(file.buffer,
                {
                    allowMimeTypes: ["image/png", "image/jpeg"]
                });
            return result.ok
        }
    );

//------------------------------------------------------------------------- signUp
const signUpBodySchema = yup.object({
    username: usernameSchema.required(),
    email: emailSchema.required(),
    password: passwordSchema.required(),
    verificationCode: yup.string().required(),
});

export type SignUpBody = yup.InferType<typeof signUpBodySchema>;

export const signUpSchema = yup.object({
    body: signUpBodySchema,
});

//------------------------------------------------------------------------- updateUser
const updateUserBodySchema = yup.object({
    username: usernameSchema,
    displayName: yup.string().max(20),
    about: yup.string().max(160),
});

export type UpdateUserBody = yup.InferType<typeof updateUserBodySchema>;

export const updateUserSchema = yup.object({
    body: updateUserBodySchema,
    file: imageFileSchema,
});

//------------------------------------------------------------------------- requestEmailVerificationCode
export const requestEmailVerificationCodeSchema = yup.object({
    body: yup.object({
        email: emailSchema.required(),
    }),
});

export type RequestEmailVerificationCodeBody = yup.InferType<typeof requestEmailVerificationCodeSchema>["body"];

//--------------------------------------------------------------------------- requestResetPasswordCode
export const requestResetPasswordCodeSchema = yup.object({
    body: yup.object({
        email: emailSchema.required(),
    }),
});

export type RequestResetPasswordCodeBody = yup.InferType<typeof requestResetPasswordCodeSchema>["body"];

//--------------------------------------------------------------------------- resetPassword
const resetPasswordBodySchema = yup.object({
    email: emailSchema.required(),
    password: passwordSchema.required(),
    verificationCode: yup.string().required(),
});

export type ResetPasswordBody = yup.InferType<typeof resetPasswordBodySchema>;

export const resetPasswordSchema = yup.object({
    body: resetPasswordBodySchema,
});