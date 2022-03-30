import { ECSController } from "./Core/ECSController";
import { ECSWorld } from "./ECS/lib/ECSWorld";
import { SysAttack } from "./ECS/systems/SysAttack";
import { SysBehaviorTree } from "./ECS/systems/SysBehaviorTree";
import { ITouchProcessor, SysCocosView } from "./ECS/systems/SysCocosView";
import { SysMonitor } from "./ECS/systems/SysMonitor";
import { SysMovable } from "./ECS/systems/SysMovable";
import { SysRoleState } from "./ECS/systems/SysRoleState";
import { WorldCocosView } from "./ECS/worlds/WorldCocosView";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Main extends cc.Component {
    private _world: ECSWorld = null;
    private _touchHandler: ITouchProcessor[] = [];

    private ecsController = new ECSController();
    start () {
        this.ecsController.world = this._world = new WorldCocosView();
        this._world.createEntity();         // 创建0号实体
        this._world.addSystem(new SysBehaviorTree());   // 行为树
        this._world.addSystem(new SysMovable());        // 移动
        this._world.addSystem(new SysMonitor());        // 监视
        this._world.addSystem(new SysAttack());         // 攻击系统
        this._world.addSystem(new SysRoleState());      // role state
        this._world.addSystem(new SysCocosView());      // cocos view

        this.regiestTouchEvent();

        //this.regiestTouchHandler();

    }

    onClick1() {
        this.ecsController.createRoleEntity("Biker");
    }

    onClick2() {
        this.ecsController.createRoleEntity("Cyborg");
    }

    onClick3() {
        cc.debug.setDisplayStats(!cc.debug.isDisplayStats());
    }

    protected update(dt: number): void {
        if(this._world) this._world.update(dt);
    }

    private regiestTouchEvent() {
        this.node.on(cc.Node.EventType.TOUCH_START, this._onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this._onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this._onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this._onTouchCancel, this);
    }

    private _onTouchStart(e: cc.Event.EventTouch) {
        for(let i = 0; i < this._touchHandler.length; i++) {
            this._touchHandler[i].onTouchStart(e.getLocation(), this._world);   
        }
    }
    private _onTouchMove(e: cc.Event.EventTouch) {
        for(let i = 0; i < this._touchHandler.length; i++) {
            this._touchHandler[i].onTouchMove(e.getLocation(), this._world);   
        }
    }
    private _onTouchEnd(e: cc.Event.EventTouch) {
        for(let i = 0; i < this._touchHandler.length; i++) {
            this._touchHandler[i].onTouchEnd(e.getLocation(), this._world);   
        }
    }
    private _onTouchCancel(e: cc.Event.EventTouch) {
        for(let i = 0; i < this._touchHandler.length; i++) {
            this._touchHandler[i].onTouchCancel(e.getLocation(), this._world);   
        }
    }

    public regiestTouchHandler(handler: ITouchProcessor) {
        this._touchHandler.push(handler);
    }

    public unRegiestTouchHandler(handler:ITouchProcessor) {
        for(let i = this._touchHandler.length - 1; i >= 0; i--) {
            if(this._touchHandler[i] == handler) {
                this._touchHandler.splice(i, 1);
            }
        }
    }


    
}
