import {
  GetSingerByIdCriteriaController,
  GetSingerByIdQueryHandler,
} from './get-singer-byId';
import {
  GetSingersByCriteriaController,
  GetSingersQueryHandler,
} from './get-singers-criteria';

export { GetSingersByCriteriaController, GetSingersQueryHandler };

export const singerQueryControllers = [
  GetSingersByCriteriaController,
  GetSingerByIdCriteriaController,
];

export const singerQueryHandlers = [
  GetSingersQueryHandler,
  GetSingerByIdQueryHandler,
];
