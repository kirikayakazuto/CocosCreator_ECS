import { BT } from "../Common/BehaviorTree";
import { ComAttackable } from "../ECS/components/ComAttackable";
import { ComBeAttacked } from "../ECS/components/ComBeAttacked";
import { ComBehaviorTree } from "../ECS/components/ComBehaviorTree";
import { ComCocosNode } from "../ECS/components/ComCocosNode";
import { ComMonitor } from "../ECS/components/ComMonitor";
import { ComMovable } from "../ECS/components/ComMovable";
import { ComNodeConfig } from "../ECS/components/ComNodeConfig";
import { ComRoleConfig } from "../ECS/components/ComRoleConfig";
import { ComTransform } from "../ECS/components/ComTransform";
import { ECSWorld } from "../ECS/lib/ECSWorld";

export class ECSController<T extends ECSWorld> {
    public world: T;
    public createRoleEntity(name: string) {
        let entity = this.world.createEntity();
        
        // 添加nodeconfig
        let comMap = this.world.addComponent(entity, ComNodeConfig);
        comMap.id = 1;
        comMap.layer = 0;
        comMap.prefabUrl =  `${name}/${name}`;

        // 添加transform
        let comTrans = this.world.addComponent(entity, ComTransform);
        comTrans.x = 0;
        comTrans.y = 0;

        // 添加behavior tree
        let comBehavior = this.world.addComponent(entity, ComBehaviorTree);
        
        let view = cc.view.getVisibleSize();
        let patrol = new BT.SequenceNode([
            new BT.WaitNode(2),
            new BT.WalkToRandomPosNode(100, cc.size(view.width - 200, view.height - 200)),
        ]);

        let follow = new BT.SequenceNode([
            new BT.WalkToTargetNode(250),
            new BT.AttackNode(1.2)
        ]);

        let mainBehavior = new BT.SelectorNode([
            new BT.ParallelNode([
                new BT.InverterNode(new BT.MonitorNode()),
                patrol
            ], true),
            follow
        ]);
        let root = new BT.RepeaterNode(mainBehavior, 9999);
        
        comBehavior.root = root;

        let comMovable = this.world.addComponent(entity, ComMovable);
        comMovable.pointIdx = -1;
        comMovable.running = false;

        let comMonitor = this.world.addComponent(entity, ComMonitor);
        comMonitor.lookLen = 350;
        comMonitor.lookSize = 300;
        comMonitor.aroundLen = 100;

        let comRoleConfig = this.world.addComponent(entity, ComRoleConfig);
        comRoleConfig.maxHP = 100;
        comRoleConfig.lastHP = 100;
        comRoleConfig.nowHP = 100;
        comRoleConfig.attack = 10;
        comRoleConfig.team = name == 'Biker' ? 1 : 2;

        let comAttackable = this.world.addComponent(entity, ComAttackable);
        comAttackable.dirty = false;
        comAttackable.countDown = 0;

        let comBeAttack = this.world.addComponent(entity, ComBeAttacked);
        

        return entity;
    }
}