import { ReflectionTypeExtensions } from './reflection-type-extensions';

describe('ReflectionTypeExtensions', () => {
  describe('getIsValueType', () => {
    it('debe retornar true para tipos primitivos', () => {
      expect(ReflectionTypeExtensions.getIsValueType(String)).toBe(true);
      expect(ReflectionTypeExtensions.getIsValueType(Number)).toBe(true);
      expect(ReflectionTypeExtensions.getIsValueType(Boolean)).toBe(true);
      expect(ReflectionTypeExtensions.getIsValueType(Symbol)).toBe(true);
      expect(ReflectionTypeExtensions.getIsValueType(BigInt)).toBe(true);
    });

    it('debe retornar false para tipos no primitivos', () => {
      class TestClass {}
      expect(ReflectionTypeExtensions.getIsValueType(TestClass)).toBe(false);
      expect(ReflectionTypeExtensions.getIsValueType(Object)).toBe(false);
      expect(ReflectionTypeExtensions.getIsValueType(Array)).toBe(false);
      expect(ReflectionTypeExtensions.getIsValueType(Date)).toBe(false);
    });

    it('debe retornar false para valores nulos o indefinidos', () => {
      expect(ReflectionTypeExtensions.getIsValueType(null)).toBe(false);
      expect(ReflectionTypeExtensions.getIsValueType(undefined)).toBe(false);
    });

    it('debe retornar false para tipos personalizados', () => {
      expect(ReflectionTypeExtensions.getIsValueType({})).toBe(false);
      expect(ReflectionTypeExtensions.getIsValueType([])).toBe(false);
    });
  });

  describe('getIsAssignableFrom', () => {
    it('debe retornar true cuando los tipos son iguales', () => {
      expect(ReflectionTypeExtensions.getIsAssignableFrom(String, String)).toBe(
        true,
      );
      expect(ReflectionTypeExtensions.getIsAssignableFrom(Number, Number)).toBe(
        true,
      );
      expect(
        ReflectionTypeExtensions.getIsAssignableFrom(Boolean, Boolean),
      ).toBe(true);

      class TestClass {}
      expect(
        ReflectionTypeExtensions.getIsAssignableFrom(TestClass, TestClass),
      ).toBe(true);
    });

    it('debe retornar true cuando una clase hereda de otra', () => {
      class BaseClass {}
      class DerivedClass extends BaseClass {}

      expect(
        ReflectionTypeExtensions.getIsAssignableFrom(BaseClass, DerivedClass),
      ).toBe(true);
    });

    it('debe retornar false cuando no hay herencia', () => {
      class ClassA {}
      class ClassB {}

      expect(ReflectionTypeExtensions.getIsAssignableFrom(ClassA, ClassB)).toBe(
        false,
      );
      expect(ReflectionTypeExtensions.getIsAssignableFrom(ClassB, ClassA)).toBe(
        false,
      );
    });

    it('debe retornar false cuando uno de los tipos no es una función', () => {
      class TestClass {}
      const notAFunction = 'string';
      const objectValue = {};

      expect(
        ReflectionTypeExtensions.getIsAssignableFrom(
          TestClass,
          notAFunction as any,
        ),
      ).toBe(false);
      expect(
        ReflectionTypeExtensions.getIsAssignableFrom(
          notAFunction as any,
          TestClass,
        ),
      ).toBe(false);
      expect(
        ReflectionTypeExtensions.getIsAssignableFrom(
          TestClass,
          objectValue as any,
        ),
      ).toBe(false);
    });

    it('debe retornar false para tipos primitivos diferentes', () => {
      expect(ReflectionTypeExtensions.getIsAssignableFrom(String, Number)).toBe(
        false,
      );
      expect(
        ReflectionTypeExtensions.getIsAssignableFrom(Number, Boolean),
      ).toBe(false);
    });

    it('debe retornar false para valores nulos o indefinidos', () => {
      expect(ReflectionTypeExtensions.getIsAssignableFrom(String, null)).toBe(
        false,
      );
      expect(ReflectionTypeExtensions.getIsAssignableFrom(null, String)).toBe(
        false,
      );
      expect(
        ReflectionTypeExtensions.getIsAssignableFrom(String, undefined),
      ).toBe(false);
      expect(
        ReflectionTypeExtensions.getIsAssignableFrom(undefined, String),
      ).toBe(false);
      expect(
        ReflectionTypeExtensions.getIsAssignableFrom(null, undefined),
      ).toBe(false);
    });

    it('debe manejar herencia múltiple correctamente', () => {
      class BaseClass {}
      class MiddleClass extends BaseClass {}
      class DerivedClass extends MiddleClass {}

      expect(
        ReflectionTypeExtensions.getIsAssignableFrom(BaseClass, DerivedClass),
      ).toBe(true);
      expect(
        ReflectionTypeExtensions.getIsAssignableFrom(MiddleClass, DerivedClass),
      ).toBe(true);
      expect(
        ReflectionTypeExtensions.getIsAssignableFrom(DerivedClass, BaseClass),
      ).toBe(false);
    });
  });
});
