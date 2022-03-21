import { ComType } from "../lib/Const";
import { ECSComponent } from "../lib/ECSComponent";

@ECSComponent(ComType.ComTransform)
export class ComTransform {
    public dir = cc.v2(1, 0);   //方向向量
    public x = 0;
    public y = 0;
    public width = 0;
    public height = 0;
}