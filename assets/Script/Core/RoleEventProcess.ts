import CocosHelper from "../Common/CocosHelper";
import { EventBase, EventDeath, EventGraphicsDraw, EventHPChange, EventType } from "../Struct/NodeEvent";
import { EventProcess } from "./EventProcess";

const {ccclass, property} = cc._decorator;

@ccclass
export default class RoleEventProcess extends EventProcess {

    @property(cc.Animation) anim: cc.Animation = null;

    private graphics: cc.Graphics = null;
    start () {
        this.graphics = this.getComponent(cc.Graphics);
    }

    onAttach(): void {

    }

    onDetach(): void {

    }

    processEvent(event: EventBase): void {
        let _reset = (name: string) => {
            this.anim.on(cc.Animation.EventType.FINISHED, () => {
                this.anim.play(name);
            }, this);
        }
        switch(event.type) {
            case EventType.Stand:
                this.anim.play('stand');
            break;
            case EventType.Run:
                this.anim.play('run');
            break;
            case EventType.Attack:
                if(Math.random() > 0.5) {
                    this.anim.play('punch');
                }else {
                    this.anim.play('attack');
                }
                
                _reset('stand');
            break;
            case EventType.Hurt:
                this.anim.play('hurt');
                _reset('stand');
            break;
            case EventType.Death:
                this.anim.play('death');
                this.anim.on(cc.Animation.EventType.FINISHED, () => {
                    (event as EventDeath).callback();
                }, this);
            break;
            case EventType.HPChange:
                this._changeHP(event as EventHPChange);
            break;

            case EventType.GraphicsDraw:
                this._graphicsDraw(event as EventGraphicsDraw);
            break;


        }
    }

    private _changeHP(event: EventHPChange) {
        let progressBar = this.node.getChildByName("HP").getComponent(cc.ProgressBar);
        let from = event.lastHP / event.maxHP;
        let to = event.nowHP / event.maxHP;
        CocosHelper.tweenFloat(from, to, 0.2, (v) => {
            progressBar.progress = v;
        });
    }

    private _graphicsDraw(event: EventGraphicsDraw) {
        if(event.points.length <= 0) {
            this.graphics.clear();
            return ;
        }
        
        for(const p of event.points) {
            p.subSelf(this.node.getPosition());
        }

        this.graphics.strokeColor = event.color;
        this.graphics.moveTo(event.points[0].x, event.points[0].y);
        for(let i=1; i<event.points.length; i++) {
            this.graphics.lineTo(event.points[i].x, event.points[i].y);
        }
        this.graphics.lineTo(event.points[0].x, event.points[0].y);
        this.graphics.stroke();
        
        
    }

    public sync(x: number, y: number, dir: cc.Vec2) {
        this.node.x = x;
        this.node.y = y;
        this.node.getChildByName('sp').scaleX = dir.x >= 0 ? 3 : -3;
        //this.node.getChildByName('HP').x = dir.x >= 0 ? -30 : 30;
    }

    // update (dt) {}
}
