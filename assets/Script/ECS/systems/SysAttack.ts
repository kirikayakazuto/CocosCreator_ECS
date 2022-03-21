import { ComAttackable } from "../components/ComAttackable";
import { ComBeAttacked } from "../components/ComBeAttacked";
import { ComRoleConfig } from "../components/ComRoleConfig";
import { ComTransform } from "../components/ComTransform";
import { ECSSystem } from "../lib/ECSSystem";
import { ECSWorld, GenFillterKey } from "../lib/ECSWorld";

const FILTER_ATTACKABLE = GenFillterKey([ComAttackable]);
const FILTER_BEATTACKED = GenFillterKey([ComBeAttacked]);
export class SysAttack extends ECSSystem {
    /** 连接 */
    public onAdd(world: ECSWorld): void {

    }
    /** 断开连接 */
    public onRemove(world: ECSWorld): void {

    }
    /** 添加实体 */
    public onEntityEnter(world: ECSWorld, entity: number): void {

    }
    /**  */
    public onEntityLeave(world: ECSWorld, entity: number): void {

    }
    /** 更新 */
    public onUpdate(world: ECSWorld, dt: number): void {
        let filter = world.getFilter(FILTER_ATTACKABLE);
        filter.walk((entity: number) => {
            let comTransSelf = world.getComponent(entity, ComTransform);
            let comAttackable = world.getComponent(entity, ComAttackable);
            let comRoleConfigSelf = world.getComponent(entity, ComRoleConfig);
            if(comAttackable.countDown <= 0) return ;
            comAttackable.countDown -= dt;

            if(comAttackable.mustAttackFrame)
            if(comAttackable.dirty && comAttackable.countDown <= comAttackable.hurtFrame) {
                comAttackable.dirty = false;
                world.getFilter(FILTER_BEATTACKED).walk((entityOther: number) => {
                    let comRoleConfigOther = world.getComponent(entityOther, ComRoleConfig);
                    let comTransOther = world.getComponent(entityOther, ComTransform);
                    if(!comRoleConfigOther || comRoleConfigOther.team == comRoleConfigSelf.team) return ;
                    let xDiff = comTransOther.x - comTransSelf.x;
                    if(xDiff * Math.sign(xDiff) >= comAttackable.hurtArea.x || Math.abs(comTransOther.y - comTransSelf.y) >= comAttackable.hurtArea.y) {
                        return ;
                    }
                    
                    // 扣血
                    if(!comRoleConfigOther || comRoleConfigOther.nowHP <= 0) return ;
                    comRoleConfigOther.lastHP = comRoleConfigOther.nowHP;
                    comRoleConfigOther.nowHP -= comAttackable.attack;
                    comRoleConfigOther.HPDirty = true;

                    // 打断对方的攻击动作
                    let comAttackableOther = world.getComponent(entityOther, ComAttackable);
                    if(!comAttackableOther || comAttackableOther.countDown <= 0) return ;
                    if(comAttackableOther.countDown >= comAttackableOther.mustAttackFrame) {
                        comAttackableOther.dirty = false;
                    }
                    
                    comAttackable.countDown = 0.25;
                       
                    return false;
                });
            }
            
            return false;
        });
    }
}