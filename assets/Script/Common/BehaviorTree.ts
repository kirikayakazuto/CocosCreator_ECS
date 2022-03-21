import { ComAttackable } from "../ECS/components/ComAttackable";
import { ComCocosNode } from "../ECS/components/ComCocosNode";
import { ComMonitor } from "../ECS/components/ComMonitor";
import { ComMovable } from "../ECS/components/ComMovable";
import { ComRoleConfig } from "../ECS/components/ComRoleConfig";
import { ComTransform } from "../ECS/components/ComTransform";
import { ECSWorld } from "../ECS/lib/ECSWorld";
import { SysBehaviorTree } from "../ECS/systems/SysBehaviorTree";
import { EventAttack, EventHPChange, EventHurt } from "../Struct/NodeEvent";
export namespace BT {

    export class BlackBoard {

    }
    
    export class ExecuteContext {
        executor: SysBehaviorTree;
        world: ECSWorld;
        bb: BlackBoard;

        entity: number;
        dt: number;
        public init(executor: SysBehaviorTree, world: ECSWorld) {
            this.executor = executor;
            this.world = world;
        }

        public set(entity: number, dt: number, bb: BlackBoard) {
            this.entity = entity;
            this.dt = dt;
            this.bb = bb;
        }
    }

    /** 节点状态 */
    export enum NodeState {
        Executing,                  // 执行中
        Success,                    // 成功
        Fail                        // 失败
    }


    /** 节点类型 */
    export enum NodeType {
        // 组合节点
        Sequence,                   // 顺序节点
        Selector,                   // 选择节点
        RandomSelector,             // 随机选择节点
        Parallel,                   // 并行节点

        // 修饰节点
        Inverter,                   // 逆变节点
        Success,                    // 成功节点
        Fail,                       // 失败节点
        Repeater,                   // 重复节点
        RetryTillSuccess,           // 重复直到成功

        // 叶子结点
        Wait,                       // 等待
        Action,
        WalkToPos,
        WalkToRandomPos,            // 
        WalkToTarget,
        Monitor,                     // 监视
        Attack,

        EnoughAttr,                 // 死亡
        GoDeath,                    // 检查是否
    }

    export class NodeBase {
        public type: NodeType;
        public state: NodeState = NodeState.Success;

        constructor(type: NodeType) {
            this.type = type;
        }
    }

    /** 组合节点 */
    class CombineNode extends NodeBase {
        public children: NodeBase[] = [];

        public constructor(type: NodeType, children: NodeBase[]) {
            super(type);
            this.children = children;
        }
    }

    /** 依次执行子节点, 遇到执行失败的则退出并返回失败, 全部执行成功则返回成功  */
    export class SequenceNode extends CombineNode {
        public currIdx = 0;
        public ignoreFailure = false;

        constructor(children: NodeBase[], ignoreFailture = false) {
            super(NodeType.Sequence, children);
            this.ignoreFailure = ignoreFailture;
        }
    }

    /** 依次执行子节点, 遇到执行成功的则退出并返回成功, 全部执行失败则返回失败 */
    export class SelectorNode extends CombineNode {
        public currIdx:number = -1;

        constructor(children: NodeBase[], ) {
            super(NodeType.Selector, children);
        }
    }

    /** 根据权重随机选择执行某个子节点 */
    export class RandomSelectorNode extends CombineNode {
        public weights: number[];       // 权重
        public currIdx = -1;            // 选中的节点
        constructor(children: NodeBase[], weigets?: number[]) {
            super(NodeType.RandomSelector, children);
            this.weights = weigets ? weigets : new Array(children.length).fill(1);
        }
    }
    
    /** 并行执行所有子节点, 全部执行完毕后返回 */
    export class ParallelNode extends CombineNode {
        public ignoreFailture = true;
        constructor(children: NodeBase[], ignoreFailture: boolean) {
            super(NodeType.Parallel, children);
            this.ignoreFailture = ignoreFailture;
        }
    }

    /** 修饰节点 */
    class DecoratorNode extends NodeBase {
        public child: NodeBase = null;
        public constructor(type: NodeType, child: NodeBase) {
            super(type);
            this.child = child;
        }
    }

    /** 返回子节点执行结果的取反值 */
    export class InverterNode extends DecoratorNode {
        constructor(child: NodeBase) {
            super(NodeType.Inverter, child);
        }
    }

    /** 子节点执行完毕后, 必定返回成功 */
    export class SuccessNode extends DecoratorNode {
        constructor(child: NodeBase) {
            super(NodeType.Success, child);
        }
    }

    /** 子节点执行完毕后, 必定返回失败 */
    export class FailNode extends DecoratorNode {
        constructor(child: NodeBase) {
            super(NodeType.Fail, child);
        }
    }

    /** 子节点执行重复repeatCount次后返回成功 */
    export class RepeaterNode extends DecoratorNode {
        public repeatCount = 1;
        public currRepeatCount = 0;
        public mustSuccess = false;     // 子节点必须支持成功才增加重复次数
        constructor(child: NodeBase, repeatCount: number, mustSuccess = false) {
            super(NodeType.Repeater, child);
            this.repeatCount = repeatCount;
            this.mustSuccess = mustSuccess;
        }
    }

    /** 子节点重复执行直到返回成功 */
    export class RetryTillSuccess extends DecoratorNode {
        timeout: number;    // 超时时间
        countDown: number;  // 剩余时间
        constructor(child: NodeBase, timeout:number) {
            super(NodeType.RetryTillSuccess, child);
            this.timeout = timeout;
        }
    }


    /** 叶子结点 */
    export class WaitNode extends NodeBase {
        public waitSeconds:number;
        public countDown:number;

        constructor(seconds:number) {
            super(NodeType.Wait);
            this.waitSeconds = seconds;
        }
    }

    /** 移动到目标位置后 返回成功 */
    export class WalkToPosNode extends NodeBase {
        public speed:number;
        public targetPos: cc.Vec2;
        constructor(speed: number, pos: cc.Vec2) {
            super(NodeType.WalkToPos);
            this.speed = speed;
            this.targetPos = pos;
        }
    }

    export class WalkToRandomPosNode extends NodeBase {
        public speed: number;
        public size: cc.Size;
        constructor(speed: number, size: cc.Size) {
            super(NodeType.WalkToRandomPos);
            this.speed = speed;
            this.size = size;
        }
    }

    export class WalkToTargetNode extends NodeBase {
        public speed: number;
        constructor(speed: number) {
            super(NodeType.WalkToTarget);
            this.speed = speed;
        }
    }

    export class MonitorNode extends NodeBase {
        constructor() {
            super(NodeType.Monitor);
        }
    }

    export class AttackNode extends NodeBase {
        constructor(waitSeconds: number) {
            super(NodeType.Attack);
        }
    }

    export class EnoughAttrNode extends NodeBase {
        public com: {prototype: any};
        public attr: string;
        public value: number;
        constructor(com: {prototype: any}, attr: string, value: number) {
            super(NodeType.EnoughAttr);
            this.com = com;
            this.attr = attr;
            this.value = value;
        }
    }

    export class GoDeathNode extends NodeBase {
        public waitSeconds: number;
        public countDown: number;
        constructor(waitSeconds: number) {
            super(NodeType.GoDeath);
            this.waitSeconds = waitSeconds;
        }
    }

    class NodeHandler {
        onEnter:(node: NodeBase, context: ExecuteContext) => void;
        onUpdate:(node: NodeBase, context: ExecuteContext) => void;
    }

    export const NodeHandlers : NodeHandler[] = [];

    /** Sequence node */
    NodeHandlers[NodeType.Sequence] = {
        onEnter(node: SequenceNode, context: ExecuteContext) : void {
            node.currIdx = 0;
            context.executor.onEnterBTNode(node.children[node.currIdx], context);
            node.state = NodeState.Executing;
        },
        onUpdate(node: SequenceNode, context: ExecuteContext) : void {
            if(node.state !== NodeState.Executing) return ;
            if(node.currIdx < 0 || node.currIdx >= node.children.length) {
                // 越界了, 不应该发生, 直接认为是失败了
                node.state = NodeState.Fail;
                return;
            }

            context.executor.updateBTNode(node.children[node.currIdx], context);
            let state = node.children[node.currIdx].state;
            if(state == NodeState.Executing) return;

            if(state === NodeState.Fail && !node.ignoreFailure) {
                node.state = NodeState.Fail;
                return;
            }
            if(state === NodeState.Success && node.currIdx == node.children.length-1) {
                node.state = NodeState.Success;
                return ;
            }
            context.executor.onEnterBTNode(node.children[++node.currIdx], context);
        }
    };

    /** Selector node */
    NodeHandlers[NodeType.Selector] = {
        onEnter(node: SelectorNode, context: ExecuteContext) : void {
            node.currIdx = 0;
            context.executor.onEnterBTNode(node.children[node.currIdx], context);
            node.state = NodeState.Executing;
        },
        onUpdate(node: SelectorNode, context: ExecuteContext) : void {
            if(node.state !== NodeState.Executing) return ;
            if(node.currIdx < 0 || node.currIdx >= node.children.length) {
                // 越界了, 认为是失败了
                node.state = NodeState.Fail;
                return;
            }

            context.executor.updateBTNode(node.children[node.currIdx], context);
            let state = node.children[node.currIdx].state;
            if(state == NodeState.Executing) return;

            // 执行到最后一个都失败了, 那边selector失败了
            if(state === NodeState.Fail && node.currIdx == node.children.length-1) {
                node.state = NodeState.Fail;
                return;
            }
            if(state == NodeState.Success) {
                node.state = NodeState.Success;
                return ;
            }
            context.executor.onEnterBTNode(node.children[++node.currIdx], context);
        }
    };

    /** Selector node */
    NodeHandlers[NodeType.RandomSelector] = {
        onEnter(node: RandomSelectorNode, context: ExecuteContext) : void {
            // 根据权重随机获取idx
            let totalWeight = 0;
            for(const weight of node.weights) {
                totalWeight += weight;
            }
            let randomWeight = Math.random() * totalWeight;
            for(let i=0; i<node.weights.length; i++) {
                randomWeight -= node.weights[i];
                if(randomWeight <= 0) {
                    node.currIdx = i;
                    break;
                }
            }
            context.executor.onEnterBTNode(node.children[node.currIdx], context);
            node.state = NodeState.Executing;
        },
        onUpdate(node: RandomSelectorNode, context: ExecuteContext) : void {
            if(node.state !== NodeState.Executing) return ;
            let n = node.children[node.currIdx];
            context.executor.updateBTNode(n, context);
            node.state = n.state;
        }
    };

    /** Parallel node */
    NodeHandlers[NodeType.Parallel] = {
        onEnter(node: ParallelNode, context: ExecuteContext) : void {
            for(const n of node.children) {
                context.executor.onEnterBTNode(n, context);
            }
            node.state = NodeState.Executing;
        },
        onUpdate(node: ParallelNode, context: ExecuteContext) : void {
            if(node.state !== NodeState.Executing) return ;
            let end = true;
            for(const child of node.children) {
                context.executor.updateBTNode(child, context);
                if(child.state === NodeState.Executing) {
                    end = false;
                    continue;
                }

                if(child.state == NodeState.Fail) {
                    node.state = NodeState.Fail;
                    return ;
                }
            }
            if(end) {
                node.state = NodeState.Success;
            }
        }
    };

    /** Inverter node */
    NodeHandlers[NodeType.Inverter] = {
        onEnter(node: InverterNode, context: ExecuteContext) : void {
            context.executor.onEnterBTNode(node.child, context);
            node.state = NodeState.Executing;
        },
        onUpdate(node: InverterNode, context: ExecuteContext) : void {
            context.executor.updateBTNode(node.child, context);
            if(node.child.state === NodeState.Executing) return ;
            if(node.child.state == NodeState.Success) node.state = NodeState.Fail;
            if(node.child.state == NodeState.Fail) node.state = NodeState.Success;
        }
    };

    /** Success node */
    NodeHandlers[NodeType.Success] = {
        onEnter(node: SuccessNode, context: ExecuteContext) : void {
            context.executor.onEnterBTNode(node.child, context);
            node.state = NodeState.Executing;
        },
        onUpdate(node: SuccessNode, context: ExecuteContext) : void {
            if(node.state !== NodeState.Executing) return ;
            context.executor.updateBTNode(node.child, context);
            if(node.child.state === NodeState.Executing) return ;
            node.state = NodeState.Success;
        }
    };

    /** Fail node */
    NodeHandlers[NodeType.Fail] = {
        onEnter(node: FailNode, context: ExecuteContext) : void {
            context.executor.onEnterBTNode(node.child, context);
            node.state = NodeState.Executing;
        },
        onUpdate(node: FailNode, context: ExecuteContext) : void {
            if(node.state !== NodeState.Executing) return ;
            context.executor.updateBTNode(node.child, context);
            if(node.child.state === NodeState.Executing) return ;
            node.state = NodeState.Fail;
        }
    };

    /** Repeater node */
    NodeHandlers[NodeType.Repeater] = {
        onEnter(node: RepeaterNode, context: ExecuteContext) : void {
            node.currRepeatCount = 0;
            context.executor.onEnterBTNode(node.child, context);
            node.state = NodeState.Executing;
        },
        onUpdate(node: RepeaterNode, context: ExecuteContext) : void {
            if(node.state !== NodeState.Executing) return ;
            context.executor.updateBTNode(node.child, context);
            if(node.child.state === NodeState.Executing) return ;
            if(!node.mustSuccess || node.child.state == NodeState.Success) node.currRepeatCount ++;
            if(node.currRepeatCount >= node.repeatCount) {
                node.state = NodeState.Success;
                return ;
            }
            context.executor.onEnterBTNode(node.child, context);
        }
    };


    /** RetryTillSuccess node */
    NodeHandlers[NodeType.RetryTillSuccess] = {
        onEnter(node: RetryTillSuccess, context: ExecuteContext) : void {
            node.countDown = node.timeout;
            context.executor.onEnterBTNode(node.child, context);
            node.state = NodeState.Executing;
        },

        onUpdate(node: RetryTillSuccess, context: ExecuteContext) : void {
            if(node.state !== NodeState.Executing) return ;
            node.countDown -= context.dt;
            
            context.executor.updateBTNode(node.child, context);
            if(node.child.state === NodeState.Executing) return ;

            if(node.child.state == NodeState.Success) {
                node.state = NodeState.Success;
                return ;
            }

            if(node.countDown > 0) {
                context.executor.onEnterBTNode(node.child, context);
                return ;
            }
            node.state = NodeState.Fail;
        }
    };


    /** Wait node */
    NodeHandlers[NodeType.Wait] = {
        onEnter(node: WaitNode, context: ExecuteContext) : void {
            node.countDown = node.waitSeconds;
            node.state = NodeState.Executing;
        },
        onUpdate(node: WaitNode, context: ExecuteContext) : void {
            if(node.state !== NodeState.Executing) return ;
            node.countDown -= context.dt;
            if(node.countDown <= 0) {
                node.state = NodeState.Success;
            }
        }
    };

    /** Wait node */
    NodeHandlers[NodeType.WalkToPos] = {
        onEnter(node: WalkToPosNode, context: ExecuteContext) : void {
            let comTrans = context.world.getComponent(context.entity, ComTransform);
            let comMovable = context.world.getComponent(context.entity, ComMovable);
            comMovable.pointIdx = 0;
            comMovable.points.length = 0;
            comMovable.points.push(cc.v2(comTrans.x, comTrans.y), node.targetPos);
            comMovable.speed = node.speed;
            comMovable.speedDirty = true;
            node.state = NodeState.Executing;
            comMovable.running = false;
        },
        onUpdate(node: WalkToPosNode, context: ExecuteContext) : void {
            if(node.state !== NodeState.Executing) return ;
            let comMovable = context.world.getComponent(context.entity, ComMovable);
            if(comMovable.points.length == 0 || comMovable.pointIdx < 0 || comMovable.pointIdx >= comMovable.points.length) {
                node.state = BT.NodeState.Success;
            }
        }
    };

    /** WalkToRandomPos node */
    NodeHandlers[NodeType.WalkToRandomPos] = {
        onEnter(node: WalkToRandomPosNode, context: ExecuteContext) : void {
            let comTrans = context.world.getComponent(context.entity, ComTransform);
            let comMovable = context.world.getComponent(context.entity, ComMovable);
            comMovable.pointIdx = 0;
            comMovable.points.length = 0;
            let targetX = node.size.width * Math.random() - node.size.width/2;
            let targetY = node.size.height * Math.random() - node.size.height/2;
            comMovable.points.push(cc.v2(comTrans.x, comTrans.y), cc.v2(targetX, targetY));
            comMovable.speed = node.speed;
            comMovable.speedDirty = true;
            node.state = NodeState.Executing;
            comMovable.running = false;
        },
        onUpdate(node: WalkToPosNode, context: ExecuteContext) : void {
            if(node.state !== NodeState.Executing) return ;
            let comMovable = context.world.getComponent(context.entity, ComMovable);
            if(comMovable.points.length == 0 || comMovable.pointIdx < 0 || comMovable.pointIdx >= comMovable.points.length) {
                node.state = BT.NodeState.Success;
            }
        }
    };

    /** WalkToTarget node */
    NodeHandlers[NodeType.WalkToTarget] = {
        onEnter(node: WalkToTargetNode, context: ExecuteContext) : void {
            let comTrans = context.world.getComponent(context.entity, ComTransform);
            let comMovable = context.world.getComponent(context.entity, ComMovable);
            let comMonitor = context.world.getComponent(context.entity, ComMonitor);
            if(comMonitor.others.length <= 0) return ;
            let target = context.world.getComponent(comMonitor.others[0], ComTransform);
            let xOffdet = Math.sign(comTrans.x - target.x) * 10;
            comMovable.pointIdx = 0;
            comMovable.points.length = 0;
            comMovable.points.push(cc.v2(comTrans.x, comTrans.y), cc.v2(target.x + xOffdet, target.y));
            comMovable.speed = node.speed;
            comMovable.speedDirty = true;
            node.state = NodeState.Executing;
            comMovable.running = false;
            
        },
        onUpdate(node: WalkToTargetNode, context: ExecuteContext) : void {
            if(node.state !== NodeState.Executing) return ;
            let comTrans = context.world.getComponent(context.entity, ComTransform);
            let comMonitor = context.world.getComponent(context.entity, ComMonitor);
            let comMovable = context.world.getComponent(context.entity, ComMovable);
            if(comMovable.points.length == 0 || comMovable.pointIdx < 0 || comMovable.pointIdx >= comMovable.points.length) {
                node.state = BT.NodeState.Success;
                return ;
            }
            if(comMonitor.others.length <= 0) {
                node.state = BT.NodeState.Fail;
                return ;
            }
            let target = context.world.getComponent(comMonitor.others[0], ComTransform);
            let xOffdet = Math.sign(comTrans.x - target.x) * 10;
            comMovable.points[1].x = target.x + xOffdet;
            comMovable.points[1].y = target.y;
        }
    };

    /** Monitor node */
    NodeHandlers[NodeType.Monitor] = {
        onEnter(node: MonitorNode, context: ExecuteContext) : void {
            let comMonitor = context.world.getComponent(context.entity, ComMonitor);
            if(!comMonitor) return ;            
            node.state = NodeState.Executing;
        },
        onUpdate(node: MonitorNode, context: ExecuteContext) : void {
            let comMonitor = context.world.getComponent(context.entity, ComMonitor);
            node.state = comMonitor.others.length > 0 ? BT.NodeState.Success : BT.NodeState.Fail;
        }
    };

    /** Monitor node */
    NodeHandlers[NodeType.Attack] = {
        onEnter(node: AttackNode, context: ExecuteContext) : void {
            node.state = NodeState.Executing;
            
            let comCocosNode = context.world.getComponent(context.entity, ComCocosNode);
            if(!comCocosNode.loaded) return ;

            comCocosNode.events.push(new (EventAttack));
            let comAttackable = context.world.getComponent(context.entity, ComAttackable);
            comAttackable.duration = 1.2;
            comAttackable.countDown = comAttackable.duration;
            comAttackable.dirty = true;
            comAttackable.hurtArea = cc.v2(20, 10);
            comAttackable.hurtFrame = 0.5;
            comAttackable.mustAttackFrame = 0.6;
            comAttackable.attack = 10;
        },
        onUpdate(node: AttackNode, context: ExecuteContext) : void {
            if(node.state !== NodeState.Executing) return ;
            let comAttackable = context.world.getComponent(context.entity, ComAttackable);
            
            if(comAttackable.countDown <= 0) {
                node.state = NodeState.Success;
            }
        }
    };

    /** EnoughAttr node */
    NodeHandlers[NodeType.EnoughAttr] = {
        onEnter(node: EnoughAttrNode, context: ExecuteContext) : void {
            let com = context.world.getComponent(context.entity, node.com);
            if(!com) return ;            
            node.state = NodeState.Executing;
        },
        onUpdate(node: EnoughAttrNode, context: ExecuteContext) : void {
            let com = context.world.getComponent(context.entity, node.com);
            if(!com) return ;            
            node.state = com[node.attr] >= node.value ? NodeState.Success : NodeState.Fail;
        }
    };

    /** GoDeath node */
    NodeHandlers[NodeType.GoDeath] = {
        onEnter(node: GoDeathNode, context: ExecuteContext) : void {
            node.countDown = node.waitSeconds;
            node.state = NodeState.Executing;
        },
        onUpdate(node: GoDeathNode, context: ExecuteContext) : void {
            if(node.countDown <= 0) {
                node.state = NodeState.Success;
            }
        }
    };





}
