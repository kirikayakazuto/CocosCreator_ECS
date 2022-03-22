import { ComType, EntityIndex } from "../lib/Const";
import { ECSComponent } from "../lib/ECSComponent";

@ECSComponent(ComType.ComAttackable)
export class ComAttackable {
    public duration: number;            // 攻击持续时间
    public countDown: number;           // 攻击剩余时间
    public dirty: boolean;              // 

    public willHurtFrame: number;               // 即将攻击
    public willHurtFrameCompleted: boolean;      // 即将攻击完成

    public hurtFrame: number;                   // 攻击
    public hurtFrameCompleted: boolean;         // 攻击完成
    
    
    public attack: number;              // 攻击力
    public hurtArea: cc.Vec2;           // 攻击区域

    public debugInfo: any;

    public willHurts: number[] = [];
}