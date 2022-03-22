export enum EventType {
    Stand,          
    Run,
    Attack,
    Hurt,
    HPChange,
    Death,
    GraphicsDraw,
}

export class EventBase {
    type: EventType;
    constructor(type:number) {
        this.type = type;
    }
}

export class EventStand extends EventBase {
    constructor() {
        super(EventType.Stand);
    }
}

export class EventRun extends EventBase {
    constructor() {
        super(EventType.Run);
    }
}

export class EventAttack extends EventBase {
    constructor() {
        super(EventType.Attack);
    }
}

export class EventHurt extends EventBase {
    constructor() {
        super(EventType.Hurt);
    }
}

export class EventDeath extends EventBase {
    callback: Function;
    constructor(cb: Function) {
        super(EventType.Death);
        this.callback = cb;
    }
}

export class EventHPChange extends EventBase {
    public lastHP: number;
    public nowHP: number;
    public maxHP: number;
    constructor(maxHP: number, lastHP: number, nowHP: number) {
        super(EventType.HPChange);
        this.maxHP = maxHP;
        this.lastHP = lastHP;
        this.nowHP = nowHP;
    }
}

export class EventGraphicsDraw extends EventBase {
    public points: cc.Vec2[];
    public color: cc.Color;
    constructor(points: cc.Vec2[], color?: cc.Color) {
        super(EventType.GraphicsDraw)
        this.points = points;
        this.color = color;
    }
}