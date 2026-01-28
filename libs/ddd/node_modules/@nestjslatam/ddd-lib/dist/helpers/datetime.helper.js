"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateTimeHelper = void 0;
class DateTimeHelper {
    static getUtcDate() {
        const year = new Date().getUTCFullYear();
        const month = new Date().getUTCMonth();
        const day = new Date().getUTCDate();
        return new Date(Date.UTC(year, month, day));
    }
    static getTimeStamp() {
        return Date.now();
    }
}
exports.DateTimeHelper = DateTimeHelper;
//# sourceMappingURL=datetime.helper.js.map