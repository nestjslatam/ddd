import { ITrackingStateTransitions } from '../interfaces/itracking-state-transitions';
import { TrackingStateTransition } from './tracking-state-transition';

describe('TrackingStateTransition', () => {
  class MockTrackingStateManager implements ITrackingStateTransitions {
    public isDirty: boolean = false;
    public isNew: boolean = false;
    public isSelfDeleted: boolean = false;
    public isDeleted: boolean = false;

    setDirty(value: boolean): void {
      this.isDirty = value;
    }

    setNew(value: boolean): void {
      this.isNew = value;
    }

    setSelfDeleted(value: boolean): void {
      this.isSelfDeleted = value;
    }

    setDeleted(value: boolean): void {
      this.isDeleted = value;
    }
  }

  let manager: MockTrackingStateManager;

  beforeEach(() => {
    manager = new MockTrackingStateManager();
  });

  describe('toDirty', () => {
    it('debe establecer isDirty en true y resetear otros estados', () => {
      manager.setNew(true);
      manager.setDeleted(true);
      manager.setSelfDeleted(true);

      TrackingStateTransition.toDirty(manager);

      expect(manager.isDirty).toBe(true);
      expect(manager.isNew).toBe(false);
      expect(manager.isDeleted).toBe(false);
      expect(manager.isSelfDeleted).toBe(false);
    });

    it('debe resetear todos los estados antes de establecer isDirty', () => {
      manager.setDirty(true);
      manager.setNew(true);
      manager.setDeleted(true);
      manager.setSelfDeleted(true);

      TrackingStateTransition.toDirty(manager);

      expect(manager.isDirty).toBe(true);
      expect(manager.isNew).toBe(false);
      expect(manager.isDeleted).toBe(false);
      expect(manager.isSelfDeleted).toBe(false);
    });
  });

  describe('toNew', () => {
    it('debe establecer isNew en true y resetear otros estados', () => {
      manager.setDirty(true);
      manager.setDeleted(true);
      manager.setSelfDeleted(true);

      TrackingStateTransition.toNew(manager);

      expect(manager.isNew).toBe(true);
      expect(manager.isDirty).toBe(false);
      expect(manager.isDeleted).toBe(false);
      expect(manager.isSelfDeleted).toBe(false);
    });

    it('debe resetear todos los estados antes de establecer isNew', () => {
      manager.setDirty(true);
      manager.setNew(true);
      manager.setDeleted(true);
      manager.setSelfDeleted(true);

      TrackingStateTransition.toNew(manager);

      expect(manager.isNew).toBe(true);
      expect(manager.isDirty).toBe(false);
      expect(manager.isDeleted).toBe(false);
      expect(manager.isSelfDeleted).toBe(false);
    });
  });

  describe('toSelfDeleted', () => {
    it('debe establecer isSelfDeleted en true y resetear otros estados', () => {
      manager.setDirty(true);
      manager.setNew(true);
      manager.setDeleted(true);

      TrackingStateTransition.toSelfDeleted(manager);

      expect(manager.isSelfDeleted).toBe(true);
      expect(manager.isDirty).toBe(false);
      expect(manager.isNew).toBe(false);
      expect(manager.isDeleted).toBe(false);
    });

    it('debe resetear todos los estados antes de establecer isSelfDeleted', () => {
      manager.setDirty(true);
      manager.setNew(true);
      manager.setDeleted(true);
      manager.setSelfDeleted(true);

      TrackingStateTransition.toSelfDeleted(manager);

      expect(manager.isSelfDeleted).toBe(true);
      expect(manager.isDirty).toBe(false);
      expect(manager.isNew).toBe(false);
      expect(manager.isDeleted).toBe(false);
    });
  });

  describe('toDeleted', () => {
    it('debe establecer isDeleted en true y resetear otros estados', () => {
      manager.setDirty(true);
      manager.setNew(true);
      manager.setSelfDeleted(true);

      TrackingStateTransition.toDeleted(manager);

      expect(manager.isDeleted).toBe(true);
      expect(manager.isDirty).toBe(false);
      expect(manager.isNew).toBe(false);
      expect(manager.isSelfDeleted).toBe(false);
    });

    it('debe resetear todos los estados antes de establecer isDeleted', () => {
      manager.setDirty(true);
      manager.setNew(true);
      manager.setDeleted(true);
      manager.setSelfDeleted(true);

      TrackingStateTransition.toDeleted(manager);

      expect(manager.isDeleted).toBe(true);
      expect(manager.isDirty).toBe(false);
      expect(manager.isNew).toBe(false);
      expect(manager.isSelfDeleted).toBe(false);
    });
  });

  describe('transiciones secuenciales', () => {
    it('debe permitir transiciones de un estado a otro', () => {
      TrackingStateTransition.toDirty(manager);
      expect(manager.isDirty).toBe(true);

      TrackingStateTransition.toNew(manager);
      expect(manager.isNew).toBe(true);
      expect(manager.isDirty).toBe(false);

      TrackingStateTransition.toDeleted(manager);
      expect(manager.isDeleted).toBe(true);
      expect(manager.isNew).toBe(false);

      TrackingStateTransition.toSelfDeleted(manager);
      expect(manager.isSelfDeleted).toBe(true);
      expect(manager.isDeleted).toBe(false);
    });
  });

  describe('reset completo', () => {
    it('debe resetear todos los estados cuando se aplica cualquier transición', () => {
      // Establecer todos los estados
      manager.setDirty(true);
      manager.setNew(true);
      manager.setDeleted(true);
      manager.setSelfDeleted(true);

      // Aplicar transición a dirty
      TrackingStateTransition.toDirty(manager);

      // Verificar que solo isDirty está activo
      expect(manager.isDirty).toBe(true);
      expect(manager.isNew).toBe(false);
      expect(manager.isDeleted).toBe(false);
      expect(manager.isSelfDeleted).toBe(false);
    });
  });
});
