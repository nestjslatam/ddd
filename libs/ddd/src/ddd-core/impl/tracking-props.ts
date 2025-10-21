import { ITrackingProps } from '../interfaces';

/**
 * Represents the tracking properties for an entity.
 */
export class TrackingProps implements ITrackingProps {
  /**
   * Indicates whether the entity has been modified.
   */
  isDirty: boolean;

  /**
   * Indicates whether the entity is new.
   */
  isNew: boolean;

  /**
   * Indicates whether the entity has been deleted.
   */
  isDeleted: boolean;

  /**
   * Creates a new instance of TrackingProps with isNew set to true and other properties set to false.
   * @returns A new instance of TrackingProps.
   */
  static setNew(): TrackingProps {
    return {
      isDirty: false,
      isNew: true,
      isDeleted: false,
    };
  }

  /**
   * Creates a new instance of TrackingProps with isDirty set to true and other properties set to false.
   * @returns A new instance of TrackingProps.
   */
  static setDirty(): TrackingProps {
    return {
      isDirty: true,
      isNew: false,
      isDeleted: false,
    };
  }

  /**
   * Creates a new instance of TrackingProps with isDeleted set to true and other properties set to false.
   * @returns A new instance of TrackingProps.
   */
  static setDeleted(): TrackingProps {
    return {
      isDirty: false,
      isNew: false,
      isDeleted: true,
    };
  }
}
