import { Entity } from "./ECSEntity"
import { ECSFillter } from "./ECSFillter"
import { ECSComConstructor, GetComConstructor as GetComConstructor, GetComConstructorType } from "./ECSComponent";
import { ECSSystem } from "./ECSSystem";
import { ComPoolIndex, ComType, EntityIndex } from "./Const";
import { ECSComponentPool } from "./ECSComponentPool";

/**
 * 
 */
export class ECSWorld {
    private _systems: ECSSystem[] = [];                 // world内所有的system
    private _entities: Entity[] = [];                   // world内所有的entity
    private _reservedIds: number[] = [];                // 缓存

    private _componentPools: ECSComponentPool<any>[] = [];
    private _fillters = new Map<string, ECSFillter>();

    private _entitiesToDelete: number[] = [];
    private _entityIdSeed: number = 0;

    /** 获取ComponentPool */
    public getComponentPool<T>(typeOrFunc: ComType | {prototype: T}): ECSComponentPool<T> {
        let type = typeof typeOrFunc == "number" ? typeOrFunc : GetComConstructorType(typeOrFunc);
        if(!this._componentPools[type]) {
            this._componentPools[type] = new ECSComponentPool<T>(GetComConstructor(type));
        }
        return this._componentPools[type] as any;
    }

    /** 添加system */
    public addSystem(system: ECSSystem) {
        this._systems.push(system);
        system.onAdd(this);
        for(let i = 0; i < this._entities.length; i++) {
            if(this._entities[i].id !== -1) {
                system.onEntityEnter(this, i);
            }
        }
    }

    /** 移除system */
    public removeSystem(system: ECSSystem) {
        system.onRemove(this);
        for(let i = 0; i < this._entities.length; i++) {
            if(this._entities[i].id !== -1) {
                system.onEntityLeave(this, i);
            }
        }
        for(let i = this._systems.length - 1; i >= 0; i--) {
            if(this._systems[i] == system) {
                this._systems.splice(i, 1);
            }
        }
    }

    /** 创建实体 */
    public createEntity(): number {
        let entity: Entity = null;
        let index = -1;
        if(this._reservedIds.length > 0) {
            index = this._reservedIds.pop();
            entity = this._entities[index];
        }else {
            entity = new Entity();
            index = this._entities.length;
            this._entities.push(entity);
        }
        entity.id = this._entityIdSeed++;
        entity.world = this;
        entity.index = index;
        entity.dead = false;
        for(let system of this._systems) {
            system.onEntityEnter(this, entity.index);
        }
        return entity.index;
    }

    /** 移除实体 */
    public removeEntity(entity: EntityIndex): boolean {
        if(entity <= 0) return false;
        if(!this._entities[entity] || this._entities[entity].dead) {
            console.warn(`[ECSWorld] removeEntity entity is removed`);
            return false;
        }
        this._entities[entity].dead = true;
        this._entitiesToDelete.push(entity);

        this._fillters.forEach((fillter, key) => {
            fillter.isContains(entity) && fillter.onEntityLeave(entity);
        });
        for(let system of this._systems) {
            system.onEntityLeave(this, entity);
        }
        return true;
    }

    public getComponent<T>(entity: EntityIndex, com: {prototype: T}) {
        if(!this._entities[entity]) return null;
        let comPoolIdx = this._entities[entity].getComponent(com);
        return this.getComponentPool<T>(com).get(comPoolIdx);
    }

    public removeComponent(entity: EntityIndex, com: ECSComConstructor) {
        if(!this._entities[entity]) return ;
        this._entities[entity].removeComponent(com);
    }

    public addComponent<T>(entity: EntityIndex, com: {prototype: T}) {
        if(!this._entities[entity]) return null;
        let comPoolIdx = this._entities[entity].addComponent(com);
        return this.getComponentPool<T>(com).get(comPoolIdx)
    }

    public getSingletonComponent<T>(com: {prototype: T}): T {
        let entity = this._entities[0];
        let comPoolIdx = entity.getComponent(<ECSComConstructor>com);
        let pool = this.getComponentPool<T>(com);
        if(comPoolIdx >= 0) return pool.get(comPoolIdx);
        return pool.get(entity.addComponent(com));
    }

    public setEntityDirty(entity: Entity): void {
        this._fillters.forEach((fillter, key) => {
            let accept = !entity.dead && fillter.isAccept(entity);
            if(accept != fillter.isContains(entity.index)) {
                accept ? fillter.onEntityEnter(entity.index) : fillter.onEntityLeave(entity.index);
            }
        });
    }

    public getEntityId(entity: EntityIndex) : number {
        return this._entities[entity].id;
    }

    public getFilter(fillterKey: string): ECSFillter {
        if(this._fillters.has(fillterKey)) {
            return this._fillters.get(fillterKey);
        }
        let [acceptStr, rejectStr] = fillterKey.split("-");
        let accept = acceptStr && acceptStr.length > 0 ? acceptStr.split(',').map(Number) : null;
        let reject = rejectStr && rejectStr.length > 0 ? rejectStr.split(',').map(Number) : null;
        let fillter = new ECSFillter(this, accept, reject);
        this._fillters.set(fillterKey, fillter);
        // 将当期的entity放入fillter
        for(let i=1; i<this._entities.length; i++) {
            const entity = this._entities[i];
            if(fillter.isAccept(entity)) {
                fillter.onEntityEnter(entity.index);
            }
        }
        return fillter;
    }

    public update(dt:number) {
        for(let system of this._systems) {
            system.onUpdate(this, dt);
        }
        if(this._entitiesToDelete.length > 0) {
            this._realRemoveEntity();
        }
    }

    private _realRemoveEntity() {
        for(let entityIdx of this._entitiesToDelete) {
            this._entities[entityIdx].removeAllComponents(false);
            this._entities[entityIdx].id = -1;
            this._reservedIds.push(entityIdx);
        }
        this._entitiesToDelete.length = 0;
    }

}

export function GenFillterKey(accepts: ECSComConstructor[], rejects?: ECSComConstructor[]) {
    let acceptTypes: ComType[] = [];
    let rejectTypes: ComType[] = [];

    if(accepts && accepts.length > 0) {
        for(let i = 0; i < accepts.length; i++) {
            acceptTypes[i] = GetComConstructorType(accepts[i]);
        }
    }
    if(rejects && rejects.length > 0) {
        for(let i = 0; i < rejects.length; i++) {
            rejectTypes[i] = GetComConstructorType(rejects[i]);
        }
    }

    if(acceptTypes.length < 0) {
        console.error(`[ECSWorld]: GenFillterKey 必须要有accpters`);
        return "";
    }

    acceptTypes.sort();
    rejectTypes.sort();

    let key = Array.prototype.join.call(acceptTypes, ",");
    if(!rejectTypes || rejectTypes.length <= 0) return key;
    key += '-';
    key += Array.prototype.join.call(rejectTypes, ",");
    return key;
}
