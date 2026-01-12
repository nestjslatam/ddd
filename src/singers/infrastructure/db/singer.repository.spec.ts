import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SingerRepository } from './singer.repository';
import { SingerTable, SongTable } from '../db/tables';
import { SingerMapper, SongMapper } from '../mappers';
import { DatabaseException } from '../../../shared/exceptions';
import { BrokenRulesException } from '@nestjslatam/ddd-lib';

// Mock Mappers
jest.mock('../mappers/singer.mapper');
jest.mock('../mappers/song.mapper');

describe('SingerRepository', () => {
    let repository: SingerRepository;
    let typeOrmRepo: Repository<SingerTable>;
    // let typeOrmSongRepo: Repository<SongTable>; // Not explicitly used directly in methods other than via manager

    const mockSingerDomain = {
        id: 'singer-1',
        IsValid: true,
        BrokenRules: { asString: () => '' }
    } as any;

    const mockSingerTable = { id: 'singer-1', fullName: 'Singer' } as SingerTable;
    const mockSongTable = { id: 'song-1' } as SongTable;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SingerRepository,
                {
                    provide: getRepositoryToken(SingerTable),
                    useValue: {
                        find: jest.fn(),
                        findOneBy: jest.fn(),
                        save: jest.fn(),
                        update: jest.fn(),
                        delete: jest.fn(),
                        manager: {
                            transaction: jest.fn(),
                        }
                    },
                },
                {
                    provide: getRepositoryToken(SongTable),
                    useValue: {},
                }
            ],
        }).compile();

        repository = module.get<SingerRepository>(SingerRepository);
        typeOrmRepo = module.get<Repository<SingerTable>>(getRepositoryToken(SingerTable));

        jest.clearAllMocks();
        (SingerMapper.toDomain as jest.Mock).mockReturnValue(mockSingerDomain);
        (SingerMapper.toTable as jest.Mock).mockReturnValue(mockSingerTable);
        (SongMapper.toTable as jest.Mock).mockReturnValue(mockSongTable);
    });

    describe('find', () => {
        it('should return array of singers', async () => {
            (typeOrmRepo.find as jest.Mock).mockResolvedValue([mockSingerTable]);
            const result = await repository.find();
            expect(result).toEqual([mockSingerDomain]);
        });
    });

    describe('findById', () => {
        it('should return a singer', async () => {
            (typeOrmRepo.findOneBy as jest.Mock).mockResolvedValue(mockSingerTable);
            const result = await repository.findById('singer-1');
            expect(result).toEqual(mockSingerDomain);
        });

        it('should throw if id is empty', async () => {
            await expect(repository.findById('')).rejects.toThrow(DatabaseException);
        });

        it('should throw if not found', async () => {
            (typeOrmRepo.findOneBy as jest.Mock).mockResolvedValue(null);
            await expect(repository.findById('singer-1')).rejects.toThrow(DatabaseException);
        });
    });

    describe('exists', () => {
        it('should return true if found', async () => {
            (typeOrmRepo.findOneBy as jest.Mock).mockResolvedValue(mockSingerTable);
            const result = await repository.exists('Singer');
            expect(result).toBe(true);
        });
    });

    describe('insert', () => {
        it('should save valid singer', async () => {
            await repository.insert(mockSingerDomain);
            expect(typeOrmRepo.save).toHaveBeenCalledWith(mockSingerTable);
        });

        it('should throw if singer is null', async () => {
            await expect(repository.insert(null)).rejects.toThrow(DatabaseException);
        });

        it('should throw if singer is invalid', async () => {
            const invalidSinger = { ...mockSingerDomain, IsValid: false };
            await expect(repository.insert(invalidSinger)).rejects.toThrow(BrokenRulesException);
        });

        it('should throw DatabaseException on save error', async () => {
            (typeOrmRepo.save as jest.Mock).mockRejectedValue(new Error('fail'));
            await expect(repository.insert(mockSingerDomain)).rejects.toThrow(DatabaseException);
        });
    });

    // Additional tests for update, delete, addSong, removeSong...
    // Keeping it concise but covering logic paths.

    describe('update', () => {
        it('should update singer', async () => {
            (typeOrmRepo.update as jest.Mock).mockResolvedValue({ affected: 1 });
            await repository.update('singer-1', mockSingerDomain);
            expect(typeOrmRepo.update).toHaveBeenCalled();
        });

        it('should throw if not found (affected 0)', async () => {
            (typeOrmRepo.update as jest.Mock).mockResolvedValue({ affected: 0 });
            await expect(repository.update('singer-1', mockSingerDomain)).rejects.toThrow(DatabaseException);
        });
    });

    describe('delete', () => {
        it('should delete singer', async () => {
            await repository.delete('singer-1');
            expect(typeOrmRepo.delete).toHaveBeenCalledWith('singer-1');
        });
    });

    describe('transactional methods (addSong)', () => {
        it('should execute in transaction', async () => {
            const mockManager = { save: jest.fn() };
            (typeOrmRepo.manager.transaction as jest.Mock).mockImplementation((cb) => cb(mockManager));

            await repository.addSong(mockSingerDomain, {} as any);

            expect(typeOrmRepo.manager.transaction).toHaveBeenCalled();
            expect(mockManager.save).toHaveBeenCalledTimes(2); // Song and Singer
        });
    });
});
