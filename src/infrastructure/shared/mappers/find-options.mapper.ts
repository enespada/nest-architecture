import {
  FindManyOptions,
  FindOneOptions,
} from '@domain/shared/interfaces/find-options.interface';

export class FindOptionsMapper {
  static mapFindManyOptionsToTypeOrmOptions<T>(
    options: FindManyOptions<T>,
  ): any {
    const where = FindOptionsMapper.transformWhereClause(options.where);
    return {
      where,
      relations: options.relations,
      order: options.order,
      take: options.take,
      skip: options.skip,
      select: options.select
        ? FindOptionsMapper.transformSelectClause(options.select)
        : undefined,
    };
  }

  static mapFindOneOptionsToTypeOrmOptions<T>(options: FindOneOptions<T>): any {
    const where = FindOptionsMapper.transformWhereClause(options.where);
    return {
      where,
      relations: options.relations,
      select: options.select
        ? FindOptionsMapper.transformSelectClause(options.select)
        : undefined,
    };
  }

  static transformWhereClause<T>(where: Partial<T>): Record<string, any> {
    if (!where) return {};
    const transformedWhere: Record<string, any> = {};
    for (const key in where) {
      if (typeof where[key] === 'object' && where[key] !== null) {
        transformedWhere[key as string] = { ...where[key] };
      } else {
        transformedWhere[key as string] = where[key];
      }
    }
    return transformedWhere;
  }

  static transformSelectClause<T>(select: (keyof T)[]): string[] {
    return select.map((field: keyof T) => field as string);
  }
}
