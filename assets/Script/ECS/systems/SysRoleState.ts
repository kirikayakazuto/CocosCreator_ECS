import { EventDeath, EventHPChange, EventHurt, EventRun, EventStand } from "../../Struct/NodeEvent";
import { ComBehaviorTree } from "../components/ComBehaviorTree";
import { ComCocosNode } from "../components/ComCocosNode";
import { ComMonitor } from "../components/ComMonitor";
import { ComMovable } from "../components/ComMovable";
import { ComNodeConfig } from "../components/ComNodeConfig";
import { ComRoleConfig } from "../components/ComRoleConfig";
import { ECSSystem } from "../lib/ECSSystem";
import { ECSWorld, GenFillterKey } from "../lib/ECSWorld";

const FILTER_ROLE_NODE = GenFillterKey([ComCocosNode, ComRoleConfig]);
export class SysRoleState extends ECSSystem {
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
        world.getFilter(FILTER_ROLE_NODE).walk((entity: number) => {
            let comCocosNode = world.getComponent(entity, ComCocosNode);
            if(!comCocosNode.loaded) return ;
            let comRoleConfig = world.getComponent(entity, ComRoleConfig);
            let comMovable = world.getComponent(entity, ComMovable);

            if(comMovable && comMovable.speedDirty) {
                comMovable.speedDirty = false;
                if(comMovable.speed > 0) {
                    comCocosNode.events.push(new EventRun());
                }else {
                    comCocosNode.events.push(new EventStand());
                }
            }

            if(comRoleConfig && comRoleConfig.HPDirty) {
                comCocosNode.events.push(new EventHPChange(comRoleConfig.maxHP, comRoleConfig.lastHP, comRoleConfig.nowHP));
                if(comRoleConfig.lastHP > comRoleConfig.nowHP) {
                    comCocosNode.events.push(new EventHurt());
                }
                if(comRoleConfig.nowHP <= 0) {
                    comCocosNode.events.push(new EventDeath(() => {
                        world.removeComponent(entity, ComNodeConfig);
                        world.removeComponent(entity, ComCocosNode); 
                        world.removeEntity(entity);
                        comCocosNode.node.destroy();
                    }));
                    world.removeComponent(entity, ComBehaviorTree);
                    world.removeComponent(entity, ComMonitor);
                    world.removeComponent(entity, ComMovable);
                    world.removeComponent(entity, ComRoleConfig);
                }
                comRoleConfig.HPDirty = false;
            }

            return false;
        });
    }
}