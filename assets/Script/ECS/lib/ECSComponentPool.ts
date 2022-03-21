import { ComPoolIndex } from "./Const";
import { ECSTypedComConstructor } from "./ECSComponent";

/**
 * 组件池
 */
export class ECSComponentPool<T> {
    private _componentConstructor: ECSTypedComConstructor<T>;
    public constructor(comCons: ECSTypedComConstructor<T>) {
        this._componentConstructor = comCons;
    }

    private _components: T[] = [];                              // components
    private _reservedIdxs: ComPoolIndex[] = [];                 // 缓存的component idx
    
    
    public get(idx: ComPoolIndex): T {
        return this._components[idx];
    }

    public alloc(): ComPoolIndex {
        if(this._reservedIdxs.length > 0) {
            let ret = this._reservedIdxs.pop();
            this._componentConstructor.apply(this._components[ret]);         // 重置对象
            return ret;
        }
        let newInstance = new this._componentConstructor();
        this._components.push(newInstance);
        return this._components.length - 1;
    }

    public free(idx: ComPoolIndex) {
        this._reservedIdxs.push(idx);
    }
}