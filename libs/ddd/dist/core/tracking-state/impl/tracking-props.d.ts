import { ITrackingProps } from '../interfaces';
export declare class TrackingProps implements ITrackingProps {
  isDirty: boolean;
  isNew: boolean;
  isDeleted: boolean;
  isSelfDeleted: boolean;
  static setNew(): TrackingProps;
  static setDirty(): TrackingProps;
  static setDeleted(): TrackingProps;
  static setSelfDeleted(): TrackingProps;
}
//# sourceMappingURL=tracking-props.d.ts.map
