import { IChangeDetector, ITrackingStateManager } from '../interfaces';
export declare class NestedPropertyChangeDetector implements IChangeDetector {
    private static readonly TrackingKeyName;
    private validateProps;
    private processTrackingValue;
    detectChanges<TProp>(props: TProp, trackingStateManager: ITrackingStateManager): ITrackingStateManager;
}
//# sourceMappingURL=nested-property-change-detector.d.ts.map