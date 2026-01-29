"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DddObjectHelper = void 0;
const aggregate_root_1 = require("../aggregate-root");
const core_1 = require("../core");
class DddObjectHelper {
    static isEntity(obj) {
        return obj instanceof aggregate_root_1.DddAggregateRoot;
    }
    static convertToPlainObject(item) {
        if (core_1.ValueObjectValidator.isValueObject(item)) {
            return item.getValue ? item.getValue() : item.unpack?.() || item;
        }
        if (this.isEntity(item)) {
            return item.toObject();
        }
        return item;
    }
    static isDomainEntity(entity) {
        return entity instanceof aggregate_root_1.DddAggregateRoot;
    }
    static isDomainPrimitive(obj) {
        if (!obj || typeof obj !== 'object')
            return false;
        return Object.hasOwn(obj, 'value');
    }
    static convertPropsToObject(props) {
        if (!props)
            throw new Error('Props is required');
        const propsCopy = { ...props };
        for (const prop in propsCopy) {
            if (Array.isArray(propsCopy[prop])) {
                propsCopy[prop] = propsCopy[prop].map((item) => {
                    return this.convertToPlainObject(item);
                });
            }
            if (propsCopy[prop]) {
                propsCopy[prop] = this.convertToPlainObject(propsCopy[prop]);
            }
        }
        return propsCopy;
    }
    static flatMap(options) {
        const { modules, callback } = options;
        const items = modules.flatMap((module) => [...module.providers.values()].map(callback));
        return items.filter((element) => !!element);
    }
    static filterProvider(wrapper, metadataKey) {
        const { instance } = wrapper;
        if (!instance) {
            return undefined;
        }
        return this.extractMetadata(instance, metadataKey);
    }
    static extractMetadata(instance, metadataKey) {
        if (!instance.constructor) {
            return;
        }
        const metadata = Reflect.getMetadata(metadataKey, instance.constructor);
        return metadata ? instance.constructor : undefined;
    }
    static getEventName(event) {
        const { constructor } = Object.getPrototypeOf(event);
        return constructor.name;
    }
}
exports.DddObjectHelper = DddObjectHelper;
//# sourceMappingURL=domain-object.helper.js.map