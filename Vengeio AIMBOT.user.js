// ==UserScript==
// @name         Venge.io AIMBOT
// @version      7.2
// @description  Venge AIMBOT
// @author       wernser412
// @match        *://venge.io/*
// @grant        none
// @namespace    wernser412
// @require      https://cdn.jsdelivr.net/npm/tweakpane@1.5.4/dist/tweakpane.min.js
// ==/UserScript==

window.settings = {
    infAmmo: false,
    infJump: false,
    ESP: true,
    traces: false,
    noRecoil: false,
    noSpread: false,
    rapidFire: false,
    noCameraShake: false,
    changeWeapon: false,
    noCooldown: true,
    FOV: 60,
    speedHack: 0,
    antiEffects: false,
    getPoints: false,
    autoJump: false,
    //killAll: false,
};

window.aimbot = {
    enabled: false,
    target: null,
    type: 0,
    fire: false,
    focus: false,
    offset: 0,
};

var settings = window.settings;
var aimbot = window.aimbot;

// Code

HTMLDivElement.prototype.appendChild = new Proxy(HTMLDivElement.prototype.appendChild,{
    apply(t,tt,a) {
        if (a[0].id == 'description' && a[0].innerText.includes('Tip')) a[0].innerText = 'Mod By Blockman_#0431\n' + a[0].innerText;
        return t.apply(tt,a);
    }
});

for (let i in settings) {
    if (i!='killAll'&&window.localStorage.getItem('ms_'+i)) settings[i] = (window.localStorage.getItem('ms_'+i) == 'true' ? true : window.localStorage.getItem('ms_'+i) == 'false' ? false : Number(window.localStorage.getItem('ms_'+i)));
};

for (let i in aimbot) {
    if (i!='target'&&window.localStorage.getItem('msa_'+i)) aimbot[i] = (window.localStorage.getItem('msa_'+i) == 'true' ? true : window.localStorage.getItem('msa_'+i) == 'false' ? false : Number(window.localStorage.getItem('msa_'+i)));
};
hooks = {
    network: null,
};

var _nn = {_:''};
var Dev = {eval: '',customPing:false,ping:60};

const pane = new Tweakpane({title:'. MOD MENU'});
pane.addButton({title: 'Panic Mode'}).on('click', () => {
    for (let i in settings) settings[i] = typeof settings[i] == 'number' ? i == 'FOV' ? 60 : 0 : false;
    aimbot.enabled = false;
});
const ab = pane.addFolder({title:'. AIMBOT'});
ab.addInput(aimbot,'enabled',{title:'Aimbot'});
ab.addInput(aimbot,'type',{label:'Type',options:{'Always':0,'Fire':1,'Focus':2}});
ab.addInput(aimbot,'fire',{label:'Fire'});
ab.addInput(aimbot,'focus',{label:'Focus'});
ab.addInput(aimbot,'offset',{label:'Offset',min:0,max:10,step:1});
const plr = pane.addFolder({title: '. PLAYER'});
//plr.addInput(settings, 'killAll',{label:'Kill All'});
plr.addInput(settings,'speedHack',{label:'Speed Hack',min:0,max:5,step:1});
plr.addInput(settings, 'infJump',{label:'Inf Jump'});
plr.addInput(settings, 'autoJump',{label:'Auto Jump'});
plr.addInput(settings, 'getPoints',{label:'Get Points'});
plr.addInput(settings, 'noCooldown',{label:'No Cooldown'});
//plr.addInput(settings, 'infCards' ,{label:'Inf Cards'});
const misc = pane.addFolder({title: '. MISC'});
misc.addInput(settings, 'ESP');
misc.addInput(settings, 'traces',{label:'Traces'});
misc.addInput(settings, 'FOV',{min: 1,max: 800,step: 1});
misc.addInput(_nn,'_',{label:'Everyones Nickname'});
const wp = pane.addFolder({title: '. WEAPON'});
wp.addInput(settings, 'infAmmo',{label:'Inf Ammo'});
wp.addInput(settings, 'noRecoil',{label:'No Recoil'});
wp.addInput(settings, 'noSpread',{label:'No Spread'});
wp.addInput(settings, 'noCameraShake',{label:'No Cam Shake'});
wp.addInput(settings, 'rapidFire',{label:'Rapid Fire'});
wp.addInput(settings, 'changeWeapon',{label:'Can Change Weapon'});
const dev = pane.addFolder({expanded: false,title: '. DEV [DANGER]'});
dev.addInput(Dev,'eval');
const Eval = dev.addButton({title: 'Eval',});
Eval.on('click', () => {eval(Dev.eval)});
dev.addInput(Dev,'customPing');
dev.addInput(Dev,'ping');

function onTick(network) {
    hooks.network = network;
};

window.camLookAt = function(entity) {
    if (entity) {
        t = pc.controls.player.movement.entity.getPosition(),
            e = Utils.lookAt(entity.position.x, entity.position.z, t.x, t.z);
        pc.controls.player.movement.lookX = e * 57.29577951308232 + Math.random()/10 - Math.random()/10;
        pc.controls.player.movement.lookY = -1 * (getXDire(entity.position.x, entity.position.y, entity.position.z, t.x, t.y+0.9, t.z)) * 57.29577951308232;
    };
};

var camLookAt = window.camLookAt;

var getD3D = function(a, b, c, d, e, f) {
    let g = a - d, h = b - e, i = c - f;
    return Math.sqrt(g * g + h * h + i * i);
};
var getXDire = function(a, b, c, d, e, f) {
    let g = Math.abs(b - e), h = getD3D(a, b, c, d, e, f);
    return Math.asin(g / h) * (b > e ? -1 : 1);
};

const tick = () => {
    try {
        if (pc&&pc.controls&&Movement&&NetworkManager&&VengeGuard&&Label&&Player&&Chat&&SpellManager&&RoomManager&&Enemy&&Overlay) {// Wait for Loading...
            for (let i in settings) {
                window.localStorage.setItem('ms_'+i,settings[i]);
            }

            for (let i in aimbot) {
                i!='target'&&(window.localStorage.setItem('msa_'+i,aimbot[i]))
            }
            VengeGuard.prototype.onCheck=_=>pc.app.fire("Network:Guard",!0);
            // Aimbot & Traces
            if (settings.traces && hooks.network) {
                hooks.network.players.forEach(t => {
                    if (-1 !== t.script.enemy.playerId && !t.script.enemy.isDeath) {
                        let e = pc.controls.player.entity.getPosition();
                        let o = t.getPosition();
                        let c = t.script.enemy.team == hooks.network.team && "none" !== t.script.enemy.team ? new pc.Color(0, 1, 0) : new pc.Color(1, 0, 0);
                        pc.Application.getApplication().renderLine(new pc.Vec3(e.x, e.y, e.z), new pc.Vec3(o.x, o.y, o.z),c);
                    }
                })
            }
            if (hooks.network) {
                var ld = Infinity;
                hooks.network.players.forEach(t => {
                    if ((t.script.enemy.team != hooks.network.team || "none" == hooks.network.team) && "Death" != t.script.enemy.currentAnimation && "none" != t.script.enemy.currentAnimation) {
                        let e = pc.controls.player.movement.entity.getPosition();
                        let o = Math.sqrt(Math.pow(t.position.y - e.y, 2) + Math.pow(t.position.x - e.x, 2) + Math.pow(t.position.z - e.z, 2));
                        if (o < ld){
                            ld = o;
                            aimbot.target = t;
                        }
                    }
                })
                if (aimbot.enabled && aimbot.target) {
                    let t = pc.app.systems.rigidbody.raycastAll(pc.controls.player.movement.entity.getPosition(), aimbot.target.getPosition()).map(t => t.entity.tags._list.toString());
                    if ((1 === t.length && "Player" === t[0]) && (0 == aimbot.type || (2 == aimbot.type && pc.controls.player.movement.isFocusing) || (1 == aimbot.type && pc.controls.player.movement.leftMouse)) && aimbot.target) {
                        aimbot.target.position.y = (aimbot.target.position.y - 2) + (aimbot.offset / 3);
                        camLookAt(aimbot.target);
                        aimbot.focus && (pc.controls.player.movement.isFocusing = !0);
                        aimbot.fire && (pc.controls.player.movement.leftMouse = !0);
                    } else {
                        aimbot.focus && (pc.controls.player.movement.isFocusing = !1);
                        aimbot.fire && (pc.controls.player.movement.leftMouse = !1);
                    }
                }
            }// End

            /*if (settings.killAll) {
                hooks.network.send(["da", aimbot.target.script.enemy.playerId, 99, true, aimbot.target.position.x, aimbot.target.position.y, aimbot.target.position.z]);pc.controls.player.movement.leftMouse=!0;
            }*/

            const sendMsg = (a,b) => pc.app.fire("Chat:Message", a, b, !0);
            const tp = (x,y,z) => pc.controls.player.movement.entity.rigidbody.teleport(x,y,z);

            Chat.prototype.sendMessage = function() {
                if (!this.inputEntity.enabled)
                    return !1;
                var args = this.inputEntity.script.input.getValue().split(" ");
                if (args[0] == '/tp' && args[1]) {
                    if (!args[2] && hooks.network && hooks.network.players.find(_=>_.script.enemy.username.toLowerCase()==args[1].toLowerCase())) {
                        let e = hooks.network.players.find(_=>_.script.enemy.username.toLowerCase()==args[1].toLowerCase()).getPosition()
                        tp(e.x,e.y,e.z);
                        sendMsg('Teleport','Teleported to '+args[1]);
                    } else if (!args[2] && args[1] == '@p' && aimbot.target) {
                        tp(aimbot.target.position.x,aimbot.target.position.y,aimbot.target.position.z);
                        sendMsg('Teleport','Teleported to nearest player (aimTarget)');
                    } else if (!args[2] && args[1] == '@r' && hooks.network) {
                        let e = hooks.network.players[Math.floor(Math.random()*hooks.network.players.length)].getPosition()
                        tp(e.x,e.y,e.z);
                        sendMsg('Teleport','Teleported to random player');
                    } else if (args[1] && args[2] && args[3]) {
                        args[1][0]=='~' && (args[1]=pc.controls.player.movement.entity.position.x+Number(args[1].slice(1)));
                        args[2][0]=='~' && (args[2]=pc.controls.player.movement.entity.position.y+Number(args[2].slice(1)));
                        args[3][0]=='~' && (args[3]=pc.controls.player.movement.entity.position.z+Number(args[3].slice(1)));
                        tp(args[1],args[2],args[3]);
                    }
                }
                this.blur();
                if (!this.inputEntity.script.input.getValue().startsWith("/")) {
                    this.app.fire("Network:Chat", this.inputEntity.script.input.getValue());
                    this.inputEntity.script.input.setValue("");
                    this.lastMessageDate = Date.now();
                }
            }

            Movement.prototype.setMovement=function(){if(this.player.isDeath)return!1;if(pc.isFinished)return!1;if(this.isDashing)return!1;var i=this.angleEntity.forward,t=this.angleEntity.right,s=1;this.isFocusing&&(s=this.focusSpeedFactor),s*=this.animation.movementFactor,s*=settings.speedHack+1,this.force.x=0,this.force.z=0,!this.isForward||this.isLeft||this.isRight?this.isForward&&(this.force.x+=i.x*this.strafingSpeed*s,this.force.z+=i.z*this.strafingSpeed*s):(this.force.x+=i.x*this.defaultSpeed*s,this.force.z+=i.z*this.defaultSpeed*s),this.isBackward&&(this.force.x-=i.x*this.strafingSpeed*s,this.force.z-=i.z*this.strafingSpeed*s),this.isLeft&&(this.force.x-=t.x*this.strafingSpeed*s,this.force.z-=t.z*this.strafingSpeed*s),this.isRight&&(this.force.x+=t.x*this.strafingSpeed*s,this.force.z+=t.z*this.strafingSpeed*s),this.entity.rigidbody.applyForce(this.currentForce)};
            settings.infCards && (pc.controls.player.canBuy=!0);
            pc.controls.player.movement.defaultFov = settings.FOV;
            settings.autoJump&&pc.controls.player.movement.isLanded&&pc.controls.player.movement.jump();
            settings.getPoints && hooks.network && hooks.network.send(['point']);
            SpellManager.prototype.onSpellTrigger=function(e,n){if(!settings.antiEffects){if(-1<this.activeSpells.indexOf(e))return!1;"MidnightCurse"==e&&(this.applyMidnightCurse(),this.app.fire("Overlay:Announce","Midnight Curse","by "+n,!1,"MidnightCurse-Icon")),"FrostBomb"==e&&(this.applyFrostBomb(),this.app.fire("Overlay:Announce","Frost Bomb","by "+n,!1,"FrostBomb-Icon")),"MuscleShock"==e&&(this.applyMuscleShock(),this.app.fire("Overlay:Announce","Muscle Shock","by "+n,!1,"MuscleShock-Icon")),"SparkySpells"==e&&(this.applySparkySpells(),this.app.fire("Overlay:Announce","Sparky Sprites","by "+n,!1,"SparkySpells-Icon")),"Venom"==e&&(this.applyVenom(),this.app.fire("Overlay:Announce","Venom","by "+n,!1,"Venom-Icon"))}"Reduce"==e&&this.applyReduce()};
            NetworkManager.prototype.sendPing = function() {this.send([this.keys.ping, Dev.customPing ? Dev.ping||60 : this.currentPing]),this.lastPingDate = Date.now()}
Player.prototype.setWeapon = function(t) {
    if (!settings.changeWeapon) {
        if (Date.now() - this.lastWeaponChange > 8e3 || this.isDeath) {
            if (this.movement.isShooting > this.movement.timestamp && !this.isDeath)
                return !1;
            if (this.movement.isReloading > this.movement.timestamp && !this.isDeath)
                return !1;
            this.movement.disableZoom(),
                this.weaponManager.setWeapon(t),
                this.lastWeaponChange = Date.now()
        } else
            this.app.fire("Chat:Message", "Console", "Please wait 8 seconds to change weapon.")
    } else {
        this.weaponManager.setWeapon(t)
    }
}
Movement.prototype.triggerKeyF = function() {
    if (!settings.noCooldown) {
        return this.now() - this.lastThrowDate < 1e3 * this.playerAbilities.throwCooldown ? (this.entity.sound.play("Error"),
            !1) : !(this.isReloading > this.timestamp) && (!(this.playerAbilities.isHitting > this.timestamp) && (this.isFocusing = !1,
            this.player.throw(),
            this.stopFiring(),
            this.playerAbilities.triggerKeyF(),
            void(this.lastThrowDate = this.now())))
    } else {
        this.player.throw();
        this.playerAbilities.triggerKeyF();
    }
}
Movement.prototype.setKeyboard = function() {
    return !this.player.isDeath && (!pc.isFinished && (!this.locked && ("INPUT" != document.activeElement.tagName && (this.jumpingTime + this.jumpLandTime < this.timestamp && this.currentHeight < this.nearGround && (this.isForward = !1,
            this.isBackward = !1,
            this.isLeft = !1,
            this.isRight = !1),
        (this.app.keyboard.isPressed(pc.KEY_W) || this.isMobileForward) && (this.isForward = !0),
        (this.app.keyboard.isPressed(pc.KEY_S) || this.isMobileBackward) && (this.isBackward = !0),
        (this.app.keyboard.isPressed(pc.KEY_A) || this.isMobileLeft) && (this.isLeft = !0),
        (this.app.keyboard.isPressed(pc.KEY_D) || this.isMobileRight) && (this.isRight = !0),
        this.app.keyboard.isPressed(pc.KEY_SPACE) && this.jump(),
        this.app.keyboard.wasPressed(pc.KEY_R) && this.reload(),
        this.app.keyboard.isPressed(pc.KEY_F) && this.triggerKeyF(),
        this.app.keyboard.wasPressed(pc.KEY_E) && this.triggerKeyE(),
        this.app.keyboard.wasPressed(pc.KEY_X) && (this.leftMouse = !0,
            this.isMouseReleased = !0),
        this.app.keyboard.wasReleased(pc.KEY_X) && (this.leftMouse = !1),
        this.app.keyboard.wasPressed(pc.KEY_L) && (this.app.mouse.enablePointerLock(),
            this.app.fire("Overlay:Pause", !1)),
        this.app.keyboard.wasPressed(pc.KEY_M),
        this.app.keyboard.wasPressed(pc.KEY_SHIFT) && (this.isFocusing = !0),
        void(this.app.keyboard.wasReleased(pc.KEY_SHIFT) && (this.isFocusing = !1))))))
}
            //settings.noCooldown && (pc.controls.player.movement.lastThrowDate = 0,pc.controls.player.movement.lastDashDate = 0);
            NetworkManager.prototype.tick=function(e){onTick(this);var i=parseInt(e[0]),r=i;0===i&&(pc.isFinished=!0),this.app.fire("Server:Tick",i,r),this.app.fire("VengeGuard:Check",!0),this.selfTick()};
            Label.prototype.update=function(e){if(_nn['_'].length){try{this.labelEntity.findByName("Username").element.text=_nn['_']}catch(e){}};if(!this.isInitalized)return!1;if(!this.isEnabled)return this.labelEntity&&(this.labelEntity.enabled=!1),!1;if(!pc.isSpectator&&!settings.ESP){if(this.player.isDeath)return this.labelEntity.enabled=!1;if(1500<Date.now()-this.player.lastDamage){if(pc.currentTeam!=this.team||"PAYLOAD"!=pc.currentMode&&"TDM"!=pc.currentMode)return this.labelEntity.enabled=!1;this.labelEntity.enabled=!0}}this.updateTeamColor();var t=new pc.Vec3,i=this.currentCamera,a=this.app.graphicsDevice.maxPixelRatio,s=this.screenEntity.screen.scale,n=this.app.graphicsDevice;i.worldToScreen(this.headPoint.getPosition(),t),t.x*=a,t.y*=a,0<t.x&&t.x<this.app.graphicsDevice.width&&0<t.y&&t.y<this.app.graphicsDevice.height&&0<t.z?(this.labelEntity.setLocalPosition(t.x/s,(n.height-t.y)/s,0),this.labelEntity.enabled=!0):this.labelEntity.enabled=!1};
            Player.prototype.setKeyboard=function(){return!pc.isFinished&&"INPUT"!=document.activeElement.tagName&&(aimbot.target&&this.app.keyboard.isPressed(pc.KEY_H)&&(tp(aimbot.target.position.x,aimbot.target.position.y,aimbot.target.position.z)),this.isCardSelection&&(this.app.keyboard.wasPressed(pc.KEY_1)&&this.onBuyCard1(),this.app.keyboard.wasPressed(pc.KEY_2)&&this.onBuyCard2(),this.app.keyboard.wasPressed(pc.KEY_3)&&this.onBuyCard3()),this.isDeath||settings.changeWeapon?(this.isCircularMenuActive||settings.changeWeapon&&(this.app.keyboard.wasPressed(pc.KEY_1)&&this.setWeapon(this.weapons[0]),this.app.keyboard.wasPressed(pc.KEY_2)&&this.setWeapon(this.weapons[1]),this.app.keyboard.wasPressed(pc.KEY_3)&&this.setWeapon(this.weapons[2]),this.app.keyboard.wasPressed(pc.KEY_4)&&this.setWeapon(this.weapons[3])),!1):!this.movement.locked&&(this.app.keyboard.wasPressed(pc.KEY_H)&&this.emote(),this.app.keyboard.wasPressed(pc.KEY_B)&&this.buyAbility(),this.app.keyboard.wasReleased(pc.KEY_B)&&this.buyAbilityEnd(),this.app.keyboard.wasPressed(pc.KEY_TAB)&&this.app.fire("Overlay:PlayerStats",!0),void(this.app.keyboard.wasReleased(pc.KEY_TAB)&&this.app.fire("Overlay:PlayerStats",!1))))};
            Movement.prototype.jump=function(){return!!(settings.infJump||this.isLanded||this.isCollided)&&(!(!settings.infJump&&this.isDashing)&&(!(!settings.infJump&&this.bounceJumpTime>this.timestamp)&&(this.jumpingTime=this.timestamp+this.jumpDuration,this.isJumping=!0,this.isLanded=!1,this.airTime=this.now(),this.randomDirection=.5<Math.random()?-1:1,this.previousVelocity,3e3<this.now()-this.lastImpactTime&&(t="Jump-"+(Math.round(+Math.random())+1),this.app.fire("Character:Sound",t,.1*Math.random()),this.entity.sound.play("Only-Jump"),this.entity.sound.slots["Only-Jump"].pitch=.1*Math.random()+1.1),this.dynamicGravity=0,this.app.fire("Overlay:Jump",!0),this.player.fireNetworkEvent("j"),!(this.isShooting>this.timestamp)&&void this.app.tween(this.animation).to({jumpAngle:-11},.15,pc.BackOut).start())));var t};
            Movement.prototype.setShooting=function(t){if(!this.isMouseLocked)return!1;if(!this.currentWeapon.isShootable&&!settings.rapidFire)return!1;if(this.leftMouse||this.isShootingLocked||this.isFireStopped||(this.stopFiring(),0===this.currentWeapon.ammo&&this.reload()),this.leftMouse&&!this.isShootingLocked&&(settings.infAmmo||0<this.currentWeapon.ammo?this.isShooting=(settings.rapidFire?1e-7:this.currentWeapon.shootTime)+this.timestamp:this.reload()),this.player.checkShooting(),this.isShooting>this.timestamp&&!this.isShootingLocked){settings.infAmmo&&this.setAmmoFull();var i=settings.noRecoil?0:this.currentWeapon.recoil,e=settings.noCameraShake?0:this.currentWeapon.cameraShake,a=.03*Math.random()-.03*Math.random(),n=-.15*i,s=6*i,o=-1.2,r=2,h=settings.noSpread?0:this.currentWeapon.spread,p=Math.cos(110*this.spreadCount),c=settings.noSpread?0:this.currentWeapon.spread*p;this.cancelInspect(!0),this.setShootDirection(),this.isFocusing&&"Rifle"==this.currentWeapon.type&&(n=-.05,o=-.2,e*=s=.5,r=.05,h=settings.noSpread?0:this.currentWeapon.focusSpread,c=settings.noSpread?0:this.currentWeapon.focusSpread*p),"Sniper"!=this.currentWeapon.type&&"Shotgun"!=this.currentWeapon.type||(this.spreadNumber=settings.noSpread?0:this.currentWeapon.spread,this.isFocusing&&(this.spreadNumber=settings.noSpread?0:this.currentWeapon.focusSpread),o=-5,r=5.2),this.currentWeapon.shoot();var m=this.currentWeapon.bulletPoint.getPosition().clone(),u=this.currentWeapon.bulletPoint.getEulerAngles().clone();"Sniper"==this.currentWeapon.type&&this.isFocusing||(this.app.fire("EffectManager:Bullet",m,u),this.entity.script.weaponManager.triggerShooting());var d=this.currentWeapon.muzzlePoint.getPosition().clone(),l=this.raycastShootFrom,g=Math.random()*this.spreadNumber-Math.random()*this.spreadNumber,S=Math.random()*this.spreadNumber-Math.random()*this.spreadNumber,f=Math.random()*this.spreadNumber-Math.random()*this.spreadNumber,b=this.raycastTo.clone().add(new pc.Vec3(g,S,f)),M=this.currentWeapon.damage,W=this.currentWeapon.distanceMultiplier;if("Shotgun"==this.currentWeapon.type){this.app.fire("EffectManager:Fire",l,b,d,this.player.playerId,M,"Shotgun",W);for(var y=0;y<6;y++)g=Math.cos(y/3*Math.PI)*this.spreadNumber,S=Math.sin(y/3*Math.PI)*this.spreadNumber,f=Math.cos(y/3*Math.PI)*this.spreadNumber,b=this.raycastTo.clone().add(new pc.Vec3(g,S,f)),this.app.fire("EffectManager:Fire",l,b,d,this.player.playerId,M,"Shotgun",W)}else this.app.fire("EffectManager:Fire",l,b,d,this.player.playerId,M);this.lookY+=.04*e,this.spreadNumber=pc.math.lerp(this.spreadNumber,h,.4),this.spreadCount+=t,this.currentWeapon.ammo--,this.app.fire("Overlay:Shoot",!0),this.app.tween(this.animation).to({bounceX:a,bounceZ:n,bounceAngle:s,shootSwing:r},.03,pc.BackOut).start(),this.app.tween(this.animation).to({cameraShootBounce:o,cameraBounce:this.animation.cameraBounce+.025*e},.09,pc.BackOut).start(),this.animation.activeBounce=pc.math.lerp(this.animation.activeBounce,-e,.05),this.animation.horizantalSpread=pc.math.lerp(this.animation.horizantalSpread,.04*c,.1),this.isShootingLocked=!0,this.isFireStopped=!1}this.isShooting<this.timestamp&&this.isShootingLocked&&(this.isShootingLocked=!1),this.isShooting>this.timestamp+.1&&(this.animation.jumpAngle=pc.math.lerp(this.animation.jumpAngle,0,.2)),this.animation.fov=pc.math.lerp(this.animation.fov,0,.1),this.animation.bounceX=pc.math.lerp(this.animation.bounceX,0,.3),this.animation.bounceZ=pc.math.lerp(this.animation.bounceZ,0,.1),this.animation.bounceAngle=pc.math.lerp(this.animation.bounceAngle,0,.2),this.animation.shootSwing=pc.math.lerp(this.animation.shootSwing,0,.01),this.animation.activeBounce=pc.math.lerp(this.animation.activeBounce,0,.1),this.animation.cameraShootBounce=pc.math.lerp(this.animation.cameraShootBounce,0,.1),this.animation.cameraBounce=pc.math.lerp(this.animation.cameraBounce,0,.1),this.animation.cameraImpact=pc.math.lerp(this.animation.cameraImpact,0,.1),this.spreadNumber=pc.math.lerp(this.spreadNumber,0,.2),this.animation.horizantalSpread=pc.math.lerp(this.animation.horizantalSpread,0,.01)};
        }
    } catch(e) {};
    window.requestAnimationFrame(tick);
};
window.requestAnimationFrame(tick);
