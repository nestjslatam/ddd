import { Test, TestingModule } from '@nestjs/testing';
import { GetSingerByIdCriteriaController } from './get-singer-byId.controller';
import { QueryBus } from '@nestjs/cqrs';
import { GetSingerByIdQuery } from './get-singer-byId.query';

describe('GetSingerByIdCriteriaController', () => {
    let controller: GetSingerByIdCriteriaController;
    let queryBus: QueryBus;

    const mockQueryBus = {
        execute: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [GetSingerByIdCriteriaController],
            providers: [
                { provide: QueryBus, useValue: mockQueryBus },
            ],
        }).compile();

        controller = module.get<GetSingerByIdCriteriaController>(GetSingerByIdCriteriaController);
        queryBus = module.get<QueryBus>(QueryBus);
        jest.clearAllMocks();
    });

    it('should execute query', async () => {
        await controller.getById('id-1');
        expect(queryBus.execute).toHaveBeenCalledWith(expect.any(GetSingerByIdQuery));
    });
});
