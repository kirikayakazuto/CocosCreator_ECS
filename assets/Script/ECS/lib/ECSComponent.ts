import { ComType, EntityIndex } from "./Const";

/** 构造函数 */
export interface ECSComConstructor extends Function {
    new(): any;
}

export interface ECSTypedComConstructor<T> extends ECSComConstructor {
    new():T;
}

/** 通过type存取 构造函数 */
const ComConsMap: {[key: number]: ECSComConstructor} = cc.js.createMap();
function RegistComConstructor(comType: ComType, func: ECSComConstructor) {
    ComConsMap[comType] = func;
}
export function GetComConstructor(comType: ComType) {
    return ComConsMap[comType];
}

/** 通过构造函数存取 type */
function SetComConstructorType(comCons: ECSComConstructor, type: ComType) {
    comCons['__type__'] = type;
}
export function GetComConstructorType<T>(comCons: {prototype: T}): ComType {
    return comCons['__type__'];
}

/** ECSComponent */
export function ECSComponent(type: ComType) {
    return function(func: ECSComConstructor) {
        SetComConstructorType(func, type);
        RegistComConstructor(type, func);
    };
}

