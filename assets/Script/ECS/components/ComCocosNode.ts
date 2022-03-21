import { EventBase } from "../../Struct/NodeEvent";
import { ComType } from "../lib/Const";
import { ECSComponent } from "../lib/ECSComponent";

@ECSComponent(ComType.ComCocosNode)
export class ComCocosNode {
    public node: cc.Node = null;
    public loaded = false;
    public events: EventBase[] = [];
}