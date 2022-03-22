import { ComType, EntityIndex } from "../lib/Const";
import { ECSComponent } from "../lib/ECSComponent";

@ECSComponent(ComType.ComMonitor)
export class ComMonitor {
    public lookLen = 0;
    public lookWidth = 0;
    public outLen = 0;
    public aroundLen = 0;
    public others: EntityIndex[] = [];
    public debugInfo: any;
}