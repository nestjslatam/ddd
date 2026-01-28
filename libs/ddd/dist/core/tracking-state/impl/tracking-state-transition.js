"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrackingStateTransition = void 0;
class TrackingStateTransition {
    static applyTransition(manager, stateUpdate) {
        manager.setDirty(false);
        manager.setNew(false);
        manager.setSelfDeleted(false);
        manager.setDeleted(false);
        stateUpdate(manager);
    }
    static toDirty(manager) {
        this.applyTransition(manager, (m) => {
            m.setDirty(true);
        });
    }
    static toNew(manager) {
        this.applyTransition(manager, (m) => {
            m.setNew(true);
        });
    }
    static toSelfDeleted(manager) {
        this.applyTransition(manager, (m) => {
            m.setSelfDeleted(true);
        });
    }
    static toDeleted(manager) {
        this.applyTransition(manager, (m) => {
            m.setDeleted(true);
        });
    }
}
exports.TrackingStateTransition = TrackingStateTransition;
//# sourceMappingURL=tracking-state-transition.js.map