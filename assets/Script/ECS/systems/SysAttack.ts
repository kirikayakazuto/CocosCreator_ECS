import { ComAttackable } from "../components/ComAttackable";
import { ComBeAttacked } from "../components/ComBeAttacked";
import { ComMonitor } from "../components/ComMonitor";
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
        let filter = world.getFilter(FILTER_ATTACKABLE);
        // 判断当前monitor是否
        filter.entities.forEach((value: boolean, otherEntity: number) => {
            let comBeAttacked = world.getComponent(otherEntity, ComBeAttacked);
            if(!comBeAttacked) return ;
            if(comBeAttacked.attacker == entity) comBeAttacked.attacker = -1;
        });
    }
    /** 更新 */
    public onUpdate(world: ECSWorld, dt: number): void {
        let filter = world.getFilter(FILTER_ATTACKABLE);
        filter.walk((entity: number) => {
            let comTransSelf = world.getComponent(entity, ComTransform);
            let comAttackable = world.getComponent(entity, ComAttackable);
            let comRoleConfigSelf = world.getComponent(entity, ComRoleConfig);
            if(!comAttackable.dirty) return ;

            comAttackable.countDown -= dt;
            if(comAttackable.countDown <= 0) {
                comAttackable.dirty = false;
                for(const entityOther of comAttackable.willHurts) {
                    let comBeAttacked = world.getComponent(entityOther, ComBeAttacked);
                    if(comBeAttacked && comBeAttacked.attacker == entity) comBeAttacked.attacker = -1;
                }
                comAttackable.willHurts.length = 0;
            }

            let limitX = comTransSelf.x + Math.sign(comTransSelf.dir.x) * comAttackable.hurtArea.x;
            let minX = Math.min(comTransSelf.x, limitX);
            let maxX = Math.max(comTransSelf.x, limitX);
            let minY = comTransSelf.y - comAttackable.hurtArea.y;
            let maxY = comTransSelf.y + comAttackable.hurtArea.y;

            let _checkBeAttack = (entityOther: number) => {
                if(entity == entityOther) return false;
                let comRoleConfigOther = world.getComponent(entityOther, ComRoleConfig);
                if(!comRoleConfigOther || comRoleConfigOther.team == comRoleConfigSelf.team) return false;
                let comTransOther = world.getComponent(entityOther, ComTransform);
                if(comTransOther.x < minX || comTransOther.x > maxX || Math.abs(comTransOther.y - comTransSelf.y) >= comAttackable.hurtArea.y) {
                    return false;
                }
                return true
            }

            comAttackable.debugInfo = {
                points: [cc.v2(minX, minY), cc.v2(maxX, minY), cc.v2(maxX, maxY), cc.v2(minX, maxY)],
                color: cc.Color.RED,
            };

            // 即将攻击未完成, 并且处于即将攻击时间段
            if(!comAttackable.willHurtFrameCompleted && comAttackable.countDown <= comAttackable.willHurtFrame) {
                comAttackable.willHurtFrameCompleted = true;
                world.getFilter(FILTER_BEATTACKED).walk((entityOther: number) => {
                    if(!_checkBeAttack(entityOther)) return ;
                    let comBeAttackedOther = world.getComponent(entityOther, ComBeAttacked);
                    comBeAttackedOther.attacker = entity;
                    comAttackable.willHurts.push(entityOther)

                    return false;
                })
            }

            if(!comAttackable.hurtFrameCompleted && comAttackable.countDown <= comAttackable.hurtFrame) {
                comAttackable.hurtFrameCompleted = true;
                world.getFilter(FILTER_BEATTACKED).walk((entityOther: number) => {
                    let comBeAttacked = world.getComponent(entityOther, ComBeAttacked);
                    if(comBeAttacked && comBeAttacked.attacker == entity) comBeAttacked.attacker = -1;
                    if(!_checkBeAttack(entityOther)) return ;
    
                    let comRoleConfigOther = world.getComponent(entityOther, ComRoleConfig);
                    
                    // 扣血
                    if(!comRoleConfigOther || comRoleConfigOther.nowHP <= 0) return ;
                    comRoleConfigOther.lastHP = comRoleConfigOther.nowHP;
                    comRoleConfigOther.nowHP -= comAttackable.attack;
                    comRoleConfigOther.HPDirty = true;
    
                    // 打断对方的攻击动作
                    let comAttackableOther = world.getComponent(entityOther, ComAttackable);
                    if(!comAttackableOther || comAttackableOther.countDown <= 0) return ;
                    comAttackableOther.hurtFrameCompleted = true;
                    comAttackableOther.countDown = 0.25;

                    let comMonitorOther = world.getComponent(entityOther, ComMonitor);
                    if(comMonitorOther.others.indexOf(entity) == -1) {
                        comMonitorOther.others[0] = entity;
                    }
                        
                    return false;
                });
            }
            
            return false;
        });
    }
}