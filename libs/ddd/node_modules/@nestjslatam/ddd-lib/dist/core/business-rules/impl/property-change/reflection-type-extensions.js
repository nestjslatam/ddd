"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReflectionTypeExtensions = void 0;
class ReflectionTypeExtensions {
    static getIsValueType(type) {
        if (!type)
            return false;
        const valueTypes = [String, Number, Boolean, Symbol, BigInt];
        return valueTypes.includes(type);
    }
    static getIsAssignableFrom(targetType, sourceType) {
        if (!targetType || !sourceType)
            return false;
        if (targetType === sourceType)
            return true;
        if (typeof sourceType === 'function' && typeof targetType === 'function') {
            return sourceType.prototype instanceof targetType;
        }
        return false;
    }
}
exports.ReflectionTypeExtensions = ReflectionTypeExtensions;
//# sourceMappingURL=reflection-type-extensions.js.map