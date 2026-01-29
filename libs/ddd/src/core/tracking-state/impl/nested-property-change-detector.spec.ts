import { ITrackingStateManager } from '../interfaces';
import { NestedPropertyChangeDetector } from './nested-property-change-detector';

describe('NestedPropertyChangeDetector', () => {
  class MockTrackingStateManager implements ITrackingStateManager {
    public isNew: boolean = false;
    public isDirty: boolean = false;
    public isSelfDeleted: boolean = false;
    public isDeleted: boolean = false;

    markAsDirty(): void {
      this.isDirty = true;
    }

    markAsNew(): void {
      this.isNew = true;
    }

    markAsSelfDeleted(): void {
      this.isSelfDeleted = true;
    }

    markAsDeleted(): void {
      this.isDeleted = true;
    }

    markAsClean(): void {
      this.isDirty = false;
      this.isNew = false;
      this.isSelfDeleted = false;
      this.isDeleted = false;
    }
  }

  let detector: NestedPropertyChangeDetector;
  let trackingStateManager: ITrackingStateManager;

  beforeEach(() => {
    detector = new NestedPropertyChangeDetector();
    trackingStateManager = new MockTrackingStateManager();
  });

  describe('detectChanges', () => {
    it('debe lanzar error si props es null', () => {
      expect(() => {
        detector.detectChanges(null as any, trackingStateManager);
      }).toThrow('ArgumentNullException: props cannot be null');
    });

    it('debe lanzar error si props es undefined', () => {
      expect(() => {
        detector.detectChanges(undefined as any, trackingStateManager);
      }).toThrow('ArgumentNullException: props cannot be null');
    });

    it('debe marcar como clean antes de detectar cambios', () => {
      trackingStateManager.markAsDirty();
      expect(trackingStateManager.isDirty).toBe(true);

      detector.detectChanges({}, trackingStateManager);

      expect(trackingStateManager.isDirty).toBe(false);
    });

    it('debe retornar el trackingStateManager', () => {
      const result = detector.detectChanges({}, trackingStateManager);

      expect(result).toBe(trackingStateManager);
    });

    it('debe ignorar valores null en propiedades', () => {
      const props = {
        name: null,
        age: null,
      };

      detector.detectChanges(props, trackingStateManager);

      expect(trackingStateManager.isDirty).toBe(false);
      expect(trackingStateManager.isNew).toBe(false);
    });

    it('debe ignorar valores undefined en propiedades', () => {
      const props = {
        name: undefined,
        age: undefined,
      };

      detector.detectChanges(props, trackingStateManager);

      expect(trackingStateManager.isDirty).toBe(false);
      expect(trackingStateManager.isNew).toBe(false);
    });

    it('debe ignorar valores primitivos', () => {
      const props = {
        name: 'John',
        age: 25,
        active: true,
      };

      detector.detectChanges(props, trackingStateManager);

      expect(trackingStateManager.isDirty).toBe(false);
      expect(trackingStateManager.isNew).toBe(false);
    });

    it('debe ignorar objetos sin propiedad Tracking', () => {
      const props = {
        user: {
          name: 'John',
          age: 25,
        },
      };

      detector.detectChanges(props, trackingStateManager);

      expect(trackingStateManager.isDirty).toBe(false);
      expect(trackingStateManager.isNew).toBe(false);
    });

    it('debe ignorar objetos donde Tracking es null', () => {
      const props = {
        user: {
          Tracking: null,
        },
      };

      detector.detectChanges(props, trackingStateManager);

      expect(trackingStateManager.isDirty).toBe(false);
      expect(trackingStateManager.isNew).toBe(false);
    });

    it('debe ignorar objetos donde Tracking es undefined', () => {
      const props = {
        user: {
          Tracking: undefined,
        },
      };

      detector.detectChanges(props, trackingStateManager);

      expect(trackingStateManager.isDirty).toBe(false);
      expect(trackingStateManager.isNew).toBe(false);
    });

    it('debe detectar isDirty en propiedades anidadas', () => {
      const nestedTracking = new MockTrackingStateManager();
      nestedTracking.markAsDirty();

      const props = {
        user: {
          Tracking: nestedTracking,
        },
      };

      detector.detectChanges(props, trackingStateManager);

      expect(trackingStateManager.isDirty).toBe(true);
      expect(trackingStateManager.isNew).toBe(false);
      expect(trackingStateManager.isDeleted).toBe(false);
      expect(trackingStateManager.isSelfDeleted).toBe(false);
    });

    it('debe detectar isNew en propiedades anidadas', () => {
      const nestedTracking = new MockTrackingStateManager();
      nestedTracking.markAsNew();

      const props = {
        user: {
          Tracking: nestedTracking,
        },
      };

      detector.detectChanges(props, trackingStateManager);

      expect(trackingStateManager.isNew).toBe(true);
      expect(trackingStateManager.isDirty).toBe(false);
      expect(trackingStateManager.isDeleted).toBe(false);
      expect(trackingStateManager.isSelfDeleted).toBe(false);
    });

    it('debe detectar isDeleted en propiedades anidadas', () => {
      const nestedTracking = new MockTrackingStateManager();
      nestedTracking.markAsDeleted();

      const props = {
        user: {
          Tracking: nestedTracking,
        },
      };

      detector.detectChanges(props, trackingStateManager);

      expect(trackingStateManager.isDeleted).toBe(true);
      expect(trackingStateManager.isDirty).toBe(false);
      expect(trackingStateManager.isNew).toBe(false);
      expect(trackingStateManager.isSelfDeleted).toBe(false);
    });

    it('debe detectar isSelfDeleted en propiedades anidadas', () => {
      const nestedTracking = new MockTrackingStateManager();
      nestedTracking.markAsSelfDeleted();

      const props = {
        user: {
          Tracking: nestedTracking,
        },
      };

      detector.detectChanges(props, trackingStateManager);

      expect(trackingStateManager.isSelfDeleted).toBe(true);
      expect(trackingStateManager.isDirty).toBe(false);
      expect(trackingStateManager.isNew).toBe(false);
      expect(trackingStateManager.isDeleted).toBe(false);
    });

    it('debe detectar múltiples estados de diferentes propiedades', () => {
      const nestedTracking1 = new MockTrackingStateManager();
      nestedTracking1.markAsDirty();

      const nestedTracking2 = new MockTrackingStateManager();
      nestedTracking2.markAsNew();

      const props = {
        user: {
          Tracking: nestedTracking1,
        },
        order: {
          Tracking: nestedTracking2,
        },
      };

      detector.detectChanges(props, trackingStateManager);

      // Debe aplicar ambos estados (isDirty e isNew)
      expect(trackingStateManager.isDirty).toBe(true);
      expect(trackingStateManager.isNew).toBe(true);
    });

    it('debe detectar estados de múltiples propiedades anidadas', () => {
      const nestedTracking1 = new MockTrackingStateManager();
      nestedTracking1.markAsDirty();

      const nestedTracking2 = new MockTrackingStateManager();
      nestedTracking2.markAsDeleted();

      const nestedTracking3 = new MockTrackingStateManager();
      nestedTracking3.markAsSelfDeleted();

      const props = {
        prop1: {
          Tracking: nestedTracking1,
        },
        prop2: {
          Tracking: nestedTracking2,
        },
        prop3: {
          Tracking: nestedTracking3,
        },
      };

      detector.detectChanges(props, trackingStateManager);

      expect(trackingStateManager.isDirty).toBe(true);
      expect(trackingStateManager.isDeleted).toBe(true);
      expect(trackingStateManager.isSelfDeleted).toBe(true);
    });

    it('debe manejar propiedades mixtas (con y sin Tracking)', () => {
      const nestedTracking = new MockTrackingStateManager();
      nestedTracking.markAsDirty();

      const props = {
        user: {
          Tracking: nestedTracking,
        },
        name: 'John',
        age: 25,
        order: null,
      };

      detector.detectChanges(props, trackingStateManager);

      expect(trackingStateManager.isDirty).toBe(true);
    });

    it('debe manejar objetos vacíos', () => {
      const props = {};

      detector.detectChanges(props, trackingStateManager);

      expect(trackingStateManager.isDirty).toBe(false);
      expect(trackingStateManager.isNew).toBe(false);
    });

    it('debe aplicar el estado más prioritario cuando hay múltiples estados', () => {
      const nestedTracking1 = new MockTrackingStateManager();
      nestedTracking1.markAsDirty();

      const nestedTracking2 = new MockTrackingStateManager();
      nestedTracking2.markAsNew();

      const nestedTracking3 = new MockTrackingStateManager();
      nestedTracking3.markAsDeleted();

      const props = {
        prop1: {
          Tracking: nestedTracking1,
        },
        prop2: {
          Tracking: nestedTracking2,
        },
        prop3: {
          Tracking: nestedTracking3,
        },
      };

      detector.detectChanges(props, trackingStateManager);

      // Todos los estados deben estar activos
      expect(trackingStateManager.isDirty).toBe(true);
      expect(trackingStateManager.isNew).toBe(true);
      expect(trackingStateManager.isDeleted).toBe(true);
    });
  });
});
