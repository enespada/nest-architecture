export interface FindOneOptions<T> {
  where?: Partial<T>;
  relations?: string[];
  select?: (keyof T)[];
}
