import { ComType } from "../lib/Const";
import { ECSComponent } from "../lib/ECSComponent";

@ECSComponent(ComType.ComNodeConfig)
export class ComNodeConfig {
    id = 0;                 // 唯一标识
    prefabUrl = '' 
    layer = 0;              // 层级
}