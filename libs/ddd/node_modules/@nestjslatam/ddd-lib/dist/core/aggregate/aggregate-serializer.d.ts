import { IdValueObject } from '../../valueobjects';
import { TrackingStateManager } from '../../tracking-state-manager';
import { TrackingProps } from '../tracking-state';
export declare class AggregateSerializer<TProps> {
    private readonly id;
    private readonly props;
    private readonly version;
    private readonly trackingState;
    private readonly isValidFn;
    constructor(id: IdValueObject, props: TProps, version: number, trackingState: TrackingStateManager, isValidFn: () => boolean);
    toPlainObject(): {
        id: IdValueObject;
        version: number;
        isValid: boolean;
    } & TProps;
    toFullObject(brokenRules: any): {
        id: IdValueObject;
        trackingState: TrackingStateManager;
        brokenRules: any;
        isValid: boolean;
    } & TProps;
    getFrozenCopy(): Readonly<TProps & {
        id: IdValueObject;
        props: TProps;
        trackingState: TrackingProps;
    }>;
}
//# sourceMappingURL=aggregate-serializer.d.ts.map