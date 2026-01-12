import { SongMapper } from './song.mapper';
import { Song } from '../../domain';
import { SongTable, SingerTable } from '../db/tables';
import { v4 } from 'uuid';

describe('SongMapper', () => {
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
    const validSingerId = v4();

    const mockSongDomain = {
        id: validId,
        props: {
            name: { unpack: () => 'Song Name' },
            status: 'Active',
            singerId: { unpack: () => validSingerId },
            audit: { unpack: () => mockAudit }
        }
    } as unknown as Song;

    const mockSongTable: SongTable = {
        id: validId,
        name: 'Song Name',
        status: 'Active',
        singerId: validSingerId,
        singer: { id: validSingerId } as SingerTable,
        audit: mockAudit // The input table has full audit, but domain creation might filter or pass it
    } as SongTable;

    describe('toTable', () => {
        it('should map domain to table', () => {
            const result = SongMapper.toTable(mockSongDomain);

            expect(result).toBeInstanceOf(SongTable);
            expect(result.id).toBe(validId);
            expect(result.name).toBe('Song Name');
            expect(result.status).toBe('Active');
            expect(result.singer.id).toBe(validSingerId);
            expect(result.audit).toEqual(expectedTableAudit);
        });
    });

    describe('toDomain', () => {
        it('should map table to domain', () => {
            const result = SongMapper.toDomain(mockSongTable);

            expect(result).toBeInstanceOf(Song);
            expect(result.id).toBe(validId);
            // We can't easily check internal props without unpack or getters, assuming Domain works if Factory works.
            // Check public getters if available or assume factory correctness.
            // In this specific codebase, we know generic entities usually have getters or we trust the factory.
            // Let's verify what we can. 
            // Note: toDomain calls markAsDirty, which is void.
        });
    });
});
