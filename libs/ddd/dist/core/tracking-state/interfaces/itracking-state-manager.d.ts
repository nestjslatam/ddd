export interface ITrackingStateManager {
  readonly isNew: boolean;
  readonly isDirty: boolean;
  readonly isSelfDeleted: boolean;
  readonly isDeleted: boolean;
  markAsDirty(): void;
  markAsNew(): void;
  markAsSelfDeleted(): void;
  markAsDeleted(): void;
  markAsClean(): void;
}
//# sourceMappingURL=itracking-state-manager.d.ts.map
