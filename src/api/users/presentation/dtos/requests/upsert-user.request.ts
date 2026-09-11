import * as yup from 'yup';

export const upserUserRequestBodySchema = yup.object({
    name: yup.string().optional(),
    email: yup.string().email('Invalid email format').required('Email is required'),
})

export type UpserUserRequestBody = yup.InferType<typeof upserUserRequestBodySchema>;