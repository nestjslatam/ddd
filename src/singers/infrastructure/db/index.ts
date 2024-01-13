import { SongRepository } from './song.repository';
import { SingerRepository } from './singer.repository';

export * from './tables';
export * from './constants';

export { SingerRepository, SongRepository };

export const singerRepository = [SingerRepository, SongRepository];
