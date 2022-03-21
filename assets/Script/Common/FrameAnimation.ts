const {ccclass, property} = cc._decorator;

@ccclass('FrameConfig')
class FrameConfig {
    @property(cc.Integer) frames: number = 0;       // 
    @property(cc.Integer) frameInterval = 1;        // 帧数

    offsetFrame = 0;                                // 偏移量
}

@ccclass
export default class FrameAnimation extends cc.Component {

    @property(cc.Sprite) sprite: cc.Sprite = null;
    @property(cc.SpriteAtlas) spriteAtlas: cc.SpriteAtlas = null;
    @property(FrameConfig) frameConfigs: FrameConfig[] = [];

    @property(cc.Boolean) playOnLoad = false;
    @property(cc.Boolean) loop = false;
    @property(cc.Integer) defaultConfig = 0;
    
    private _passInterval = 0;
    private _currFrame = 0;
    private _currFrameConfig: FrameConfig = null;
    private _playing = false;
    private _loop = false;
    private _callback: Function;

    start () {
        if(!this.sprite) this.sprite = this.getComponent(cc.Sprite);

        let offset = 0;
        for(const config of this.frameConfigs) {
            config.offsetFrame += offset;
            offset += config.frames;
        }

        this._loop = this.loop;

        if(this.playOnLoad) {
            this._currFrameConfig = this.frameConfigs[this.defaultConfig];
            this._playing = true;
        }
    }


    play(configIdx: number, loop: boolean, callback?: Function) {
        this._currFrameConfig = this.frameConfigs[configIdx];
        this._loop = loop;
        this._currFrame = 0;
        this._playing = true;
        this._callback = callback;
    }

    stop() {
        this._playing = false;
    }

    update (dt: number) {
        if(!this._playing) return ;

        this._passInterval ++;
        if(this._passInterval < this._currFrameConfig.frameInterval) return ;
        this._passInterval = 0;
        
        this.sprite.spriteFrame = this.spriteAtlas.getSpriteFrames()[this._currFrameConfig.offsetFrame + this._currFrame];
        this._currFrame ++;

        if(this._currFrame < this._currFrameConfig.frames) return ;

        if(this._loop) this._currFrame = 0;
        else {
            this._playing = false;
            this._callback && this._callback();
        }
    }
}
