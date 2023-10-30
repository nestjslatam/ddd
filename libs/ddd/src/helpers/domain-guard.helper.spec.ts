import { DomainGuard } from './domain-guard.helper';

describe('DomainGuard', () => {
  describe('isValueObject', () => {
    it('should return false if obj is not an instance of DomainValueObject', () => {
      const obj = { value: 123 };
      expect(DomainGuard.isValueObject(obj)).toBe(false);
    });
  });

  describe('isEmpty', () => {
    it('should return true if value is undefined', () => {
      expect(DomainGuard.isEmpty(undefined)).toBe(true);
    });

    it('should return true if value is null', () => {
      expect(DomainGuard.isEmpty(null)).toBe(true);
    });

    it('should return true if value is an empty object', () => {
      expect(DomainGuard.isEmpty({})).toBe(true);
    });

    it('should return true if value is an empty string', () => {
      expect(DomainGuard.isEmpty('')).toBe(true);
    });

    it('should return true if value is an empty array', () => {
      expect(DomainGuard.isEmpty([])).toBe(true);
    });

    it('should return true if value is an array of empty values', () => {
      expect(DomainGuard.isEmpty([null, undefined, '', {}])).toBe(true);
    });

    it('should return false if value is a number', () => {
      expect(DomainGuard.isEmpty(123)).toBe(false);
    });

    it('should return false if value is a boolean', () => {
      expect(DomainGuard.isEmpty(true)).toBe(false);
    });

    it('should return false if value is a date', () => {
      expect(DomainGuard.isEmpty(new Date())).toBe(false);
    });

    it('should return false if value is a non-empty object', () => {
      expect(DomainGuard.isEmpty({ value: 123 })).toBe(false);
    });

    it('should return false if value is a non-empty string', () => {
      expect(DomainGuard.isEmpty('hello')).toBe(false);
    });

    it('should return false if value is a non-empty array', () => {
      expect(DomainGuard.isEmpty([1, 2, 3])).toBe(false);
    });
  });

  describe('lengthIsBetween', () => {
    it('should throw an error if value is empty', () => {
      expect(() => DomainGuard.lengthIsBetween('', 1, 10)).toThrowError();
    });

    it('should return true if value length is between min and max', () => {
      expect(DomainGuard.lengthIsBetween('hello', 1, 10)).toBe(true);
    });

    it('should return false if value length is less than min', () => {
      expect(DomainGuard.lengthIsBetween('hello', 10, 20)).toBe(false);
    });

    it('should return false if value length is greater than max', () => {
      expect(DomainGuard.lengthIsBetween('hello', 1, 3)).toBe(false);
    });
  });

  describe('lenghtIsEqual', () => {
    it('should throw an error if value is empty', () => {
      expect(() => DomainGuard.lenghtIsEqual('', 5)).toThrowError();
    });

    it('should return true if value length is equal to length', () => {
      expect(DomainGuard.lenghtIsEqual('hello', 5)).toBe(true);
    });

    it('should return false if value length is not equal to length', () => {
      expect(DomainGuard.lenghtIsEqual('hello', 10)).toBe(false);
    });
  });

  describe('isEmail', () => {
    it('should return true if value is a valid email', () => {
      expect(DomainGuard.isEmail('test@example.com')).toBe(true);
    });

    it('should return false if value is not a valid email', () => {
      expect(DomainGuard.isEmail('test@example')).toBe(false);
    });
  });

  describe('isString', () => {
    it('should return true if value is a string', () => {
      expect(DomainGuard.isString('hello')).toBe(true);
    });

    it('should return false if value is not a string', () => {
      expect(DomainGuard.isString(123)).toBe(false);
    });
  });

  describe('isNumber', () => {
    it('should return true if value is a number', () => {
      expect(DomainGuard.isNumber(123)).toBe(true);
    });

    it('should return false if value is not a number', () => {
      expect(DomainGuard.isNumber('hello')).toBe(false);
    });
  });

  describe('isNumberBetween', () => {
    it('should return true if value is between min and max', () => {
      expect(DomainGuard.isNumberBetween(5, 1, 10)).toBe(true);
    });

    it('should return false if value is less than min', () => {
      expect(DomainGuard.isNumberBetween(5, 10, 20)).toBe(false);
    });

    it('should return false if value is greater than max', () => {
      expect(DomainGuard.isNumberBetween(5, 1, 3)).toBe(false);
    });
  });

  describe('isDate', () => {
    it('should return true if value is a date', () => {
      expect(DomainGuard.isDate(new Date())).toBe(true);
    });

    it('should return false if value is not a date', () => {
      expect(DomainGuard.isDate('hello')).toBe(false);
    });
  });
  describe('isUrlValid', () => {
    it('should return true for a valid URL', () => {
      const validUrl = 'https://www.example.com';
      expect(DomainGuard.isUrlValid(validUrl)).toBe(true);
    });

    it('should return false for an invalid URL', () => {
      const invalidUrl = 'not a valid url';
      expect(DomainGuard.isUrlValid(invalidUrl)).toBe(false);
    });

    it('should return false for an empty string', () => {
      const emptyUrl = '';
      expect(DomainGuard.isUrlValid(emptyUrl)).toBe(false);
    });
  });
});
