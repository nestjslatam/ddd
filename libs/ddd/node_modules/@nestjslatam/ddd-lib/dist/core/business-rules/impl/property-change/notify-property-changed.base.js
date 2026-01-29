"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractNotifyPropertyChanged = void 0;
const notify_property_changed_context_1 = require("./notify-property-changed.context");
const notify_property_changed_context_args_1 = require("./notify-property-changed.context-args");
const reflection_type_extensions_1 = require("./reflection-type-extensions");
class AbstractNotifyPropertyChanged {
    constructor() {
        this.properties = new Map();
        this.isCallbackInvokingEnabled = true;
        this.isEventInvokingEnabled = true;
    }
    registerProperty(name, type, defaultValue, handler) {
        if (this.properties.has(name)) {
            throw new Error(`This class already contains a registered property called '${name}'.`);
        }
        AbstractNotifyPropertyChanged.validateValueForType(defaultValue, type);
        this.properties.set(name, new notify_property_changed_context_1.NotifyPropertyChangedContext(defaultValue, type, handler));
    }
    registerPropertyChangedCallback(propertyName, handler) {
        const context = this.getPropertyContext(propertyName);
        context.addCallback(handler);
    }
    getValuePropertyChanged(propertyName) {
        return this.getPropertyContext(propertyName).value;
    }
    setValuePropertyChanged(value, propertyName, force = false) {
        const context = this.getPropertyContext(propertyName);
        AbstractNotifyPropertyChanged.validateValueForType(value, context.type);
        const oldValue = context.value;
        const valuesEqual = oldValue === value;
        if (force || !valuesEqual) {
            context.value = value;
            if (this.isCallbackInvokingEnabled) {
                context.invokePropertyChangedCallback(this, new notify_property_changed_context_args_1.NotifyPropertyChangedContextArgs(oldValue, value));
            }
            if (this.isEventInvokingEnabled && this.onPropertyChanged) {
                this.onPropertyChanged(propertyName);
            }
        }
    }
    getPropertyContext(propertyName) {
        const context = this.properties.get(propertyName);
        if (!context) {
            throw new Error(`No hay una propiedad registrada llamada '${propertyName}'.`);
        }
        return context;
    }
    static validateValueForType(value, type) {
        if (value === null || value === undefined) {
            const isValueType = reflection_type_extensions_1.ReflectionTypeExtensions.getIsValueType(type);
            if (isValueType) {
                throw new Error(`El tipo '${type.name || type}' no es un tipo nulable.`);
            }
            return;
        }
        const sourceType = value.constructor;
        if (!reflection_type_extensions_1.ReflectionTypeExtensions.getIsAssignableFrom(type, sourceType)) {
            throw new Error(`El valor especificado no se puede asignar a una propiedad de tipo (${type.name || type})`);
        }
    }
}
exports.AbstractNotifyPropertyChanged = AbstractNotifyPropertyChanged;
//# sourceMappingURL=notify-property-changed.base.js.map