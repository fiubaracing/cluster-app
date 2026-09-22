export class Paginated<T> {
  data!: T[];
  page!: number;
  limit!: number;
  total!: number;
}
