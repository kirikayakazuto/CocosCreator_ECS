import { BT } from "../../Common/BehaviorTree";
import { ComType } from "../lib/Const";
import { ECSComponent } from "../lib/ECSComponent";

@ECSComponent(ComType.ComBehaviorTree)
export class ComBehaviorTree {
    public root: BT.NodeBase = null;
    public bb: BT.BlackBoard = new BT.BlackBoard();
}