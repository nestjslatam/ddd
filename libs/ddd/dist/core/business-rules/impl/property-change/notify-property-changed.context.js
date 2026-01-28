"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotifyPropertyChangedContext = void 0;
class NotifyPropertyChangedContext {
    constructor(defaultValue, type, handler) {
        this.callbacks = new Set();
        this.value = defaultValue;
        this.type = type;
        if (handler) {
            this.callbacks.add(handler);
        }
    }
    addCallback(handler) {
        this.callbacks.add(handler);
    }
    invokePropertyChangedCallback(sender, e) {
        this.callbacks.forEach((callback) => callback(sender, e));
    }
}
exports.NotifyPropertyChangedContext = NotifyPropertyChangedContext;
//# sourceMappingURL=notify-property-changed.context.js.map