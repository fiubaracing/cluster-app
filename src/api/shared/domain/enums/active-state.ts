export const ActiveState = {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
} as const;

export type ActiveStateType = keyof typeof ActiveState;