import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ListQueryDto, QueryOperator } from '../dto/list-query.dto';

export const ListQuery = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): ListQueryDto => {
    const request = ctx.switchToHttp().getRequest();
    const query = request.query;

    const page = parseInt(query.page as string, 10) || 1;
    const limit = parseInt(query.limit as string, 10) || 10;

    const filters: Record<string, any[]> = {};
    const sort: Record<string, 'ASC' | 'DESC'> = {};

    // Temporary storage to group conditions by field and operator
    // Structure: { [field]: { [operator]: value | value[] } }
    const filterMap: Record<string, Record<string, any>> = {};

    const addToMap = (field: string, operator: string, value: any) => {
      if (!filterMap[field]) filterMap[field] = {};
      
      if (filterMap[field][operator] === undefined) {
        filterMap[field][operator] = value;
      } else {
        // If we already have a value, it's likely an array ([0], [1] notation)
        if (!Array.isArray(filterMap[field][operator])) {
          filterMap[field][operator] = [filterMap[field][operator]];
        }
        filterMap[field][operator].push(value);
      }
    };

    // Parse filters (handling both nested objects and flat bracket keys with potential indices)
    for (const [key, value] of Object.entries(query)) {
      if (key.startsWith('filter')) {
        // Match: filter[field][operator] or filter[field][operator][index] or filter[field]
        const match = key.match(/^filter\[([^\]]+)\](?:\[([^\]]+)\])?(?:\[\d*\])?$/);
        
        if (match) {
          const [, field, operator = QueryOperator.EQUALS] = match;
          addToMap(field, operator, value);
        } else if (key === 'filter' && typeof value === 'object' && value !== null) {
          // Nested object structure (Express extended parser might already have done some work)
          for (const [field, condition] of Object.entries(value)) {
            if (typeof condition === 'object' && condition !== null) {
              for (const [op, val] of Object.entries(condition)) {
                addToMap(field, op, val);
              }
            } else {
              addToMap(field, QueryOperator.EQUALS, condition);
            }
          }
        }
      }
    }

    // Convert filterMap to the expected filters array format
    for (const [field, operators] of Object.entries(filterMap)) {
      filters[field] = [];
      for (const [op, val] of Object.entries(operators)) {
        filters[field].push({
          operator: op as QueryOperator,
          value: val,
        });
      }
    }

    // Parse sort (handling both nested objects and flat keys)
    for (const [key, value] of Object.entries(query)) {
      if (key.startsWith('sort')) {
        const match = key.match(/^sort\[([^\]]+)\]$/);
        if (match) {
          const [, field] = match;
          if (typeof value === 'string' && (value.toUpperCase() === 'ASC' || value.toUpperCase() === 'DESC')) {
            sort[field] = value.toUpperCase() as 'ASC' | 'DESC';
          }
        } else if (key === 'sort' && typeof value === 'object' && value !== null) {
          for (const [field, direction] of Object.entries(value)) {
            if (typeof direction === 'string' && (direction.toUpperCase() === 'ASC' || direction.toUpperCase() === 'DESC')) {
              sort[field] = direction.toUpperCase() as 'ASC' | 'DESC';
            }
          }
        }
      }
    }

    return {
      page,
      limit,
      filters,
      sort,
    };
  },
);
