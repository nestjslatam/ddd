import { SingerMapper } from './singer.mapper';
import { Singer } from '../../domain';
import { SingerTable, SongTable } from '../db/tables';
import { SongMapper } from './song.mapper';
import { v4 } from 'uuid';

// Mock SongMapper to isolate SingerMapper tests
jest.mock('./song.mapper');

describe('SingerMapper', () => {
    const mockDate = new Date();
    const mockAudit = {
        createdBy: 'user',
        createdAt: mockDate,
        updatedBy: 'user',
        updatedAt: mockDate,
        timestamp: 123456789,
        deletedBy: null
    };

    const expectedTableAudit = {
        createdBy: 'user',
        createdAt: mockDate,
        updatedBy: 'user',
        updatedAt: mockDate,
        timestamp: 123456789,
    };

    const validId = v4();
    const validSongId = v4();

    const mockSingerDomain = {
        id: validId,
        props: {
            fullName: { unpack: () => 'Singer Name' },
            picture: { unpack: () => 'path/to/pic' },
            registerDate: { unpack: () => mockDate },
            isSubscribed: true,
            subscribedDate: { unpack: () => mockDate },
            status: 'Active',
            songs: [],
            audit: { unpack: () => mockAudit }
        }
    } as unknown as Singer;

    const mockSingerTable: SingerTable = {
        id: validId,
        fullName: 'Singer Name',
        picture: 'path/to/pic',
        registerDate: mockDate,
        isSubscribed: true,
        subscribedDate: mockDate,
        status: 'Active',
        songs: [],
        audit: mockAudit
    } as SingerTable;

    describe('toTable', () => {
        it('should map domain to table', () => {
            const result = SingerMapper.toTable(mockSingerDomain);

            expect(result).toBeInstanceOf(SingerTable);
            expect(result.id).toBe(validId);
            expect(result.fullName).toBe('Singer Name');
            expect(result.isSubscribed).toBe(true);
            expect(result.audit).toEqual(expectedTableAudit);
        });

        it('should handle missing optional properties', () => {
            const domainNoSub = {
                ...mockSingerDomain,
                props: {
                    ...mockSingerDomain.props,
                    subscribedDate: null,
                    songs: null // simulate null songs
                }
            } as unknown as Singer;

            const result = SingerMapper.toTable(domainNoSub);
            expect(result.subscribedDate).toBeNull();
            expect(result.songs).toEqual([]);
        });
    });

    describe('toDomain', () => {
        it('should map table to domain', () => {
            // Need to mock Singer.mapFromRaw since it relies on domain logic we don't want to test here?
            // Actually, mapper tests Integration with Domain Factory is expected.
            // But we mocked SongMapper, so we need to ensure SongMapper.toDomain is called if songs exist.

            const tableWithSongs = { ...mockSingerTable, songs: [{ id: validSongId } as SongTable] };
            // We also need to mock Singer factory if we want pure isolation, but that's hard with static methods.
            // We'll trust real Singer factory unless it calls something external.

            // NOTE: The Singer.mapFromRaw implementation adds songs via addSong method which validates audit.
            // So our mock returns from SongMapper must satisfy addSong's expect(song.props.audit).

            // Mock SongMapper to return a Domain Entity-like structure where audit is a Value Object
            (SongMapper.toDomain as jest.Mock).mockReturnValue({
                props: {
                    audit: { unpack: () => mockAudit }
                },
                id: validSongId
            });

            const result = SingerMapper.toDomain(tableWithSongs);
            expect(result).toBeInstanceOf(Singer);
            expect(result.id).toBe(validId);
            expect(SongMapper.toDomain).toHaveBeenCalled();
        });
    });
});
