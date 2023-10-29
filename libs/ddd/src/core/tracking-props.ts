import { ITrackingProps } from './interfaces';

export class TrackingProps implements ITrackingProps {
  isDirty: boolean;
  isNew: boolean;
  isDeleted: boolean;

  static setNew(): TrackingProps {
    return {
      isDirty: false,
      isNew: true,
      isDeleted: false,
    };
  }

  static setDirty(): TrackingProps {
    return {
      isDirty: true,
      isNew: false,
      isDeleted: false,
    };
  }
}
