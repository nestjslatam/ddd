"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DddEnum = void 0;
const domain_exception_1 = require("./exceptions/domain.exception");
class DddEnum {
    constructor(id, name) {
        this.id = id;
        this.name = name;
        this.validateId(id);
        this.validateName(name);
    }
    validateId(id) {
        if (typeof id !== 'number' || !Number.isInteger(id)) {
            throw new Error('Enum id must be an integer');
        }
        if (id < 0) {
            throw new Error('Enum id must be non-negative');
        }
    }
    validateName(name) {
        if (typeof name !== 'string' || name.trim().length === 0) {
            throw new Error('Enum name must be a non-empty string');
        }
    }
    toString() {
        return this.name;
    }
    static getAll() {
        const constructor = this;
        if (DddEnum._cache.has(constructor)) {
            return DddEnum._cache.get(constructor);
        }
        const values = Object.getOwnPropertyNames(constructor)
            .map((name) => constructor[name])
            .filter((value) => value instanceof constructor);
        DddEnum._cache.set(constructor, values);
        return values;
    }
    equals(other) {
        if (!(other instanceof DddEnum)) {
            return false;
        }
        const typeMatches = Object.getPrototypeOf(this) === Object.getPrototypeOf(other);
        const valueMatches = this.id === other.id;
        return typeMatches && valueMatches;
    }
    static absoluteDifference(firstValue, secondValue) {
        if (!firstValue) {
            throw new domain_exception_1.ArgumentNullException('firstValue');
        }
        if (!secondValue) {
            throw new domain_exception_1.ArgumentNullException('secondValue');
        }
        return Math.abs(firstValue.id - secondValue.id);
    }
    static fromValue(value) {
        if (typeof value !== 'number') {
            return undefined;
        }
        const allItems = this.getAll();
        return allItems.find((item) => item.id === value);
    }
    static fromName(name) {
        if (typeof name !== 'string' || name.trim().length === 0) {
            return undefined;
        }
        const allItems = this.getAll();
        return allItems.find((item) => item.name === name);
    }
    static fromNameIgnoreCase(name) {
        if (typeof name !== 'string' || name.trim().length === 0) {
            return undefined;
        }
        const allItems = this.getAll();
        const lowerName = name.toLowerCase();
        return allItems.find((item) => item.name.toLowerCase() === lowerName);
    }
    static fromDisplayName(displayName) {
        return this.fromName(displayName);
    }
    compareTo(other) {
        if (!other) {
            throw new domain_exception_1.ArgumentNullException('other');
        }
        return this.id - other.id;
    }
    isLessThan(other) {
        return this.compareTo(other) < 0;
    }
    isLessThanOrEqual(other) {
        return this.compareTo(other) <= 0;
    }
    isGreaterThan(other) {
        return this.compareTo(other) > 0;
    }
    isGreaterThanOrEqual(other) {
        return this.compareTo(other) >= 0;
    }
    static isDefined(value) {
        return this.fromValue(value) !== undefined;
    }
    static getMinValue() {
        const allItems = this.getAll();
        if (allItems.length === 0)
            return undefined;
        return allItems.reduce((min, item) => (item.id < min.id ? item : min));
    }
    static getMaxValue() {
        const allItems = this.getAll();
        if (allItems.length === 0)
            return undefined;
        return allItems.reduce((max, item) => (item.id > max.id ? item : max));
    }
    isBetween(min, max) {
        return this.isGreaterThanOrEqual(min) && this.isLessThanOrEqual(max);
    }
    static areEqual(left, right) {
        if (left === null || left === undefined) {
            return right === null || right === undefined;
        }
        return left.equals(right);
    }
    static areNotEqual(left, right) {
        return !this.areEqual(left, right);
    }
}
exports.DddEnum = DddEnum;
DddEnum._cache = new Map();
//# sourceMappingURL=enum.js.map