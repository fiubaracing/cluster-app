export const SortDirectionEnum = {
  ASC: "ASC",
  DESC: "DESC",
} as const;

export type SortDirection =
  (typeof SortDirectionEnum)[keyof typeof SortDirectionEnum];
