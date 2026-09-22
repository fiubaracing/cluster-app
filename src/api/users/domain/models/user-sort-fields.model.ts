export const UserSortFieldsEnum = {
  EMAIL: "email",
  NAME: "name",
} as const;

export type UserSortFields =
  (typeof UserSortFieldsEnum)[keyof typeof UserSortFieldsEnum];
