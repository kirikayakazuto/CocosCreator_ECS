import { ComCocosNode as ComCocosNode } from "../components/ComCocosNode";
import { ComMovable } from "../components/ComMovable";
import { ComTransform } from "../components/ComTransform";
import { ECSSystem } from "../lib/ECSSystem";
import { ECSWorld, GenFillterKey as GenFilterKey } from "../lib/ECSWorld";

const FILTER_MOVE = GenFilterKey([ComMovable, ComTransform, ComCocosNode]);
export class SysMovable extends ECSSystem {
    /** 连接 */
    public onAdd(world: ECSWorld): void{

    }
    /** 断开连接 */
    public onRemove(world: ECSWorld): void {

    }
    /** 添加实体 */
    public onEntityEnter(world: ECSWorld, entity: number): void {

    }

    /**  */
    public onEntityLeave(world: ECSWorld, entity:number): void {

    }

    /** 更新 */
    public onUpdate(world: ECSWorld, dt:number): void {
        world.getFilter(FILTER_MOVE).walk((entity: number) => {
            let comMovable = world.getComponent(entity, ComMovable);
            let comTrans = world.getComponent(entity, ComTransform);

            if(comMovable.speed <= 0 || comMovable.pointIdx >= comMovable.points.length) {
                return ;
            }

            if(!comMovable.running) {
                comMovable.running = true;
            }

            let moveLen = comMovable.speed * dt;
            while(moveLen > 0 && comMovable.pointIdx < comMovable.points.length) {
                let nextPoint = comMovable.points[comMovable.pointIdx];
                let offsetX = nextPoint.x - comTrans.x;
                let offsetY = nextPoint.y - comTrans.y;
                let offsetLen = Math.sqrt(offsetX * offsetX + offsetY * offsetY);
                if(offsetLen <= moveLen) {
                    moveLen -= offsetLen;
                    comTrans.x = nextPoint.x;
                    comTrans.y = nextPoint.y;
                    comMovable.pointIdx ++;
                    continue;
                }
                if(!comMovable.keepDir) {
                    comTrans.dir.x = offsetX / offsetLen || comTrans.dir.x;
                    comTrans.dir.y = offsetY / offsetLen;
                }
                comTrans.x += moveLen * offsetX / offsetLen;
                comTrans.y += moveLen * offsetY / offsetLen;
                
                moveLen = -1;
            }

            if(comMovable.pointIdx >= comMovable.points.length) {
                comMovable.speed = 0;
                comMovable.speedDirty = true;
            }

            return false;
        });
    }
}