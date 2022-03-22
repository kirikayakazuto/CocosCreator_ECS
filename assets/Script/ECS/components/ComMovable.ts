import { ComType } from "../lib/Const";
import { ECSComponent } from "../lib/ECSComponent";

@ECSComponent(ComType.ComMovable)
export class ComMovable {
    public running = false;
    public speed = 0;
    public points: cc.Vec2[] = [];
    public pointIdx = 0;

    public keepDir = false;

    public speedDirty = false;
}