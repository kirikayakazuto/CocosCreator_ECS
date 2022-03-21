import { ComType, EntityIndex } from "../lib/Const";
import { ECSComponent } from "../lib/ECSComponent";

@ECSComponent(ComType.ComMonitor)
export class ComMonitor {
    public lookLen = 0;
    public lookSize = 0;
    public aroundLen = 0;
    public others: EntityIndex[] = [];
}