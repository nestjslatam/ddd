import { Test, TestingModule } from '@nestjs/testing';
import { GetSingersQueryHandler } from './get-singers-criteria.query-handler';
import { SingerRepository } from '../../../../infrastructure/db';
import { GetSingersQuery } from './get-singers-criteria.query';

describe('GetSingersQueryHandler', () => {
    let handler: GetSingersQueryHandler;

    const mockSingerRepository = {
        find: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GetSingersQueryHandler,
                { provide: SingerRepository, useValue: mockSingerRepository },
            ],
        }).compile();

        handler = module.get<GetSingersQueryHandler>(GetSingersQueryHandler);
        jest.clearAllMocks();
    });

    it('should return mapped singers', async () => {
        const query = new GetSingersQuery('Active');

        const mockSingerDomain = {
            get id() { return 'id-1'; },
            props: {
                fullName: { unpack: () => 'Name' },
                picture: { unpack: () => 'path' },
                registerDate: { unpack: () => new Date() },
                subscribedDate: { unpack: () => null },
                isSubscribed: true,
                audit: {
                    unpack: () => ({
                        createdBy: 'user',
                        createdAt: new Date(),
                        updatedBy: 'user',
                        updatedAt: new Date(),
                        timestamp: 123456789,
                        deletedBy: null
                    })
                }
            }
        };

        mockSingerRepository.find.mockResolvedValue([mockSingerDomain]);

        await handler.execute(query);
        expect(mockSingerRepository.find).toHaveBeenCalled();
    });
});
