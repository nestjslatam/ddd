export interface ITrackingStateTransitions {
  setDirty(value: boolean): void;
  setNew(value: boolean): void;
  setSelfDeleted(value: boolean): void;
  setDeleted(value: boolean): void;
}
