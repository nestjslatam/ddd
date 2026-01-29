"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AggregateSerializer = void 0;
class AggregateSerializer {
    constructor(id, props, version, trackingState, isValidFn) {
        this.id = id;
        this.props = props;
        this.version = version;
        this.trackingState = trackingState;
        this.isValidFn = isValidFn;
    }
    toPlainObject() {
        return {
            id: this.id,
            version: this.version,
            ...this.props,
            isValid: this.isValidFn(),
        };
    }
    toFullObject(brokenRules) {
        return {
            id: this.id,
            ...this.props,
            trackingState: this.trackingState,
            brokenRules: brokenRules,
            isValid: this.isValidFn(),
        };
    }
    getFrozenCopy() {
        return Object.freeze({
            props: this.props,
            id: this.id,
            trackingState: this.trackingState.trackingProps,
        });
    }
}
exports.AggregateSerializer = AggregateSerializer;
//# sourceMappingURL=aggregate-serializer.js.map