import CocosHelper from "../../Common/CocosHelper";
import { ComNodeConfig } from "../components/ComNodeConfig";
import { ComCocosNode } from "../components/ComCocosNode";
import { ECSSystem } from "../lib/ECSSystem";
import { ECSWorld, GenFillterKey } from "../lib/ECSWorld";
import { ComTransform } from "../components/ComTransform";
import { EventProcess } from "../../Core/EventProcess";
import { ComRoleConfig } from "../components/ComRoleConfig";

export interface ITouchProcessor {
    onTouchStart(worldPos: cc.Vec2, world: ECSWorld): void;
    onTouchMove?(worldPos: cc.Vec2, world: ECSWorld): void;
    onTouchEnd?(worldPos: cc.Vec2, world: ECSWorld): void;
    onTouchCancel?(worldPos: cc.Vec2, world: ECSWorld): void;
}

const FILTER_COCOS_NODE = GenFillterKey([ComNodeConfig], [ComCocosNode]);
const FILTER_NODE_EVENT = GenFillterKey([ComCocosNode, ComTransform]);
export class SysCocosView extends ECSSystem implements ITouchProcessor {

    onTouchStart(worldPos: cc.Vec2, world: ECSWorld): boolean {
        
        return false;
    }

    onTouchMove(worldPos: cc.Vec2, world: ECSWorld): void {
        
    }

    onTouchCancel(worldPos: cc.Vec2, world: ECSWorld): void {
        
    }

    onAdd(world: ECSWorld) {

    }

    onRemove(world: ECSWorld) {

    }

    onEntityEnter(world: ECSWorld, entity: number) {

    }

    onEntityLeave(world: ECSWorld, entity: number) {

    }

    onUpdate(world:ECSWorld, dt:number) {
        world.getFilter(FILTER_COCOS_NODE).walk((entity: number) => {
            let comNodeConfig = world.getComponent(entity, ComNodeConfig);
            let comView = world.addComponent(entity, ComCocosNode);

            let comRoleConfig = world.getComponent(entity, ComRoleConfig);
            this._loadView(world, entity, comNodeConfig).then((node: cc.Node) => {
                console.log('load view success',comNodeConfig.prefabUrl);
            });
            return false;
        });

        world.getFilter(FILTER_NODE_EVENT).walk((entity: number) => {
            let comCocosNode = world.getComponent(entity, ComCocosNode);
            if(!comCocosNode.loaded) return ;
            let eventProcess = comCocosNode.node.getComponent(EventProcess);
            if(!eventProcess) return ;

            let comTrans = world.getComponent(entity, ComTransform);
            eventProcess.sync(comTrans.x, comTrans.y, comTrans.dir);
            while(comCocosNode.events.length) {
                let event = comCocosNode.events.shift();
                eventProcess.processEvent(event);
            }
            
            return true;
        });
        let layer = cc.find('Canvas/Layers/0');
        let count1 = 0, count2 = 0;
        for(const node of layer.children) {
            node.zIndex =  node.y * -1;
            if(node.name == 'Biker') count1++;
            if(node.name == 'Cyborg') count2++;
        }
        cc.find('Canvas/a_role_count').getComponent(cc.Label).string = '' + count1;
        cc.find('Canvas/b_role_count').getComponent(cc.Label).string = '' + count2;
    }


    private async _loadView(world: ECSWorld, entity: number, nodeConfig: ComNodeConfig) {
        let prefab = await CocosHelper.loadResSync<cc.Prefab>(nodeConfig.prefabUrl, cc.Prefab);
        if(!prefab) {
            cc.warn(`加载失败: ${nodeConfig.prefabUrl}`);
            return;
        }
        let comView = world.getComponent(entity, ComCocosNode);
        if(comView.node) {    // 销毁当前node
            this.destoryView(comView.node);
        }
        let layers = cc.find('Canvas/Layers');
        if(!layers) return ;

        let node = cc.instantiate(prefab);
        node.parent = layers.getChildByName(`${nodeConfig.layer}`);
        comView.node = node;
        comView.loaded = true;
        return node;
    }

    private destoryView(node: cc.Node) {
        node.removeFromParent();
        node.destroy();
    }
}