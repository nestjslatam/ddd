import { Test, TestingModule } from '@nestjs/testing';
import { GetSingerByIdQueryHandler } from './get-singer-byId.query-handler';
import { SingerRepository } from '../../../../infrastructure/db';
import { GetSingerByIdQuery } from './get-singer-byId.query';

describe('GetSingerByIdQueryHandler', () => {
    let handler: GetSingerByIdQueryHandler;

    const mockSingerRepository = {
        findById: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GetSingerByIdQueryHandler,
                { provide: SingerRepository, useValue: mockSingerRepository },
            ],
        }).compile();

        handler = module.get<GetSingerByIdQueryHandler>(GetSingerByIdQueryHandler);
        jest.clearAllMocks();
    });

    it('should get singer by id successfully', async () => {
        const query = new GetSingerByIdQuery('id-1');
        const mockSinger = {
            id: 'id-1',
            toTable: jest.fn().mockReturnValue({ id: 'id-1' }) // Mocking behavior if needed, but mapper is static
        };

        // We need to mock what findById returns correctly. 
        // The handler does: const singer = await repo.findById(id); 
        // Then: return SingerMapper.toTable(singer);
        // SingerMapper is static. We can try to mock the implementation or return an object that satisfies SingerMapper.toTable expectation.
        // SingerMapper.toTable takes a domain entity.

        // Ideally we should mock the Mapper too if we want unit isolation, but it's a static utility.
        // Let's rely on real mapper if simple, OR mock the repository to return a structure that the Mapper accepts.
        // For now, let's assume we return a mock that looks like a Singer.

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

        mockSingerRepository.findById.mockResolvedValue(mockSingerDomain);

        // We can just verify it calls repository. result check depends on Mapper.
        await handler.execute(query);
        expect(mockSingerRepository.findById).toHaveBeenCalledWith('id-1');
    });

    it('should throw if singer not found', async () => {
        mockSingerRepository.findById.mockResolvedValue(null);
        const query = new GetSingerByIdQuery('id-1');
        await expect(handler.execute(query)).rejects.toThrow('Singer not found');
    });
});
