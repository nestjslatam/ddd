"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrackingStateManager = void 0;
const impl_1 = require("./core/tracking-state/impl");
class TrackingStateManager {
    get isNew() {
        return this._isNew;
    }
    get isDirty() {
        return this._isDirty;
    }
    get isSelfDeleted() {
        return this._isSelfDeleted;
    }
    get isDeleted() {
        return this._isDeleted;
    }
    constructor(changeDetector) {
        this._isNew = false;
        this._isDirty = false;
        this._isSelfDeleted = false;
        this._isDeleted = false;
        this.changeDetector = changeDetector || new impl_1.NestedPropertyChangeDetector();
        this.markAsClean();
    }
    get trackingProps() {
        return {
            isDirty: this._isDirty,
            isNew: this._isNew,
            isDeleted: this._isDeleted,
            isSelfDeleted: this._isSelfDeleted,
        };
    }
    getTracking(props) {
        this.changeDetector.detectChanges(props, this);
        return this;
    }
    markAsDirty() {
        impl_1.TrackingStateTransition.toDirty(this);
    }
    markAsNew() {
        impl_1.TrackingStateTransition.toNew(this);
    }
    markAsSelfDeleted() {
        impl_1.TrackingStateTransition.toSelfDeleted(this);
    }
    markAsDeleted() {
        impl_1.TrackingStateTransition.toDeleted(this);
    }
    markAsClean() {
        this._isDirty = false;
        this._isNew = false;
        this._isSelfDeleted = false;
        this._isDeleted = false;
    }
    setDirty(value) {
        this._isDirty = value;
    }
    setNew(value) {
        this._isNew = value;
    }
    setSelfDeleted(value) {
        this._isSelfDeleted = value;
    }
    setDeleted(value) {
        this._isDeleted = value;
    }
}
exports.TrackingStateManager = TrackingStateManager;
//# sourceMappingURL=tracking-state-manager.js.map