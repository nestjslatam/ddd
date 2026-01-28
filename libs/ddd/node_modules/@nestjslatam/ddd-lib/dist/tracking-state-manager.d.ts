import { IChangeDetector, IProps, ITrackingProps, ITrackingStateManager, ITrackingStateTransitions } from './core';
export declare class TrackingStateManager implements ITrackingStateManager, ITrackingStateTransitions {
    private _isNew;
    private _isDirty;
    private _isSelfDeleted;
    private _isDeleted;
    private readonly changeDetector;
    get isNew(): boolean;
    get isDirty(): boolean;
    get isSelfDeleted(): boolean;
    get isDeleted(): boolean;
    constructor(changeDetector?: IChangeDetector);
    get trackingProps(): ITrackingProps;
    getTracking<TProp extends IProps>(props: TProp): this;
    markAsDirty(): void;
    markAsNew(): void;
    markAsSelfDeleted(): void;
    markAsDeleted(): void;
    markAsClean(): void;
    setDirty(value: boolean): void;
    setNew(value: boolean): void;
    setSelfDeleted(value: boolean): void;
    setDeleted(value: boolean): void;
}
//# sourceMappingURL=tracking-state-manager.d.ts.map