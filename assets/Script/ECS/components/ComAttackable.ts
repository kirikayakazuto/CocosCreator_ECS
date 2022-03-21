import { ComType, EntityIndex } from "../lib/Const";
import { ECSComponent } from "../lib/ECSComponent";

@ECSComponent(ComType.ComAttackable)
export class ComAttackable {
    public duration: number;            // 攻击持续时间
    public countDown: number;           // 攻击剩余时间
    public hurtFrame: number;           // 攻击帧
    public mustAttackFrame: number;
    public hurted: boolean;
    public dirty: boolean;              // 
    public attack: number;              // 攻击力

    public hurtArea: cc.Vec2;           // 攻击区域
}