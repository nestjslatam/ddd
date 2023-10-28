export class SongInfoDto {
  constructor(
    public id: string,
    public name: string,
    public description: string,
    public singer: { id: string; name: string },
    public lyric: string,
    public url: string,
    public status: string,
  ) {}
}
