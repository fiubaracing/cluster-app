import * as yup from 'yup';

export const loginRequestBodySchema = yup.object({
    googleAccessToken: yup.string().required('Google access token is required'),
})

export type LoginRequestBody = yup.InferType<typeof loginRequestBodySchema>;