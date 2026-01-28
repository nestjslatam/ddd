import { NotifyPropertyChangedContextArgs } from './notify-property-changed.context-args';
export type NotifyPropertyChangedHandler = (sender: AbstractNotifyPropertyChanged, e: NotifyPropertyChangedContextArgs) => void;
export declare abstract class AbstractNotifyPropertyChanged {
    private readonly properties;
    protected isCallbackInvokingEnabled: boolean;
    protected isEventInvokingEnabled: boolean;
    onPropertyChanged?: (propertyName: string) => void;
    protected constructor();
    protected registerProperty(name: string, type: any, defaultValue: any, handler?: NotifyPropertyChangedHandler): void;
    registerPropertyChangedCallback(propertyName: string, handler: NotifyPropertyChangedHandler): void;
    protected getValuePropertyChanged(propertyName: string): any;
    protected setValuePropertyChanged(value: any, propertyName: string, force?: boolean): void;
    private getPropertyContext;
    private static validateValueForType;
}
//# sourceMappingURL=notify-property-changed.base.d.ts.map