import { ECSWorld } from "./ECSWorld";

export abstract class ECSSystem {
    /** 连接 */
    public abstract onAdd(world: ECSWorld): void;
    /** 断开连接 */
    public abstract onRemove(world: ECSWorld): void;
    /** 添加实体 */
    public abstract onEntityEnter(world: ECSWorld, entity: number): void;
    /**  */
    public abstract onEntityLeave(world: ECSWorld, entity: number): void;
    /** 更新 */
    public abstract onUpdate(world: ECSWorld, dt: number): void;
}