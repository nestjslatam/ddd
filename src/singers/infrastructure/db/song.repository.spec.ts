import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SongRepository } from './song.repository';
import { SongTable } from '../db/tables';
import { SongMapper } from '../mappers';
import { DatabaseException } from '../../../shared/exceptions';

// Mock SongMapper
jest.mock('../mappers/song.mapper');

describe('SongRepository', () => {
    let repository: SongRepository;
    let typeOrmRepo: Repository<SongTable>;

    const mockSongDomain = { id: 'song-1' } as any;
    const mockSongTable = { id: 'song-1', name: 'Song' } as SongTable;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SongRepository,
                {
                    provide: getRepositoryToken(SongTable),
                    useValue: {
                        find: jest.fn(),
                        findOneBy: jest.fn(),
                        save: jest.fn(),
                        update: jest.fn(),
                        delete: jest.fn(),
                    },
                },
            ],
        }).compile();

        repository = module.get<SongRepository>(SongRepository);
        typeOrmRepo = module.get<Repository<SongTable>>(getRepositoryToken(SongTable));

        // Reset mocks
        jest.clearAllMocks();
        (SongMapper.toDomain as jest.Mock).mockReturnValue(mockSongDomain);
        (SongMapper.toTable as jest.Mock).mockReturnValue(mockSongTable);
    });

    describe('find', () => {
        it('should return array of songs', async () => {
            (typeOrmRepo.find as jest.Mock).mockResolvedValue([mockSongTable]);
            const result = await repository.find();
            expect(result).toEqual([mockSongDomain]);
            expect(SongMapper.toDomain).toHaveBeenCalledWith(mockSongTable);
        });
    });

    describe('findById', () => {
        it('should return a song', async () => {
            (typeOrmRepo.findOneBy as jest.Mock).mockResolvedValue(mockSongTable);
            const result = await repository.findById('song-1');
            expect(result).toEqual(mockSongDomain);
        });
    });

    describe('exists', () => {
        it('should return true if found', async () => {
            (typeOrmRepo.findOneBy as jest.Mock).mockResolvedValue(mockSongTable);
            const result = await repository.exists('Song');
            expect(result).toBe(true);
        });

        it('should return false if not found', async () => {
            (typeOrmRepo.findOneBy as jest.Mock).mockResolvedValue(null);
            const result = await repository.exists('Song');
            expect(result).toBe(false);
        });

        it('should throw DatabaseException on error', async () => {
            (typeOrmRepo.findOneBy as jest.Mock).mockRejectedValue(new Error('DB Error'));
            await expect(repository.exists('Song')).rejects.toThrow(DatabaseException);
        });
    });

    describe('insert', () => {
        it('should save song', async () => {
            await repository.insert(mockSongDomain);
            expect(typeOrmRepo.save).toHaveBeenCalledWith(mockSongTable);
        });
    });

    describe('insertBatch', () => {
        it('should save multiple songs', async () => {
            await repository.insertBatch([mockSongDomain, mockSongDomain]);
            expect(typeOrmRepo.save).toHaveBeenCalledWith([mockSongTable, mockSongTable]);
        });
    });

    describe('update', () => {
        it('should update song', async () => {
            await repository.update('song-1', mockSongDomain);
            expect(typeOrmRepo.update).toHaveBeenCalledWith('song-1', mockSongTable);
        });
    });

    describe('delete', () => {
        it('should delete song', async () => {
            await repository.delete('song-1');
            expect(typeOrmRepo.delete).toHaveBeenCalledWith('song-1');
        });
    });
});
