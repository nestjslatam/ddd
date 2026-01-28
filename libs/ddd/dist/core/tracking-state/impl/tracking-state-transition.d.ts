import { ITrackingStateTransitions } from '../interfaces/itracking-state-transitions';
export declare class TrackingStateTransition {
    private static applyTransition;
    static toDirty(manager: ITrackingStateTransitions): void;
    static toNew(manager: ITrackingStateTransitions): void;
    static toSelfDeleted(manager: ITrackingStateTransitions): void;
    static toDeleted(manager: ITrackingStateTransitions): void;
}
//# sourceMappingURL=tracking-state-transition.d.ts.map