//equipping a new weapon
class Weapon {
    constructor(name, type, color, size, speed, damage, range, attackCd, knockback) {
        this.name = name;
        this.type = type;
        this.color = color;
        this.size = size;
        this.speed = speed;
        this.damage = damage;
        this.range = range;
        this.atkCd = attackCd;
        this.actualCd = 0;
        this.knockback = knockback;
        this.canDraw = false;
        this.pos = createVector(0, 0);
    }
}

class Bullet {
    constructor(x, y, direction, size, color, speed, damage, type, lockOnDestX, lockOnDestY, parent) {
        this.pos = createVector(x, y);
        this.size = size;
        this.color = color;
        this.speed = speed;
        this.direction = direction;
        this.damage = damage;
        this.used = false;
        this.type = type;
        this.lockOnDest = createVector(lockOnDestX, lockOnDestY);
        if (parent == "fire") {
            if (this.direction == 270) {
                this.lockOnDest.x = chance(player.pos.x - 80, player.pos.x + 80);
                this.lockOnDest.y = chance(player.pos.y - 125, player.pos.y - 100);
            } else if (this.direction == 180) {
                this.lockOnDest.x = chance(player.pos.x - 125, player.pos.x - 100);
                this.lockOnDest.y = chance(player.pos.y - 80, player.pos.y + 80);
            } else if (this.direction == 90) {
                this.lockOnDest.x = chance(player.pos.x - 80, player.pos.x + 80);
                this.lockOnDest.y = chance(player.pos.y + 100, player.pos.y + 125);
            } else if (this.direction == 360) {
                this.lockOnDest.x = chance(player.pos.x + 100, player.pos.x + 125);
                this.lockOnDest.y = chance(player.pos.y - 80, player.pos.y + 80);
            }
        } else if (parent == "pellet") {
            if (this.direction == 270) {
                this.lockOnDest.x = chance(player.pos.x - 100, player.pos.x + 100);
                this.lockOnDest.y = chance(player.pos.y - 160, player.pos.y - 100);
            } else if (this.direction == 180) {
                this.lockOnDest.x = chance(player.pos.x - 160, player.pos.x - 100);
                this.lockOnDest.y = chance(player.pos.y - 100, player.pos.y + 100);
            } else if (this.direction == 90) {
                this.lockOnDest.x = chance(player.pos.x - 100, player.pos.x + 100);
                this.lockOnDest.y = chance(player.pos.y + 100, player.pos.y + 160);
            } else if (this.direction == 360) {
                this.lockOnDest.x = chance(player.pos.x + 100, player.pos.x + 160);
                this.lockOnDest.y = chance(player.pos.y - 100, player.pos.y + 100);
            }
        }
        this.moveVector = p5.Vector.sub(this.lockOnDest, this.pos);
    }

    move() {
        if (this.type == "player") {
            if (this.direction == 90) {
                this.pos.y += this.speed;
            } else if (this.direction == 180) {
                this.pos.x -= this.speed;
            } else if (this.direction == 270) {
                this.pos.y -= this.speed;
            } else if (this.direction == 360) {
                this.pos.x += this.speed;
            }
            if (items[player.activeWeapon].name == "Flame Thrower" || items[player.activeWeapon].name == "Shotgun") {
                this.moveVector.setMag(this.speed);
                this.pos.add(this.moveVector);
                if (this.direction == 90) {
                    if (this.pos.y >= this.lockOnDest.y) {
                        this.used = true;
                    }
                } else if (this.direction == 180) {
                    if (this.pos.x <= this.lockOnDest.x) {
                        this.used = true;
                    }
                } else if (this.direction == 270) {
                    if (this.pos.y <= this.lockOnDest.y) {
                        this.used = true;
                    }
                } else if (this.direction == 360) {
                    if (this.pos.x >= this.lockOnDest.x) {
                        this.used = true;
                    };
                }
            }
            noStroke();
            fill(this.color);
            ellipse(this.pos.x, this.pos.y, this.size);
            for (let i = 0; i < enemies.length; i++) {
                if (dist(this.pos.x, this.pos.y, enemies[i].pos.x, enemies[i].pos.y) < enemies[i].size / 2 && enemies[i].canHit) {
                    if (items[player.activeWeapon].name == "Silver Bolts") {
                        enemies[i].marked++;
                        this.used = true;
                        if (enemies[i].marked == 3) {
                            if (enemies[i] instanceof Enemy) {
                                enemies[i].actualHealth -= enemies[i].maxHealth * 0.12;
                                enemies[i].marked = 0;
                                this.used = true;
                            } else if (enemies[i] instanceof TheMachine) {
                                enemies[i].actualHealth -= enemies[i].health * 0.12;
                                enemies[i].marked = 0;
                            }
                        }
                    }
                    if (items[player.activeWeapon].name == "Flame Thrower") {
                        enemies[i].dot += 0.003;
                        this.used = true;
                    }
                    enemies[i].actualHealth -= this.damage * player.atkMod;
                    this.used = true;
                    break;
                }
            }
        } else if (this.type == "enemy") {
            this.moveVector.setMag(this.speed);
            this.pos.add(this.moveVector);
            noStroke();
            fill(this.color);
            ellipse(this.pos.x, this.pos.y, this.size);
            if (dist(this.pos.x, this.pos.y, player.pos.x, player.pos.y) < player.size / 2 && player.canHit) {
                if (player.hasShield || player.bloodShield) {
                    if (player.canHit == true && player.gotHit == false) {
                        player.canHit = false;
                        player.gotHit = true;
                        if (player.bloodShield) {
                            player.bloodShield = false;
                        } else if (player.hasShield) {
                            player.hasShield = false;
                        }
                    }
                } else {
                    player.canHit = false;
                    player.gotHit = true;
                    player.lives--;
                    this.used = true;
                }
            }
        }
        if (this.pos.x <= 0) {
            this.used = true;
        }
        if (this.pos.x >= 1000) {
            this.used = true;
        }
        if (this.pos.y <= 0) {
            this.used = true;
        }
        if (this.pos.y >= 710) {
            this.used = true;
        }
    }
}

//all weapons
let weapons = [
    //rarity zero
    [{
            create: class Stick extends Weapon {
                constructor() {
                    super("Stick", "melee", "brown", 100, 10, 10, 90, 60, 40);
                }
                draw() {
                    strokeWeight(10);
                    stroke("brown");
                    line(this.pos.x - 20, this.pos.y + 20, this.pos.x + 20, this.pos.y - 20);
                }
            }
    }, {
            create: class Dagger extends Weapon {
                constructor() {
                    super("Dagger", "melee", "white", 70, 100, 5, 2, 1, 20);
                }
                draw() {
                    strokeWeight(7);
                    stroke("white");
                    line(this.pos.x - 10, this.pos.y + 10, this.pos.x + 15, this.pos.y - 15);
                    stroke("brown");
                    line(this.pos.x - 10, this.pos.y + 10, this.pos.x - 2.5, this.pos.y + 2.5);
                    line(this.pos.x - 8, this.pos.y - 3, this.pos.x + 3, this.pos.y + 8);
                }
            }
    },
        {
            create: class Sling extends Weapon {
                constructor() {
                    super("Sling", "ranged", "grey", 25, 5, 15, 0, 0, 0);
                    this.ammo = 5;
                    this.actualAmmo = 5;
                    this.ammoChanged = false;
                }
                draw() {
                    strokeWeight(7);
                    stroke("brown");
                    line(this.pos.x - 10, this.pos.y + 8, this.pos.x + 2.5, this.pos.y - 2.5);
                    line(this.pos.x + 2.5, this.pos.y - 2.5, this.pos.x + 16, this.pos.y + 1);
                    line(this.pos.x + 2.5, this.pos.y - 2.5, this.pos.x + 8, this.pos.y - 15);
                    strokeWeight(4);
                    stroke("red");
                    line(this.pos.x + 18, this.pos.y + 3, this.pos.x + 7, this.pos.y - 17)
                }
            }
    }],

    //rarity one
    [{
            create: class Sword extends Weapon {
                constructor() {
                    super("Sword", "melee", 178, 120, 20, 20, 120, 70, 50);
                }
                draw() {
                    strokeWeight(10);
                    stroke(255);
                    line(this.pos.x - 27.5, this.pos.y + 27.5, this.pos.x + 27.5, this.pos.y - 27.5);
                    stroke(80);
                    line(this.pos.x - 27.5, this.pos.y + 27.5, this.pos.x - 7.5, this.pos.y + 7.5);
                    line(this.pos.x - 21.5, this.pos.y - 4, this.pos.x + 6, this.pos.y + 19);
                }
            }
    },
        {
            create: class Katana extends Weapon {
                constructor() {
                    super("Katana", "melee", "white", 120, 40, 10, 180, 20, 15);
                }
                draw() {
                    strokeWeight(4);
                    stroke(200);
                    line(this.pos.x - 22.5, this.pos.y + 22.5, this.pos.x + 25.5, this.pos.y - 25.5);
                    stroke("purple");
                    line(this.pos.x - 22.50, this.pos.y + 22.5, this.pos.x - 4.5, this.pos.y + 4.5);
                    stroke("black");
                    strokeWeight(2);
                    line(this.pos.x - 22.50, this.pos.y + 22.5, this.pos.x - 6, this.pos.y + 6);
                    stroke("yellow");
                    strokeWeight(2);
                    line(this.pos.x - 6, this.pos.y, this.pos.x, this.pos.y + 6);

                }
            }
    },
        {
            create: class HandGun extends Weapon {
                constructor() {
                    super("Hand Gun", "ranged", [229, 230, 232], 10, 10, 20, 0, 0, 0);
                    this.ammo = 6;
                    this.actualAmmo = 6;
                    this.ammoChanged = false;
                }
                draw() {
                    noFill();
                    strokeWeight(3);
                    stroke("brown");
                    ellipse(this.pos.x - 2, this.pos.y + 6, 15);
                    stroke("white");
                    strokeWeight(1);
                    fill("grey");
                    rect(this.pos.x - 5, this.pos.y - 6, 30, 12);
                    fill("brown");
                    quad(this.pos.x - 5, this.pos.y - 6, this.pos.x + 2, this.pos.y + 5, this.pos.x - 10, this.pos.y + 19, this.pos.x - 20, this.pos.y + 19);
                }
            }
    },
        {
            create: class DualBlades extends Weapon {
                constructor() {
                    // name, type, color, size, speed, damage, range, attackCd, knockback
                    super("Dual Blades", "melee", "white", 70, 80, 10, 360, 20, 40);
                }
                draw() {
                    strokeWeight(7);
                    stroke("white");
                    line(this.pos.x - 20, this.pos.y + 10, this.pos.x + 5, this.pos.y - 15);
                    stroke("brown");
                    line(this.pos.x - 20, this.pos.y + 10, this.pos.x - 12.5, this.pos.y + 2.5);
                    line(this.pos.x - 18, this.pos.y - 3, this.pos.x - 7, this.pos.y + 8);
                    strokeWeight(7);
                    stroke("white");
                    line(this.pos.x - 10, this.pos.y + 10, this.pos.x + 15, this.pos.y - 15);
                    stroke("brown");
                    line(this.pos.x - 10, this.pos.y + 10, this.pos.x - 2.5, this.pos.y + 2.5);
                    line(this.pos.x - 8, this.pos.y - 3, this.pos.x + 3, this.pos.y + 8);
                }
            }
    }
    ],

    //rarity two
    [
        {
            create: class Axe extends Weapon {
                constructor() {
                    super("Axe", "melee", "brown", 70, 5, 65, 90, 120, 90);
                }
                draw() {
                    strokeWeight(10);
                    stroke("white");
                    fill("white");
                    quad(this.pos.x + 15, this.pos.y - 25, this.pos.x + 40, this.pos.y - 15, this.pos.x + 35, this.pos.y - 8, this.pos.x + 27, this.pos.y - 5);
                    stroke("brown");
                    strokeWeight(10);
                    line(this.pos.x - 25, this.pos.y + 25, this.pos.x + 25, this.pos.y - 25);
                }
            }
    },
        {
            create: class SniperRifle extends Weapon {
                constructor() {
                    super("Sniper Rifle", "ranged", 242, 6, 50, 80, 0, 0, 0);
                    this.ammo = 2;
                    this.actualAmmo = 2;
                    this.ammoChanged = false;
                }
                draw() {
                    strokeWeight(1);
                    stroke("white");
                    noFill();
                    ellipse(this.pos.x - 17, this.pos.y + 7, 12);
                    strokeWeight(3);
                    stroke(81);
                    rect(this.pos.x - 10, this.pos.y - 5, 10, 10);
                    quad(this.pos.x - 15, this.pos.y - 8, this.pos.x - 15, this.pos.y - 5, this.pos.x + 5, this.pos.y - 8, this.pos.x + 5, this.pos.y - 5);
                    strokeWeight(4);
                    stroke(81);
                    line(this.pos.x - 10, this.pos.y, this.pos.x + 40, this.pos.y);
                    noStroke();
                    fill(47, 71, 48);
                    quad(this.pos.x - 25, this.pos.y - 2, this.pos.x + 5, this.pos.y - 2, this.pos.x + 5, this.pos.y + 7, this.pos.x - 35, this.pos.y + 5);
                    stroke(47, 71, 48);
                    strokeWeight(4);
                    noFill();
                    rect(this.pos.x - 40, this.pos.y + 3, 18, 10);
                }
            }
    },
        {
            create: class Shotgun extends Weapon {
                constructor() {
                    //name, type, color, size, speed, damage, range, attackCd, knockback
                    super("Shotgun", "ranged", "brown", 10, 2, 3, 0, 0, 0);
                    this.ammo = 8;
                    this.actualAmmo = 8;
                    this.ammoChanged = false;
                }
                draw() {
                    fill(30);
                    stroke(255);
                    strokeWeight(1);
                    rect(this.pos.x - 28.5, this.pos.y - 2.5, 55, 5);
                    noStroke();
                    fill("brown");
                    rect(this.pos.x - 10, this.pos.y + 2, 25, 5);
                    quad(this.pos.x + 24.5, this.pos.y - 3.5, this.pos.x + 22, this.pos.y + 3.5, this.pos.x + 42, this.pos.y + 14, this.pos.x + 47, this.pos.y + 4);
                }
            }
        },
        {
            create: class Mushroom extends Weapon {
                constructor() {
                    //name, type, color, size, speed, damage, range, attackCd, knockback
                    super("Mushroom", "pet", "purple", 40, 0, 5, 275, 600, 0);
                    this.energy = 300;
                    this.energyChanged = false;
                    this.summoned = false;
                }
                draw() {
                    fill(this.color);
                    ellipse(this.pos.x, this.pos.y, this.size)
                }
            }
        }
    ],
    //rarity three
    [
        {
            create: class SilverBolts extends Weapon {
                constructor() {
                    super("Silver Bolts", "ranged", "white", 15, 15, 30, 0, 0, 0);
                    this.ammo = 4;
                    this.actualAmmo = 4;
                    this.ammoChanged = false;
                }
                draw() {
                    image(silverBolts, this.pos.x, this.pos.y, 40, 40);
                }
            }
    },
        {
            create: class ThirstBlade extends Weapon {
                constructor() {
                    super("Thirst Blade", "melee", [173, 0, 0], 120, 15, 30, 90, 50, 25);
                    this.thirst = 0;
                }
                draw() {
                    image(thirstBlade, this.pos.x, this.pos.y, 40, 40);
                }
            }
        },
        {
            create: class FlameThrower extends Weapon {
                constructor() {
                    super("Flame Thrower", "ranged", "orange", 15, 0.75, 0.1, 0, 0, 0);
                    this.ammo = 20;
                    this.actualAmmo = 20;
                    this.ammoChanged = false;
                }
                draw() {
                    image(flameThrower, this.pos.x, this.pos.y, 500 / 4, 259 / 4);
                }
            }
        },
    ]
];

//all consumables
let consumables = [

    //rarity zero
    [{
            create: class Potion {
                constructor() {
                    this.name = "Health Potion";
                    this.type = "consumable";
                    this.amount = 1;
                    this.maxAmount = 3;
                    this.pos = createVector(0, 0);
                }

                draw() {
                    fill("red");
                    stroke("white");
                    strokeWeight(2);
                    ellipse(this.pos.x, this.pos.y, 30);
                    fill(214, 138, 56);
                    strokeWeight(3);
                    quad(this.pos.x - 6, this.pos.y - 7, this.pos.x + 6, this.pos.y - 7, this.pos.x + 7.5, this.pos.y - 20,
                        this.pos.x - 7.5, this.pos.y - 20);
                }

                activate() {
                    if (player.lives < player.maxLives) {
                        player.lives++;
                        this.amount--;
                    }
                }
            }
    },
        {
            create: class EnergyShield {
                constructor() {
                    this.name = "Energy Shield";
                    this.type = "consumable";
                    this.amount = 1;
                    this.maxAmount = 3;
                    this.pos = createVector(0, 0);
                }

                draw() {
                    fill(0, 0, 255, 100);
                    stroke("blue");
                    strokeWeight(2);
                    ellipse(this.pos.x, this.pos.y, 50);
                }

                activate() {
                    if (player.hasShield == false) {
                        player.hasShield = true;
                        this.amount--;
                    }
                }
            }
    }],

//rarity one 
    [{
            create: class RoarOfFear {
                constructor() {
                    this.name = "Roar of Fear";
                    this.type = "consumable";
                    this.amount = 1;
                    this.maxAmount = 4;
                    this.pos = createVector(0, 0);
                }
                draw() {
                    noFill();
                    strokeWeight(4);
                    stroke(255, 0, 0);
                    ellipse(this.pos.x, this.pos.y, 50);
                    ellipse(this.pos.x, this.pos.y, 30);
                    ellipse(this.pos.x, this.pos.y, 12.5);
                }
                activate() {
                    if (player.roars[0] == 0) {
                        player.roars.splice(0, 1, new Roar("red", 5, 0, 300));
                        this.amount--;
                    }

                }
            }
                },
        {
            create: class RoarOfFire {
                constructor() {
                    this.name = "Roar of Fire";
                    this.type = "consumable";
                    this.amount = 1;
                    this.maxAmount = 2;
                    this.pos = createVector(0, 0);
                }
                draw() {
                    noFill();
                    strokeWeight(4);
                    stroke("orange");
                    ellipse(this.pos.x, this.pos.y, 50);
                    ellipse(this.pos.x, this.pos.y, 30);
                    ellipse(this.pos.x, this.pos.y, 12.5);
                }
                activate() {
                    if (player.roars[2] == 0) {
                        player.roars.splice(2, 1, new Roar("orange", 12, 0, 500));
                        this.amount--;
                    }
                }
            }
                }],

    //rarity two
    [{
            create: class RoarOfIce {
                constructor() {
                    this.name = "Roar of Ice";
                    this.type = "consumable";
                    this.amount = 1;
                    this.maxAmount = 3;
                    this.pos = createVector(0, 0);
                }
                draw() {
                    noFill();
                    strokeWeight(4);
                    stroke(0, 255, 255);
                    ellipse(this.pos.x, this.pos.y, 50);
                    ellipse(this.pos.x, this.pos.y, 30);
                    ellipse(this.pos.x, this.pos.y, 12.5);
                }
                activate() {
                    if (player.roars[1] == 0) {
                        player.roars.splice(1, 1, new Roar([0, 255, 255], 8, 0, 250));
                        this.amount--;
                    }
                }
            }
    },
        {
            create: class BlackHoleItem {
                constructor() {
                    this.name = "Black Hole";
                    this.type = "consumable";
                    this.amount = 1;
                    this.maxAmount = 3;
                    this.pos = createVector(0, 0);
                }
                draw() {
                    noFill();
                    strokeWeight(4);
                    stroke(74, 0, 112);
                    ellipse(this.pos.x, this.pos.y, 50);
                    ellipse(this.pos.x, this.pos.y, 30);
                    ellipse(this.pos.x, this.pos.y, 12.5);
                }
                activate() {
                    if (player.roars[3] == 0) {
                        player.roars.splice(3, 1, new BlackHole([74, 0, 112], 15, 300, 0, player.pos.x, player.pos.y));
                        this.amount--;
                    }
                }
            }
    },
        {
            create: class ItalianPlumbingStar {
                constructor() {
                    this.name = "Italian Plumbing Star";
                    this.type = "consumable";
                    this.amount = 1;
                    this.maxAmount = 1;
                    this.pos = createVector(0, 0);
                }
                draw() {
                    image(star, this.pos.x, this.pos.y, 80, 80);
                }
                activate() {
                    if (player.alpha == 0) {
                        player.alpha == 255;
                    }
                    if (player.starred == false) {
                        player.starred = true;
                        player.speed += 1;
                        player.gotHit = true;
                        player.canHit = false;
                        player.timer = -360;
                        this.amount--;
                    }
                }
            }
                }],
    []
];

//all charms
let charms = [
    //rarity zero
    [
        {
            create: class HealthCharm {
                constructor() {
                    this.name = "Health Charm";
                    this.type = "charm";
                    this.pos = createVector(0, 0);
                }
                draw() {
                    stroke(255, 215, 0);
                    strokeWeight(2);
                    noFill();
                    ellipse(this.pos.x, this.pos.y, 40);
                    fill("red");
                    ellipse(this.pos.x, this.pos.y + 20, 20);
                }
                putOn() {
                    player.maxLives++;
                    player.lives++;
                }
                takeOff() {
                    player.maxLives--;
                    player.lives--;
                }
            }
},
        {
            create: class SpeedCharm {
                constructor() {
                    this.name = "Speed Charm";
                    this.type = "charm";
                    this.pos = createVector(0, 0);
                }
                draw() {
                    stroke(255, 215, 0);
                    strokeWeight(2);
                    noFill();
                    ellipse(this.pos.x, this.pos.y, 40);
                    fill("blue");
                    ellipse(this.pos.x, this.pos.y + 20, 20);
                }
                putOn() {
                    player.speed += 2;
                }
                takeOff() {
                    player.speed -= 2;
                }
            }
},
        {
            create: class CooldownCharm {
                constructor() {
                    this.name = "Cooldown Charm";
                    this.type = "charm";
                    this.pos = createVector(0, 0);
                }
                draw() {
                    stroke(255, 215, 0);
                    strokeWeight(2);
                    noFill();
                    ellipse(this.pos.x, this.pos.y, 40);
                    fill(0, 255, 191);
                    ellipse(this.pos.x, this.pos.y + 20, 20);
                }
                putOn() {
                    player.cdMod += 1;
                }
                takeOff() {
                    player.cdMod -= 1;
                }
            }
},
        {
            create: class PowerCharm {
                constructor() {
                    this.name = "Power Charm";
                    this.type = "charm";
                    this.pos = createVector(0, 0);
                }
                draw() {
                    stroke(255, 215, 0);
                    strokeWeight(2);
                    noFill();
                    ellipse(this.pos.x, this.pos.y, 40);
                    fill(76, 0, 0);
                    ellipse(this.pos.x, this.pos.y + 20, 20);
                }
                putOn() {
                    player.atkMod += 1;
                }
                takeOff() {
                    player.atkMod -= 1;
                }
            }
},
        {
            create: class ShieldCharm {
                constructor() {
                    this.name = "Shield Charm";
                    this.type = "charm";
                    this.pos = createVector(0, 0);
                }
                draw() {
                    stroke(255, 215, 0);
                    strokeWeight(2);
                    noFill();
                    ellipse(this.pos.x, this.pos.y, 40);
                    fill("black");
                    stroke("blue");
                    ellipse(this.pos.x, this.pos.y + 20, 20);
                    noStroke();
                    fill(0, 0, 255, 100);
                    ellipse(this.pos.x, this.pos.y + 20, 20);
                }
                putOn() {}
                takeOff() {}
            }
},
        {
            create: class AmmoCharm {
                constructor() {
                    this.name = "Ammo Charm";
                    this.type = "charm";
                    this.pos = createVector(0, 0);
                }
                draw() {
                    stroke(255, 215, 0);
                    strokeWeight(2);
                    noFill();
                    ellipse(this.pos.x, this.pos.y, 40);
                    fill(181, 166, 66);
                    ellipse(this.pos.x, this.pos.y + 20, 20);
                }
                putOn() {
                    for (let i = 0; i < 3; i++) {
                        if (items[i].type == "ranged" && items[i].ammoChanged == false) {
                            items[i].ammo = items[i].ammo * 3;
                            items[i].ammoChanged = true;
                        }
                        if (items[i].type == "bug" && items[i].ammoChanged == false) {
                            items[i].energy = items[i].energy * 3;
                            items[i].energyChanged = true;
                        }
                    }
                }
                takeOff() {
                    for (let i = 0; i < 3; i++) {
                        if (items[i].type == "ranged" && items[i].ammoChanged == true) {
                            items[i].ammo = items[i].ammo / 3;
                            items[i].ammoChanged = false;
                        }
                        if (itms[i].type == "bug" && items[i].ammoChanged == true) {
                            items[i].energy = items[i].energy / 3;
                            items[i].energyChanged = false;
                        }
                    }
                }
            }
},
        {
            create: class BargainCharm {
                constructor() {
                    this.name = "Bargain Charm";
                    this.type = "charm";
                    this.pos = createVector(0, 0);
                }
                draw() {
                    stroke(201, 0, 0);
                    strokeWeight(2);
                    noFill();
                    ellipse(this.pos.x, this.pos.y, 40);
                    fill(255);
                    ellipse(this.pos.x, this.pos.y + 20, 20);
                }
                putOn() {
                    this.effect = chance(1, 4);
                    if (this.effect == 2) {
                        player.speed += 0.5;
                        player.atkMod += 0.3;
                        player.cdMod += 0.3;
                    } else if (this.effect == 3) {
                        player.speed += 1;
                        player.atkMod += 0.6;
                        player.cdMod += 1;
                    } else if (this.effect == 4) {
                        player.speed += 2;
                        player.atkMod += 2;
                        player.cdMod += 2;
                    }
                    player.cursed = true;
                }
                takeOff() {
                    if (this.effect == 2) {
                        player.speed -= 1;
                        player.atkMod -= 0.3;
                        player.cdMod -= 0.3;
                    } else if (this.effect == 3) {
                        player.speed -= 1;
                        player.atkMod -= 0.6;
                        player.cdMod -= 1;
                    } else if (this.effect == 4) {
                        player.speed -= 2;
                        player.atkMod -= 2;
                        player.cdMod -= 2;
                    }
                    player.cursed = false;
                }
            }
}
        ],
    //rarity one
    [],
    //rarity two
    [],
    //rarity three
    [
        {
            create: class DivineCharm {
                constructor() {
                    this.name = "Divine Charm";
                    this.type = "charm";
                    this.pos = createVector(0, 0);
                }
                draw() {
                    stroke(255, 215, 0);
                    strokeWeight(2);
                    noFill();
                    ellipse(this.pos.x, this.pos.y, 40);
                    fill("red");
                    ellipse(this.pos.x, this.pos.y + 20, 20);
                    noStroke();
                    fill("blue");
                    ellipse(this.pos.x, this.pos.y + 20, 15);
                    fill(0, 255, 191);
                    ellipse(this.pos.x, this.pos.y + 20, 10);
                    fill(255, 215, 0);
                    ellipse(this.pos.x, this.pos.y + 20, 5);
                }
                putOn() {
                    player.maxLives++;
                    player.lives++;
                    player.speed += 2;
                    player.cdMod += 1;
                    player.atkMod += 1;
                }
                takeOff() {
                    player.maxLives--;
                    player.lives--;
                    player.speed -= 2;
                    player.cdMod -= 1;
                    player.atkMod -= 1;
                }
            }
}
    ],
];

//all items
let itemLibrary = [weapons, consumables, charms];

//roar
class Roar {
    constructor(stroke, strokeWeight, roarSize, maxRoar) {
        this.stroke = stroke;
        this.strokeWeight = strokeWeight;
        this.roarSize = roarSize;
        this.maxRoar = maxRoar;
    }

    drawRoar(index) {
        if (index == 0) {
            stroke("red");
            strokeWeight(5);
            noFill();
        } else if (index == 1) {
            stroke(0, 255, 255);
            strokeWeight(8);
            noFill();
        } else if (index == 2) {
            stroke("orange");
            strokeWeight(12);
            noFill();
        } else if (index == 4) {
            stroke("green");
            this.strokeWeight(20);
            noFill();
        }
        ellipse(player.pos.x, player.pos.y, this.roarSize);
        this.roarSize += 20;
        for (let i = 0; i < enemies.length; i++) {
            if (dist(player.pos.x, player.pos.y, enemies[i].pos.x, enemies[i].pos.y) < this.roarSize / 2 + enemies[i].size / 2 && enemies[i].canHit == true) {
                if (index == 0) {
                    enemies[i].canHit = false;
                    enemies[i].actualHealth -= enemies[i].actualHealth * 0.5;
                    if (enemies[i] instanceof KiterKid) {
                        enemies[i].speed = enemies[i].speed * 0.5;
                    } else {
                        enemies[i].speed = enemies[i].speed * -0.5;
                    }
                    enemies[i].timer = 120;
                } else if (index == 1) {
                    enemies[i].color = [0, 255, 255, 200];
                    enemies[i].canHit = false;
                    enemies[i].speed = 0;
                } else if (index == 2) {
                    enemies[i].dot += 0.2;
                    enemies[i].canHit = false;
                } else if (index == 4) {
                    enemies[i].actualHealth -= 5
                    enemies[i].dot += 0.1
                    enemies[i].speed = enemies[i].speed * 0.75
                }
            }
        }
        if (this.roarSize >= this.maxRoar) {
            player.roars.splice(index, 1, 0);
            for (let i = 0; i < enemies.length; i++) {
                if (enemies[i].canHit == false) {
                    enemies[i].canHit = true;
                }
            }
        }
    }
}

//black hole
class BlackHole {
    constructor(stroke, strokeWeight, roarSize, maxRoar, staticX, staticY) {
        this.stroke = stroke;
        this.strokeWeight = strokeWeight;
        this.roarSize = roarSize;
        this.maxRoar = maxRoar;
        this.static = createVector(staticX, staticY);
        this.holeNum = -1;
    }

    drawRoar(index) {
        stroke(74, 0, 112);
        strokeWeight(15);
        noFill();
        ellipse(this.static.x, this.static.y, this.roarSize);
        this.roarSize -= 5;
        for (let i = 0; i < enemies.length; i++) {
            if (dist(this.static.x, this.static.y, enemies[i].pos.x, enemies[i].pos.y) < this.roarSize / 2 + enemies[i].size / 2 && !(enemies[i] instanceof TheMachine)) {
                enemies[i].blackHoled = true;
            }
        }
        if (this.roarSize <= this.maxRoar) {
            this.roarSize = 300
            this.holeNum++;
            if (this.holeNum == 6) {
                for (let i = 0; i < enemies.length; i++) {
                    if (enemies[i].speedChanged == true) {
                        enemies[i].speed = 0;
                        enemies[i].speedChanged = false;
                    }
                    enemies[i].blackHoled = false;
                }
                player.roars.splice(index, 1, 0);
            }
        }
    }
}

//pet that attacks enemies
class Pet {
    constructor(stats) {
        this.name = stats.name
        this.energy = stats.energy;
        this.actualEnergy = stats.energy;
        this.speed = stats.speed;
        this.color = stats.color;
        this.damage = stats.damage;
        this.range = stats.range;
        this.attackCd = stats.attackCd;
        this.actualAttackCd = stats.attackCd;
        this.pos = createVector(player.pos.x, player.pos.y);
        this.size = stats.size;
        this.target = -1;
        this.source;
    }

    draw() {
        noStroke();
        fill(this.color);
        ellipse(this.pos.x, this.pos.y, this.size);
        noFill();
        stroke("white");
        strokeWeight(1);
        ellipse(this.pos.x, this.pos.y, this.range);
        strokeWeight(2);
        stroke("white");
        fill("red");
        rect(this.pos.x - this.size / 2, this.pos.y + this.size / 2, this.size, 10);
        strokeWeight(0);
        fill("yellow");
        if (this.actualEnergy > 0) {
            rect(this.pos.x - this.size / 2, this.pos.y + this.size / 2, this.size * (this.actualEnergy / this.energy), 10);
        }
    }

    action() {
        if(this.name = "bug") {
            if (enemies.length > 0 && this.target == -1) {
                for (let i = 0; i < enemies.length; i++) {
                    if (dist(this.pos.x, this.pos.y, enemies[i].pos.x, enemies[i].pos.y) < this.range / 2) {
                        this.target = i;
                    }
                }
            }
            if (this.target > -1 && enemies.length > 0) {
                let moveVector;
                if (typeof enemies[this.target] !== "undefined") {
                    moveVector = p5.Vector.sub(enemies[this.target].pos, this.pos);
                    if (this.pos.x <= 32.5) {
                        this.pos.x = 32.5;
                    }
                    if (this.pos.x >= 967.5) {
                        this.pos.x = 967.5;
                    }
                    if (this.pos.y <= 32.5) {
                        this.pos.y = 32.5;
                    }
                    if (this.pos.y >= 679.5) {
                        this.pos.y = 679.5;
                    }
                    moveVector.setMag(this.speed);
                    this.pos.add(moveVector);
                    if (dist(this.pos.x, this.pos.y, enemies[this.target].pos.x, enemies[this.target].pos.y) < enemies[this.target].size / 2 && enemies[this.target].canHit) {
                        enemies[this.target].actualHealth = enemies[this.target].actualHealth - this.damage;
                        if (enemies[this.target].actualHealth <= 0) {
                            this.target = -1;
                        }
                    }
                }
                else {
                    this.target =  -1;
                }
            }
            if (this.target == -2) {
                let moveVector;
                moveVector = p5.Vector.sub(player.pos, this.pos);
                if (this.pos.x <= 32.5) {
                    this.pos.x = 32.5;
                }
                if (this.pos.x >= 967.5) {
                    this.pos.x = 967.5;
                }
                if (this.pos.y <= 32.5) {
                    this.pos.y = 32.5;
                }
                if (this.pos.y >= 679.5) {
                    this.pos.y = 679.5;
                }
                moveVector.setMag(this.speed);
                this.pos.add(moveVector);
                if (dist(this.pos.x, this.pos.y, player.pos.x, player.pos.y) < player.size / 2) {
                    this.target = -3;
                }
            }
        }
        else if(this.name = "mushroom") {
            if (player.roars[4] == 0) {
                //stroke, strokeWeight, roarSize, maxRoar
                player.roars.splice(1, 1, new Roar("purple", 20, 0, 400));
            }
        }
    }

    timer() {
        this.actualEnergy--;
        if (this.actualEnergy <= 0 && this.target != -3) {
            this.target = -2;
        }
    }
}

//generate a random number
function chance(min, max) {
    return (Math.floor(random(min, max + 1)));
}

//check to see if you should drop an item
let droppedItems = [];

function dropItem(rarity, x, y, type) {
    let dropChance;
    let dropType;
    let dropIndex;
    dropChance = chance(0, 5);
    if (type == "boss") {
        dropChance = 0;
    }
    dropType = chance(0, 3);
    if (dropType == 3) {
        dropType = 1;
    }
    if (type == "boss" && dropType == 1) {
        dropType = 0;
    }
    if (dropType == 2) {
        if (rarity != 3) {
            rarity = 0;
        }
    }
    dropIndex = chance(0, itemLibrary[dropType][rarity].length - 1);
    if (dropChance == 0 || dropChance == 1) {
        droppedItems.push(new itemLibrary[dropType][rarity][dropIndex].create());
        //        droppedItems.push(new itemLibrary[2][0][5].create());
        droppedItems[droppedItems.length - 1].pos.x = x;
        droppedItems[droppedItems.length - 1].pos.y = y;
    }
}
