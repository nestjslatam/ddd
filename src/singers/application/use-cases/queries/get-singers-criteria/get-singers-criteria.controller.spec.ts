import { Test, TestingModule } from '@nestjs/testing';
import { GetSingersByCriteriaController } from './get-singers-criteria.controller';
import { QueryBus } from '@nestjs/cqrs';
import { GetSingersDto } from './get-singers.dto';
import { GetSingersQuery } from './get-singers-criteria.query';

describe('GetSingersByCriteriaController', () => {
    let controller: GetSingersByCriteriaController;
    let queryBus: QueryBus;

    const mockQueryBus = {
        execute: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [GetSingersByCriteriaController],
            providers: [
                { provide: QueryBus, useValue: mockQueryBus },
            ],
        }).compile();

        controller = module.get<GetSingersByCriteriaController>(GetSingersByCriteriaController);
        queryBus = module.get<QueryBus>(QueryBus);
        jest.clearAllMocks();
    });

    it('should execute query', async () => {
        const dto = { status: 'Active' } as GetSingersDto;

        await controller.getAllByCriteria(dto);

        expect(queryBus.execute).toHaveBeenCalledWith(expect.any(GetSingersQuery));
    });
});
