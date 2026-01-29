import { TrackingProps } from './tracking-props';

describe('TrackingProps', () => {
  describe('setNew', () => {
    it('debe crear TrackingProps con isNew en true y demás en false', () => {
      const props = TrackingProps.setNew();

      expect(props.isNew).toBe(true);
      expect(props.isDirty).toBe(false);
      expect(props.isDeleted).toBe(false);
      expect(props.isSelfDeleted).toBe(false);
    });

    it('debe retornar una nueva instancia cada vez', () => {
      const props1 = TrackingProps.setNew();
      const props2 = TrackingProps.setNew();

      expect(props1).not.toBe(props2);
      expect(props1).toEqual(props2);
    });
  });

  describe('setDirty', () => {
    it('debe crear TrackingProps con isDirty en true y demás en false', () => {
      const props = TrackingProps.setDirty();

      expect(props.isDirty).toBe(true);
      expect(props.isNew).toBe(false);
      expect(props.isDeleted).toBe(false);
      expect(props.isSelfDeleted).toBe(false);
    });

    it('debe retornar una nueva instancia cada vez', () => {
      const props1 = TrackingProps.setDirty();
      const props2 = TrackingProps.setDirty();

      expect(props1).not.toBe(props2);
      expect(props1).toEqual(props2);
    });
  });

  describe('setDeleted', () => {
    it('debe crear TrackingProps con isDeleted en true y demás en false', () => {
      const props = TrackingProps.setDeleted();

      expect(props.isDeleted).toBe(true);
      expect(props.isDirty).toBe(false);
      expect(props.isNew).toBe(false);
      expect(props.isSelfDeleted).toBe(false);
    });

    it('debe retornar una nueva instancia cada vez', () => {
      const props1 = TrackingProps.setDeleted();
      const props2 = TrackingProps.setDeleted();

      expect(props1).not.toBe(props2);
      expect(props1).toEqual(props2);
    });
  });

  describe('setSelfDeleted', () => {
    it('debe crear TrackingProps con isSelfDeleted en true y demás en false', () => {
      const props = TrackingProps.setSelfDeleted();

      expect(props.isSelfDeleted).toBe(true);
      expect(props.isDirty).toBe(false);
      expect(props.isNew).toBe(false);
      expect(props.isDeleted).toBe(false);
    });

    it('debe retornar una nueva instancia cada vez', () => {
      const props1 = TrackingProps.setSelfDeleted();
      const props2 = TrackingProps.setSelfDeleted();

      expect(props1).not.toBe(props2);
      expect(props1).toEqual(props2);
    });
  });

  describe('comparación de métodos', () => {
    it('debe crear estados diferentes para cada método', () => {
      const newProps = TrackingProps.setNew();
      const dirtyProps = TrackingProps.setDirty();
      const deletedProps = TrackingProps.setDeleted();
      const selfDeletedProps = TrackingProps.setSelfDeleted();

      expect(newProps).not.toEqual(dirtyProps);
      expect(newProps).not.toEqual(deletedProps);
      expect(newProps).not.toEqual(selfDeletedProps);
      expect(dirtyProps).not.toEqual(deletedProps);
      expect(dirtyProps).not.toEqual(selfDeletedProps);
      expect(deletedProps).not.toEqual(selfDeletedProps);
    });
  });
});
