"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrackingProps = void 0;
class TrackingProps {
    static setNew() {
        return {
            isDirty: false,
            isNew: true,
            isDeleted: false,
            isSelfDeleted: false,
        };
    }
    static setDirty() {
        return {
            isDirty: true,
            isNew: false,
            isDeleted: false,
            isSelfDeleted: false,
        };
    }
    static setDeleted() {
        return {
            isDirty: false,
            isNew: false,
            isDeleted: true,
            isSelfDeleted: false,
        };
    }
    static setSelfDeleted() {
        return {
            isDirty: false,
            isNew: false,
            isDeleted: false,
            isSelfDeleted: true,
        };
    }
}
exports.TrackingProps = TrackingProps;
//# sourceMappingURL=tracking-props.js.map