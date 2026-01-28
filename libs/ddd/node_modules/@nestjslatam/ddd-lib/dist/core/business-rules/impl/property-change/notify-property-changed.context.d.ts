import { NotifyPropertyChangedContextArgs } from './notify-property-changed.context-args';
import { AbstractNotifyPropertyChanged, NotifyPropertyChangedHandler } from './notify-property-changed.base';
export declare class NotifyPropertyChangedContext {
    value: any;
    readonly type: any;
    private readonly callbacks;
    constructor(defaultValue: any, type: any, handler?: NotifyPropertyChangedHandler);
    addCallback(handler: NotifyPropertyChangedHandler): void;
    invokePropertyChangedCallback(sender: AbstractNotifyPropertyChanged, e: NotifyPropertyChangedContextArgs): void;
}
//# sourceMappingURL=notify-property-changed.context.d.ts.map