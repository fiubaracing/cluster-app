import * as yup from 'yup';

export const upsertTeamRequestBodySchema = yup.object({
    name: yup.string().required('Name is required'),
    description: yup.string().optional(),
})

export type UpsertTeamRequestBody = yup.InferType<typeof upsertTeamRequestBodySchema>;