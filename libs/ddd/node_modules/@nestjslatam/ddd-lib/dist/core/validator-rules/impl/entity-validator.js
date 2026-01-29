"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityValidator = void 0;
const aggregate_root_1 = require("../../../aggregate-root");
const abstract_validator_1 = require("./abstract-validator");
class EntityValidator extends abstract_validator_1.AbstractValidator {
    validate(obj) {
        return obj instanceof aggregate_root_1.DddAggregateRoot;
    }
}
exports.EntityValidator = EntityValidator;
//# sourceMappingURL=entity-validator.js.map