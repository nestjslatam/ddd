import { DomainEntity } from './ddd-entity';
import { DomainUid } from './ddd-valueobjects';
import { BrokenRule } from './ddd-rules';

// Clase concreta para testing
interface TestProps {
  name: string;
  age: number;
}

class TestEntity extends DomainEntity<TestEntity, TestProps> {
  constructor(props: TestProps) {
    super(props);
  }

  protected AddValidators(): void {
    // Implementación vacía para testing
  }

  protected Guard(): void {
    // Implementación vacía para testing
  }
}

describe('DomainEntity', () => {
  let testProps: TestProps;
  let entity: TestEntity;

  beforeEach(() => {
    testProps = {
      name: 'Test Entity',
      age: 25,
    };
    entity = new TestEntity(testProps);
  });

  describe('Constructor', () => {
    it('debe inicializar la entidad con las props proporcionadas', () => {
      expect(entity._uiTestingProps).toEqual(testProps);
    });

    it('debe generar un Id único', () => {
      expect(entity.Id).toBeDefined();
      expect(entity.Id).toBeInstanceOf(DomainUid);
    });

    it('debe marcar la entidad como nueva después de la creación', () => {
      const trackingState = entity._uiTestingTrackingState;
      expect(trackingState.isNew).toBe(true);
      expect(trackingState.isDirty).toBe(false);
    });

    it('debe inicializar el brokenRulesManager vacío', () => {
      expect(entity.brokenRules).toEqual([]);
    });

    it('debe inicializar el validatorRuleManager', () => {
      expect(entity._uiTestingValidatorRuleManager).toBeDefined();
    });
  });

  describe('Getters y Setters', () => {
    describe('Id', () => {
      it('debe obtener el Id correctamente', () => {
        const id = entity.Id;
        expect(id).toBeInstanceOf(DomainUid);
      });

      it('debe permitir establecer un nuevo Id', () => {
        const newId = DomainUid.createNew();
        entity.Id = newId;
        expect(entity.Id).toBe(newId);
      });
    });

    describe('brokenRules', () => {
      it('debe retornar un array vacío cuando no hay reglas rotas', () => {
        expect(entity.brokenRules).toEqual([]);
        expect(entity.brokenRules.length).toBe(0);
      });

      it('debe permitir establecer reglas rotas', () => {
        const brokenRules: BrokenRule[] = [
          new BrokenRule('name', 'Name is required', 'Error'),
          new BrokenRule('age', 'Age must be positive', 'Warning'),
        ];

        entity['brokenRules'] = brokenRules;

        expect(entity.brokenRules.length).toBe(2);
        expect(entity.brokenRules[0].property).toBe('name');
        expect(entity.brokenRules[1].property).toBe('age');
      });

      it('debe marcar como dirty cuando se agregan reglas rotas', () => {
        const brokenRules: BrokenRule[] = [
          new BrokenRule('name', 'Name is required', 'Error'),
        ];

        entity['brokenRules'] = brokenRules;

        const trackingState = entity._uiTestingTrackingState;
        expect(trackingState.isDirty).toBe(true);
      });

      it('no debe marcar como dirty cuando el array está vacío', () => {
        entity['brokenRules'] = [];
        const trackingState = entity._uiTestingTrackingState;
        expect(trackingState.isDirty).toBe(false);
      });
    });

    describe('trackingState', () => {
      it('debe retornar el estado de tracking', () => {
        const trackingState = entity.trackingState;
        expect(trackingState).toBeDefined();
        expect(trackingState).toHaveProperty('isNew');
        expect(trackingState).toHaveProperty('isDirty');
        expect(trackingState).toHaveProperty('isDeleted');
      });

      it('debe reflejar el estado correcto después de marcar como nuevo', () => {
        entity._uiTestingTrackingState.markAsNew();
        expect(entity.trackingState.isNew).toBe(true);
        expect(entity.trackingState.isDirty).toBe(false);
      });

      it('debe reflejar el estado correcto después de marcar como dirty', () => {
        entity._uiTestingTrackingState.markAsDirty();
        expect(entity.trackingState.isDirty).toBe(true);
        expect(entity.trackingState.isNew).toBe(false);
      });
    });

    describe('propsCopy', () => {
      it('debe retornar una copia inmutable de las props', () => {
        const propsCopy = entity.propsCopy;

        expect(propsCopy.props).toEqual(testProps);
        expect(propsCopy.id).toBeInstanceOf(DomainUid);
        expect(propsCopy.trackingState).toBeDefined();

        // Verificar que es inmutable
        expect(() => {
          (propsCopy as any).props = { name: 'Modified' };
        }).toThrow();
      });

      it('debe incluir todas las propiedades requeridas', () => {
        const propsCopy = entity.propsCopy;

        expect(propsCopy).toHaveProperty('props');
        expect(propsCopy).toHaveProperty('id');
        expect(propsCopy).toHaveProperty('trackingState');
      });
    });

    describe('isValid', () => {
      it('debe retornar true cuando no hay reglas rotas', () => {
        expect(entity.isValid).toBe(true);
      });

      it('debe retornar false cuando hay reglas rotas', () => {
        const brokenRules: BrokenRule[] = [
          new BrokenRule('name', 'Name is required', 'Error'),
        ];

        entity['brokenRules'] = brokenRules;

        expect(entity.isValid).toBe(false);
      });
    });
  });

  describe('validate', () => {
    it('debe ejecutar guard()', () => {
      const guardSpy = jest.spyOn(TestEntity.prototype as any, 'Guard');
      const testEntity = new TestEntity(testProps);
      expect(guardSpy).toHaveBeenCalled();
      expect(testEntity).toBeDefined();
      guardSpy.mockRestore();
    });

    it('debe ejecutar addValidators()', () => {
      const addValidatorsSpy = jest.spyOn(
        TestEntity.prototype as any,
        'AddValidators',
      );
      const testEntity = new TestEntity(testProps);
      expect(addValidatorsSpy).toHaveBeenCalled();
      expect(testEntity).toBeDefined();
      addValidatorsSpy.mockRestore();
    });

    it('debe limpiar las reglas rotas al finalizar', () => {
      // Agregar reglas rotas primero
      const brokenRules: BrokenRule[] = [
        new BrokenRule('name', 'Name is required', 'Error'),
      ];
      entity['brokenRules'] = brokenRules;

      // Ejecutar validate
      entity.validate();

      // Las reglas rotas deben estar limpias
      expect(entity.brokenRules.length).toBe(0);
    });
  });

  describe('UI Testing Only - Getters', () => {
    describe('_uiTestingProps', () => {
      it('debe retornar las props internas', () => {
        expect(entity._uiTestingProps).toEqual(testProps);
        expect(entity._uiTestingProps.name).toBe('Test Entity');
        expect(entity._uiTestingProps.age).toBe(25);
      });
    });

    describe('_uiTestingTrackingState', () => {
      it('debe retornar el TrackingStateManager completo', () => {
        const trackingState = entity._uiTestingTrackingState;
        expect(trackingState).toBeDefined();
        expect(trackingState.isNew).toBeDefined();
        expect(trackingState.isDirty).toBeDefined();
        expect(trackingState.isDeleted).toBeDefined();
        expect(trackingState.isSelfDeleted).toBeDefined();
      });

      it('debe permitir modificar el estado de tracking', () => {
        const trackingState = entity._uiTestingTrackingState;
        trackingState.markAsDirty();
        expect(trackingState.isDirty).toBe(true);
      });
    });

    describe('_uiTestingBrokenRulesManager', () => {
      it('debe retornar el BrokenRulesManager', () => {
        const manager = entity._uiTestingBrokenRulesManager;
        expect(manager).toBeDefined();
        expect(manager.getBrokenRules).toBeDefined();
      });

      it('debe permitir agregar reglas rotas directamente', () => {
        const manager = entity._uiTestingBrokenRulesManager;
        const brokenRule = new BrokenRule('test', 'Test error', 'Error');
        manager.add(brokenRule);

        expect(entity.brokenRules.length).toBe(1);
        expect(entity.brokenRules[0].property).toBe('test');
      });
    });

    describe('_uiTestingValidatorRuleManager', () => {
      it('debe retornar el ValidatorRuleManager', () => {
        const manager = entity._uiTestingValidatorRuleManager;
        expect(manager).toBeDefined();
        expect(manager.getBrokenRules).toBeDefined();
      });
    });

    describe('_uiTestingFullState', () => {
      it('debe retornar el estado completo de la entidad', () => {
        const fullState = entity._uiTestingFullState;

        expect(fullState).toHaveProperty('id');
        expect(fullState).toHaveProperty('props');
        expect(fullState).toHaveProperty('trackingState');
        expect(fullState).toHaveProperty('brokenRules');
        expect(fullState).toHaveProperty('isValid');

        expect(fullState.id).toBeInstanceOf(DomainUid);
        expect(fullState.props).toEqual(testProps);
        expect(fullState.brokenRules).toEqual([]);
        expect(fullState.isValid).toBe(true);
      });

      it('debe reflejar cambios en el estado', () => {
        const brokenRule = new BrokenRule('name', 'Name is required', 'Error');
        entity['brokenRules'] = [brokenRule];

        const fullState = entity._uiTestingFullState;

        expect(fullState.brokenRules.length).toBe(1);
        expect(fullState.isValid).toBe(false);
        expect(fullState.trackingState.isDirty).toBe(true);
      });
    });
  });

  describe('Integración', () => {
    it('debe mantener la consistencia entre todos los componentes', () => {
      // Estado inicial
      expect(entity.isValid).toBe(true);
      expect(entity.brokenRules.length).toBe(0);
      expect(entity.trackingState.isNew).toBe(true);

      // Agregar reglas rotas
      const brokenRule = new BrokenRule('name', 'Name is required', 'Error');
      entity['brokenRules'] = [brokenRule];

      // Verificar consistencia
      expect(entity.isValid).toBe(false);
      expect(entity.brokenRules.length).toBe(1);
      expect(entity.trackingState.isDirty).toBe(true);
      expect(entity.trackingState.isNew).toBe(false);

      // Verificar que propsCopy refleja el estado
      const propsCopy = entity.propsCopy;
      expect(propsCopy.trackingState.isDirty).toBe(true);
    });

    it('debe permitir múltiples instancias independientes', () => {
      const entity1 = new TestEntity({ name: 'Entity 1', age: 10 });
      const entity2 = new TestEntity({ name: 'Entity 2', age: 20 });

      expect(entity1.Id).not.toEqual(entity2.Id);
      expect(entity1._uiTestingProps).not.toEqual(entity2._uiTestingProps);

      entity1['brokenRules'] = [
        new BrokenRule('name', 'Error in entity 1', 'Error'),
      ];

      expect(entity1.brokenRules.length).toBe(1);
      expect(entity2.brokenRules.length).toBe(0);
    });
  });
});
