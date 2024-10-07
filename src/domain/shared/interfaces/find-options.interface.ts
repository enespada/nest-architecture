export interface FindManyOptions<T> {
  where?: Partial<T>;
  relations?: string[];
  order?: Record<string, 'ASC' | 'DESC'>;
  take?: number;
  skip?: number;
  select?: (keyof T)[];
}

export interface FindOneOptions<T> {
  where?: Partial<T>;
  relations?: string[];
  select?: (keyof T)[];
}
