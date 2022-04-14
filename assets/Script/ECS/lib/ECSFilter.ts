import { ComType, EntityIndex } from "./Const";
import { ECSWorld } from "./ECSWorld";

export class ECSFilter {
    private _world: ECSWorld = null;

    private _entitiesMap = new Map<EntityIndex, boolean>();

    private _acceptComTypes: ComType[] = [];        // 接收的组件类型
    private _rejectComTypes: ComType[] = [];        // 拒绝的组件类型

    public constructor(world: ECSWorld, accepts?: ComType[], rejects?: ComType[]) {
        this._world = world;
        this._acceptComTypes = accepts && accepts.length > 0 ? accepts : this._acceptComTypes;
        this._rejectComTypes = rejects && rejects.length > 0 ? rejects : this._rejectComTypes;
    }

    public get entities() {
        return this._entitiesMap;
    }

    public onEntityEnter(entity: EntityIndex) {
        if(this._entitiesMap.has(entity)) {
            console.warn(`[ECSFilter]: addEntity entity is had ${entity}`);
            return true;
        }
        this._entitiesMap.set(entity, true);
        return true;
    }

    public onEntityLeave(entity: EntityIndex) {
        if(!this._entitiesMap.has(entity)) {
            console.warn(`[ECSFilter]: removeEntity entity not had ${entity}`);
            return true;
        }
        this._entitiesMap.delete(entity);
    }

    public walk(callback?: (entity: number) => boolean) {
        this._entitiesMap.forEach((value, entity) => {
            callback(entity);
        });
    }

    public isAccept(entityIndex: EntityIndex) {
        for(let i = 0; i < this._acceptComTypes.length; i++) {
            if(this._world.getComponentPoolIdx(entityIndex, this._acceptComTypes[i]) == -1) {
                return false;
            }
        }
        for(let i = 0; i < this._rejectComTypes.length; i++) {
            if(this._world.getComponentPoolIdx(entityIndex, this._rejectComTypes[i]) != -1) {
                return false;
            }
        }
        return true;
    }

    public isContains(entity: number) {
        return this._entitiesMap.has(entity);
    }

    


}