import { ITrackingStateManager } from './itracking-state-manager';
export interface IProps {
  [key: string]: any;
}
export interface IChangeDetector {
  detectChanges<TProp extends IProps>(
    props: TProp,
    trackingStateManager: ITrackingStateManager,
  ): ITrackingStateManager;
}
//# sourceMappingURL=ichange-detector.d.ts.map
