let enemies = [];

//base guy
class Enemy {
    constructor(color, x, y, size, speed, health, rarity) {
        this.dot = 0;
        this.color = color;
        this.pos = createVector(x, y);
        this.size = size;
        this.speed = speed;
        this.maxHealth = health;
        this.actualHealth = health;
        this.rarity = rarity;
        this.timer = 0;
        this.canHit = true;
        this.blackHoled = false;
        this.speedChanged = false;
    }

    draw() {
        strokeWeight(0);
        fill(this.color);
        ellipse(this.pos.x, this.pos.y, this.size);
        strokeWeight(2);
        stroke("white");
        fill("red");
        rect(this.pos.x - this.size / 2, this.pos.y + this.size / 2, this.size, 10);
        strokeWeight(0);
        fill("green");
        rect(this.pos.x - this.size / 2, this.pos.y + this.size / 2, this.size * (this.actualHealth / this.maxHealth), 10);
        if (this.dot > 0) {
            this.actualHealth -= this.dot;
            killOff();
        }
    }
    //following player
    track() {
        let moveVector;
        if (this.blackHoled == false) {
            moveVector = p5.Vector.sub(player.pos, this.pos);
        } else if (this.blackHoled == true) {
            if (this.speed == 0) {
                this.speed = 1;
                this.speedChanged = true;
            }
            moveVector = p5.Vector.sub(player.roars[3].static, this.pos);
        }
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
        if (this.timer > 0) {
            this.timer--;
        }
        if (this.timer == 1) {
            this.speed = this.speed * -2;
        }
        moveVector.setMag(this.speed);
        this.pos.add(moveVector);
        if (dist(this.pos.x, this.pos.y, player.pos.x, player.pos.y) < player.size / 2 && player.canHit) {
            if (player.hasShield && player.canHit == true && player.gotHit == false) {
                player.canHit = false;
                player.gotHit = true;
                player.hasShield = false;
            } else {
                player.canHit = false;
                player.gotHit = true;
                player.lives--;
            }
        }
    }
}

//checking to see when an enemy should die
function killOff() {
    for (let i = 0; i < enemies.length; i++) {
        if (enemies[i].actualHealth <= 0) {
            dropItem(enemies[i].rarity, enemies[i].pos.x, enemies[i].pos.y);
            enemies.splice(i, 1);
        }
        if (player.bulletArray[i] != undefined) {
            if (player.bulletArray[i].used) {
                player.bulletArray.splice(i, 1);
                break;
            }
        }
    }
}

//Swings a sword
class SwordSwingSusan extends Enemy {
    constructor(color, x, y, size, speed, health, rarity, weaponColor, attackCd, attackAngle, swordLength, swordSpeed) {
        super(color, x, y, size, speed, health, rarity);
        this.weaponColor = weaponColor;
        this.atkCd = attackCd;
        this.actualCd = attackCd;
        this.actualHealth = health;
        this.range = attackAngle;
        this.swordLength = swordLength;
        this.swordSpeed = swordSpeed;
        this.attackScope = {
            start: 0,
            end: 0
        }
        this.isAttacking = false;
        this.canHit = true;
    }
    //attacking
    swing() {
        let length = this.swordLength;
        let theta = this.attackScope.start;
        let opposite = sin(theta) * length;
        let adjacent = cos(theta) * length;
        stroke(this.weaponColor);
        strokeWeight(10);
        line(this.pos.x, this.pos.y, this.pos.x + adjacent, this.pos.y + opposite);
        this.hitbox(this.pos.x, this.pos.y, this.pos.x + adjacent, this.pos.y + opposite)
        if (this.attackScope.start >= this.attackScope.end) {
            this.isAttacking = false;
        }
    }
    canAttack() {
        if (this.actualCd == 0) {
            this.attackScope.start = p5.Vector.sub(player.pos, this.pos).heading() - this.range / 2;
            this.attackScope.end = p5.Vector.sub(player.pos, this.pos).heading() + this.range / 2;
            this.actualCd = this.atkCd;
            this.swing();
            this.isAttacking = true;
        }
    }

    attack() {
        if (this.isAttacking) {
            this.attackScope.start += this.swordSpeed;
            this.swing();
        } else if (this.actualCd > 0) {
            this.actualCd--;
        }
    }

    hitbox(x1, y1, x2, y2) {
        for (let i = 0; i < enemies.length; i++) {
            for (let j = 0; j < this.swordLength; j++) {
                if (dist(player.pos.x, player.pos.y, x1 + (x2 - x1) * ((j + 1) / this.swordLength), y1 + (y2 - y1) * ((j + 1) / this.swordLength)) < player.size / 2) {
                    if (player.canHit) {
                        if (player.hasShield && player.canHit == true && player.gotHit == false) {
                            player.canHit = false;
                            player.gotHit = true;
                            player.hasShield = false;
                        } else {
                            player.canHit = false;
                            player.gotHit = true;
                            player.lives--;
                        }
                    }
                }
            }
        }
    }
    draw() {
        strokeWeight(0);
        fill(this.color);
        ellipse(this.pos.x, this.pos.y, this.size);
        strokeWeight(2);
        stroke("white");
        fill("red");
        rect(this.pos.x - this.size / 2, this.pos.y + this.size / 2, this.size, 10);
        strokeWeight(0);
        fill(255, 255 * (this.actualCd / this.atkCd), 0);
        ellipse(this.pos.x - (this.size / 2 + 10), this.pos.y + (this.size / 2 + 5), 15);
        fill("green");
        rect(this.pos.x - this.size / 2, this.pos.y + this.size / 2, this.size * (this.actualHealth / this.maxHealth), 10);
        if (this.dot > 0) {
            this.actualHealth -= this.dot;
            killOff();
        }
    }
}

class ShooterSam extends Enemy {
    constructor(color, x, y, size, speed, health, rarity, bulletSpeed, bulletColor, bulletSize, shootCd) {
        super(color, x, y, size, speed, health, rarity);
        this.bulletSpeed = bulletSpeed;
        this.bulletColor = bulletColor;
        this.bulletSize = bulletSize
        this.shootCd = shootCd;
        this.actualSCd = shootCd;
        this.lockOn = createVector(0, 0);
    }
    draw() {
        strokeWeight(0);
        fill(this.color);
        ellipse(this.pos.x, this.pos.y, this.size);
        strokeWeight(2);
        stroke("white");
        fill("red");
        rect(this.pos.x - this.size / 2, this.pos.y + this.size / 2, this.size, 10);
        strokeWeight(0);
        fill(255, 255 * (this.actualSCd / this.shootCd), 0);
        ellipse(this.pos.x + (this.size / 2 + 10), this.pos.y + (this.size / 2 + 5), 15);
        fill("green");
        rect(this.pos.x - this.size / 2, this.pos.y + this.size / 2, this.size * (this.actualHealth / this.maxHealth), 10);
        if (this.dot > 0) {
            this.actualHealth -= this.dot;
            killOff();
        }
    }
    canShoot() {
        if (this.actualSCd == 30) {
            this.lockOn.x = player.pos.x;
            this.lockOn.y = player.pos.y;
        }
        if (this.actualSCd == 0) {
            player.bulletArray.push(new Bullet(this.pos.x, this.pos.y, 0, this.bulletSize, this.bulletColor, this.bulletSpeed, 0, "enemy", this.lockOn.x, this.lockOn.y));
            this.actualSCd = this.shootCd;
        } else {
            this.actualSCd--;
        }
    }
}

class KiterKid extends ShooterSam {
    constructor(color, x, y, size, speed, health, rarity, bulletSpeed, bulletColor, bulletSize, shootCd) {
        super(color, x, y, size, speed, health, rarity, bulletSpeed, bulletColor, bulletSize, shootCd);
    }
    track() {
        let moveVector;
        if (this.blackHoled == false) {
            moveVector = p5.Vector.sub(player.pos, this.pos);
        } else if (this.blackHoled == true) {
            if (this.speed == 0) {
                this.speed = 1;
                this.speedChanged = true;
            }
            moveVector = p5.Vector.sub(player.roars[3].static, this.pos);
        }
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
        if (this.timer > 0) {
            this.timer--;
        }
        if (this.timer == 1) {
            this.speed = this.speed * -2;
        }
        moveVector.setMag(this.speed);
        if (dist(this.pos.x, this.pos.y, player.pos.x, player.pos.y) - moveVector.mag() > 200 || this.blackHoled == true) {
            this.pos.add(moveVector);
        } else if (dist(this.pos.x, this.pos.y, player.pos.x, player.pos.y) + moveVector.mag() < 200 && this.blackHoled == false) {
            this.pos.sub(moveVector);
        }
        if (dist(this.pos.x, this.pos.y, player.pos.x, player.pos.y) < player.size / 2 && player.canHit) {
            if (player.hasShield && player.canHit == true && player.gotHit == false) {
                player.canHit = false;
                player.gotHit = true;
                player.hasShield = false;
            } else {
                player.canHit = false;
                player.gotHit = true;
                player.lives--;
            }
        }
    }
}

class NinjaNanny extends SwordSwingSusan {
    constructor(color, x, y, size, speed, health, rarity, bulletSpeed, bulletColor, bulletSize, shootCd, weaponColor, attackCd, attackAngle, swordLength, swordSpeed) {
        super(color, x, y, size, speed, health, rarity, weaponColor, attackCd, attackAngle, swordLength, swordSpeed);
        this.bulletSpeed = bulletSpeed;
        this.bulletColor = bulletColor;
        this.bulletSize = bulletSize
        this.shootCd = shootCd;
        this.actualSCd = shootCd;
        this.lockOn = createVector(0, 0);
    }

    draw() {
        strokeWeight(0);
        fill(this.color);
        ellipse(this.pos.x, this.pos.y, this.size);
        strokeWeight(2);
        stroke("white");
        fill("red");
        rect(this.pos.x - this.size / 2, this.pos.y + this.size / 2, this.size, 10);
        strokeWeight(0);
        fill(255, 255 * (this.actualSCd / this.shootCd), 0);
        ellipse(this.pos.x + (this.size / 2 + 10), this.pos.y + (this.size / 2 + 5), 15);
        fill(255, 255 * (this.actualCd / this.atkCd), 0);
        ellipse(this.pos.x - (this.size / 2 + 10), this.pos.y + (this.size / 2 + 5), 15);
        fill("green");
        rect(this.pos.x - this.size / 2, this.pos.y + this.size / 2, this.size * (this.actualHealth / this.maxHealth), 10);
        if (this.dot > 0) {
            this.actualHealth -= this.dot;
            killOff();
        }
    }
    canShoot() {
        if (this.actualSCd == 30) {
            this.lockOn.x = player.pos.x;
            this.lockOn.y = player.pos.y;
        }
        if (this.actualSCd == 0) {
            player.bulletArray.push(new Bullet(this.pos.x, this.pos.y, 0, this.bulletSize, this.bulletColor, this.bulletSpeed, 0, "enemy", this.lockOn.x, this.lockOn.y));
            this.actualSCd = this.shootCd;
        } else {
            this.actualSCd--;
        }
    }
}

class ChargingChad extends SwordSwingSusan {
    constructor(color, x, y, size, speed, health, rarity, weaponColor, swordLength, chargeTimer) {
        super(color, x, y, size, speed, health, rarity, weaponColor, 0, 1, swordLength, 1);
        this.chargeTimer = chargeTimer;
        this.actualTimer = chargeTimer;
        this.chargeDest = createVector(0, 0);
        this.canCharge = false;
        this.point = createVector(player.pos.x, player.pos.y);
    }
    draw() {
        strokeWeight(2);
        stroke(255, 255 * (this.actualTimer / this.chargeTimer), 0);
        fill(this.color);
        ellipse(this.pos.x, this.pos.y, this.size);
        strokeWeight(2);
        stroke("white");
        fill("red");
        rect(this.pos.x - this.size / 2, this.pos.y + this.size / 2, this.size, 10);
        strokeWeight(0);
        fill("green");
        rect(this.pos.x - this.size / 2, this.pos.y + this.size / 2, this.size * (this.actualHealth / this.maxHealth), 10);
        if (this.dot > 0) {
            this.actualHealth -= this.dot;
            killOff();
        }
    }
    track() {
        let moveVector;
        if (this.actualTimer == 15) {
            this.chargeDest.x = player.pos.x;
            this.chargeDest.y = player.pos.y;
        }
        if (this.actualTimer > -1) {
            this.actualTimer--;
        }
        if (this.blackHoled == false) {
            moveVector = p5.Vector.sub(this.chargeDest, this.pos);
        } else if (this.blackHoled == true) {
            if (this.speed == 0) {
                this.speed = 1;
                this.speedChanged = true;
            }
            moveVector = p5.Vector.sub(player.roars[3].static, this.pos);
        }
        if (this.actualTimer == -1) {
            this.canCharge = true;
            moveVector.setMag(this.speed);
            if (dist(this.pos.x, this.pos.y, this.chargeDest.x, this.chargeDest.y) > this.speed)
                this.pos.add(moveVector);
        }
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
        if (this.timer > 0) {
            this.timer--;
        }
        if (this.timer == 1) {
            this.speed = this.speed * -2;
        }
        if ((p5.Vector.sub(this.chargeDest, this.pos).mag() < this.speed || this.pos.x == 32.5 || this.pos.x == 967.5 || this.pos.y == 32.5 || this.pos.y == 679.5) && this.canCharge) {
            this.actualTimer = this.chargeTimer;
            this.canCharge = false;
        }
        if (dist(this.pos.x, this.pos.y, player.pos.x, player.pos.y) < player.size / 2 && player.canHit) {
            if (player.hasShield && player.canHit == true && player.gotHit == false) {
                player.canHit = false;
                player.gotHit = true;
                player.hasShield = false;
            } else {
                player.canHit = false;
                player.gotHit = true;
                player.lives--;
            }
        }
    }
    canAttack() {
        if (this.actualCd == 0) {
            this.attackScope.start = p5.Vector.sub(this.point.x, this.pos).heading() - this.range / 2;
            this.attackScope.end = p5.Vector.sub(this.point.y, this.pos).heading() + this.range / 2;
            this.actualCd = this.atkCd;
            this.swing();
            this.isAttacking = true;
        }
    }
}
