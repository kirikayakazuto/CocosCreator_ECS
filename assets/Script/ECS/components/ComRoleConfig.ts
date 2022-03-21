import { ComType } from "../lib/Const";
import { ECSComponent } from "../lib/ECSComponent";


@ECSComponent(ComType.ComRoleConfig)
export class ComRoleConfig {
    public team: number;
    public maxHP: number;
    public lastHP: number;
    public nowHP: number;
    public HPDirty: boolean;

    public attack: number;
    
    public moveSpeed: number;
}