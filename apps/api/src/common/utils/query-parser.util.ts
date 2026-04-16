import {
  And,
  Between,
  FindManyOptions,
  FindOptionsOrder,
  FindOptionsWhere,
  ILike,
  In,
  IsNull,
  LessThan,
  LessThanOrEqual,
  MoreThan,
  MoreThanOrEqual,
  ObjectLiteral,
  Repository,
} from 'typeorm';
import { ListQueryDto, QueryOperator } from '../dto/list-query.dto';
import { PaginatedResponseDto } from '@transix/shared-types';

export class QueryParser {
  static parse<T extends ObjectLiteral>(query: ListQueryDto): FindManyOptions<T> {
    const { page, limit, filters, sort } = query;

    return {
      skip: (page - 1) * limit,
      take: limit,
      where: this.parseFilters<T>(filters),
      order: this.parseSort<T>(sort),
    };
  }

  static async findAndPaginate<T extends ObjectLiteral>(
    repository: Repository<T>,
    query: ListQueryDto,
    additionalOptions: FindManyOptions<T> = {},
  ): Promise<PaginatedResponseDto<T>> {
    const parsedOptions = this.parse(query);
    const options = {
      ...additionalOptions,
      ...parsedOptions,
      where: {
        ...(additionalOptions.where as any || {}),
        ...(parsedOptions.where as any || {}),
      }
    } as FindManyOptions<T>;

    const [data, total] = await repository.findAndCount(options);

    return {
      data,
      total,
      page: query.page,
      limit: query.limit,
    };
  }

  private static parseFilters<T extends ObjectLiteral>(filters: Record<string, any[]>): FindOptionsWhere<T> {
    const where: any = {};

    for (const [field, conditions] of Object.entries(filters)) {
      const fieldOperators: any[] = [];
      
      for (const condition of conditions) {
        const { operator, value } = condition;
        
        let typeormOperator;
        switch (operator) {
          case QueryOperator.EQUALS:
            typeormOperator = value;
            break;
          case QueryOperator.CONTAINS:
            typeormOperator = ILike(`%${value}%`);
            break;
          case QueryOperator.GREATER_THAN:
            typeormOperator = MoreThan(value);
            break;
          case QueryOperator.GREATER_THAN_OR_EQUAL:
            typeormOperator = MoreThanOrEqual(value);
            break;
          case QueryOperator.LESS_THAN:
            typeormOperator = LessThan(value);
            break;
          case QueryOperator.LESS_THAN_OR_EQUAL:
            typeormOperator = LessThanOrEqual(value);
            break;
          case QueryOperator.IN:
            typeormOperator = In(Array.isArray(value) ? value : [value]);
            break;
          case QueryOperator.IS_NULL:
            typeormOperator = value === 'true' || value === true ? IsNull() : value;
            break;
          case QueryOperator.BETWEEN:
            let range = value;
            if (typeof value === 'string' && value.startsWith('[') && value.endsWith(']')) {
              try {
                range = JSON.parse(value);
              } catch (e) {
                // handle non-JSON array format if needed
              }
            }
            if (Array.isArray(range) && range.length === 2) {
              typeormOperator = Between(range[0], range[1]);
            }
            break;
          default:
            typeormOperator = value;
        }

        if (typeormOperator !== undefined) {
          fieldOperators.push(typeormOperator);
        }
      }

      if (fieldOperators.length > 0) {
        where[field] = fieldOperators.length > 1 ? And(...fieldOperators) : fieldOperators[0];
      }
    }

    return where;
  }

  private static parseSort<T extends ObjectLiteral>(sort: Record<string, 'ASC' | 'DESC'>): FindOptionsOrder<T> {
    return sort as FindOptionsOrder<T>;
  }
}
