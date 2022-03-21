import { BT } from "../../Common/BehaviorTree";
import { ComBehaviorTree } from "../components/ComBehaviorTree";
import { ECSSystem } from "../lib/ECSSystem";
import { ECSWorld, GenFillterKey } from "../lib/ECSWorld";



const FILTER_BEHAVIORTREE = GenFillterKey([ComBehaviorTree]);

const Context = new BT.ExecuteContext();

export class SysBehaviorTree extends ECSSystem {

    /** 连接 */
    public onAdd(world: ECSWorld): void{
        Context.init(this, world);
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
        Context.executor = this;
        Context.dt = dt;
        Context.world = world;

        world.getFilter(FILTER_BEHAVIORTREE).walk((entity: number) => {
            let comBehavior = world.getComponent(entity, ComBehaviorTree);
            Context.set(entity, dt, comBehavior.bb);
            if(comBehavior.root.state !== BT.NodeState.Executing) {
                this.onEnterBTNode(comBehavior.root, Context);
            }else {
                this.updateBTNode(comBehavior.root, Context);
            }
            return false;
        });
    }

    /** 进入节点 */
    public onEnterBTNode(node: BT.NodeBase, context: BT.ExecuteContext) {
        let handler = BT.NodeHandlers[node.type];
        handler.onEnter(node, context);
    }

    /** 更新节点状态 */
    public updateBTNode(node: BT.NodeBase, context: BT.ExecuteContext) {
        let handler = BT.NodeHandlers[node.type];
        handler.onUpdate(node, context);
    }

    public canExecuteBTNode(node: BT.NodeBase, context: BT.ExecuteContext) : boolean {
        return true;
    }
}