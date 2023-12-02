import {
  GetSingersByCriteriaController,
  GetSingersQueryHandler,
} from './get-singers-criteria';

export { GetSingersByCriteriaController, GetSingersQueryHandler };

export const singerQueryControllers = [GetSingersByCriteriaController];

export const singerQueryHandlers = [GetSingersQueryHandler];
