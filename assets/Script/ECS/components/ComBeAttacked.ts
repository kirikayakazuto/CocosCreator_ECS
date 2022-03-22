import { ComType, EntityIndex } from "../lib/Const";
import { ECSComponent } from "../lib/ECSComponent";

@ECSComponent(ComType.ComBeAttacked)
export class ComBeAttacked {
    public attacker: EntityIndex = -1;
}