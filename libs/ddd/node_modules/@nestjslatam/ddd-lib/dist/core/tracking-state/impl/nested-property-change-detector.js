"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NestedPropertyChangeDetector = void 0;
class NestedPropertyChangeDetector {
    validateProps(props) {
        if (!props) {
            throw new Error('ArgumentNullException: props cannot be null');
        }
    }
    processTrackingValue(value, trackingStateManager) {
        if (value === null || typeof value !== 'object') {
            return;
        }
        const trackingValue = value[NestedPropertyChangeDetector.TrackingKeyName];
        if (!trackingValue) {
            return;
        }
        if (trackingValue.isDirty)
            trackingStateManager.markAsDirty();
        if (trackingValue.isNew)
            trackingStateManager.markAsNew();
        if (trackingValue.isSelfDeleted)
            trackingStateManager.markAsSelfDeleted();
        if (trackingValue.isDeleted)
            trackingStateManager.markAsDeleted();
    }
    detectChanges(props, trackingStateManager) {
        this.validateProps(props);
        trackingStateManager.markAsClean();
        Object.keys(props).forEach((key) => {
            this.processTrackingValue(props[key], trackingStateManager);
        });
        return trackingStateManager;
    }
}
exports.NestedPropertyChangeDetector = NestedPropertyChangeDetector;
NestedPropertyChangeDetector.TrackingKeyName = 'Tracking';
//# sourceMappingURL=nested-property-change-detector.js.map