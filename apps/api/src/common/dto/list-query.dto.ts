export enum QueryOperator {
  EQUALS = 'eq',
  CONTAINS = 'cont',
  GREATER_THAN = 'gt',
  GREATER_THAN_OR_EQUAL = 'gte',
  LESS_THAN = 'lt',
  LESS_THAN_OR_EQUAL = 'lte',
  IN = 'in',
  IS_NULL = 'null',
  BETWEEN = 'bet',
}

export type FilterValue = string | number | boolean | string[] | number[];

export class FilterCondition {
  operator: QueryOperator;
  value: FilterValue;
}

export class ListQueryDto {
  page: number;
  limit: number;
  filters: Record<string, FilterCondition[]>;
  sort: Record<string, 'ASC' | 'DESC'>;
}
