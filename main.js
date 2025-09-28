class IntroScreen {
    static startTime = 0;

    static slideInDuration = 1000;
    static fadeOutStart = 2000;
    static fadeOutEnd = 3000;
    //static fadeOutEnd = 0;

    static startColor = new Color(0xCCCCCC);
    static endColor = new Color(0x081018);

    static init() {
        this.startTime = document.timeline.currentTime;

        this.draw(this.startTime);
    }
    
    static draw(time) {
        const slideInPercentage = 1 - Math.pow(Math.min((time - this.startTime) / this.slideInDuration, 1), 1.5);

        Draw.color = this.endColor.toString();

        Draw.transform();

        Draw.clear();
        
        Draw.transform(1, 0, 0.8, 1, -50, 0);

        const distance = 200;

        Draw.rect(92, slideInPercentage * -distance + 45, 16, 60);
        Draw.rect(110, slideInPercentage * -distance + 45, 16, 28);
        Draw.rect(74, slideInPercentage * distance + 77, 16, 28);
        Draw.rect(slideInPercentage * distance + 74, 45, 52, 16);
        Draw.rect(slideInPercentage * -distance + 74, 89, 34, 16);

        const colorBlendFactor = Math.pow(Math.max(Math.min(((time - this.startTime) - this.fadeOutStart) / (this.fadeOutEnd - this.fadeOutStart), 1), 0), 1.5);

        const blend = this.startColor.blend(this.endColor, colorBlendFactor);

        Draw.background = blend.toString();

        if (time - this.startTime < this.fadeOutEnd) {
            window.requestAnimationFrame(this.draw.bind(this));
        } else {
            TitleScreen.init();
        }
    }
}

class TitleScreen {
    static startTime = 0;
    static enterTime = -1;

    static fadeIn = 1000;
    static fadeOut = 1000;

    static color = new Color(0xCCCCCC);
    static circleColor = new Color(0x3B4757);

    static initials = [];
    static velocities = [];

    static numDrops = 10;

    static init() {
        Draw.transform();
        this.initials.push(Math.random() * 5);
        this.velocities.push(Math.random() / 500);

        for (let i = 0; i < this.numDrops; i++) {
            this.initials.push(Math.random() * 30);
            this.initials.push(Math.random() * 5);
            this.velocities.push(Math.random() / 100 + 0.0005);
            this.velocities.push(Math.random() / 500 + 0.001);
        }

        this.startTime = document.timeline.currentTime;
        window.requestAnimationFrame(this.draw.bind(this));
    }

    static draw(time) {
        const dripsArray = [0, 0];

        for (let i = 0; i < this.initials.length; i++) {
            const x = i * 200 / (this.initials.length - 1);
            const y = this.initials[i] + this.velocities[i] * (time - this.startTime);

            dripsArray.push(x, y);
        }

        dripsArray.push(200, 0);

        Draw.clear();

        Draw.color = '#870413';

        Draw.poly(0, 0, dripsArray);

        Draw.color = Enemy.color.toString();

        const circlePercentage = Math.min((time - this.startTime) / this.fadeIn, 1);

        const radius = (1 - Math.pow((1 - circlePercentage), 3)) * 56;

        Draw.circle(100, 75, radius);

        Draw.color = this.color.toString();

        Draw.ctx.lineDashOffset = (time - this.startTime) / 100;
        Draw.ctx.setLineDash([20 * Draw.multiplier, Draw.multiplier]);
        Draw.arc(100, 75, radius + 3, 1);
        Draw.ctx.setLineDash([5 * Draw.multiplier, Draw.multiplier]);
        Draw.arc(100, 75, radius + 9, 1);
        Draw.ctx.lineDashOffset = -(time - this.startTime) / 100;
        Draw.ctx.setLineDash([10 * Draw.multiplier, Draw.multiplier]);
        Draw.arc(100, 75, radius + 6, 1);

        Draw.color = '#ffffff';

        if ((time - this.startTime) > this.fadeIn) {
            Draw.text(100, 72, 'Sanguine', 16, true, true);
            Draw.text(100, 92, 'Press [Enter] to Start', 8, true, true);
        }

        if (Key.enter && this.enterTime < 0) {
            this.enterTime = document.timeline.currentTime;
        } else if (this.enterTime > 0) {
            const alpha = Math.max((this.fadeOut - (time - this.enterTime)) / this.fadeOut, 0);

            if (Draw.ctx.globalAlpha === 0) {
                Key.update();
                Game.init();
                return;
            }

            Draw.ctx.globalAlpha = alpha;
        }

        //Remove later
        // Game.init();
        // return;

        window.requestAnimationFrame(this.draw.bind(this));
    }
}

function distance(x, y) {
    return Math.sqrt(x*x + y*y);
}

class Enemy {
    /**
     * @type {number}
     */
    x;
    /**
     * @type {number}
     */
    y;
    /**
     * @type {number}
     */
    health;
    dead = false;

    particles = [];

    static color = new Color(0xec080c);

    constructor(x, y, health) {
        this.x = x;
        this.y = y;
        this.health = health;
    }

    /**
     * @param {number} deltaTime 
     */
    draw(deltaTime, playerX, playerY) {
        if (!this.dead) {
            const x3 = this.x - 5 + playerX / 1.6 + 100;
            const y3 = this.y - 16 + playerY + 75;
            const x4 = x3 + 10;
            const y4 = y3 + 16;
            if (aabbCheck(95, 64, 105, 80, x3, y3, x4, y4)) {
                Game.health -= deltaTime / 100;
            }

            const dx = -playerX / 1.6 - this.x;
            const dy = -playerY - this.y + 5;

            const dist = distance(dx, dy) / 50;

            const angle = Math.atan2(dy, dx);
            this.x += Math.cos(angle) * deltaTime / 30 * Math.sqrt(dist);
            this.y += Math.sin(angle) * deltaTime / 30 * Math.sqrt(dist);
        }
        if (!this.dead) {Draw.rect(this.x - 5 + playerX / 1.6 + 100, this.y - 16 + playerY + 75, 10, 16)}
        if (this.particles.length < 32 && !this.dead) {
            this.particles.push({
                x: this.x - 5.5 + Math.random() * 11,
                y: this.y - 16.5 + Math.random() * 17,
                time: 0,
                iSize: 2 + Math.random() * 3,
                maxTime: Math.pow(Math.random(), 2) * 1500 + 500
            });

            const particle = this.particles[this.particles.length - 1];

            const x1 = this.x - 5;
            const y1 = this.y - 16;
            const x2 = this.x + 5;
            const y2 = this.y;

            const x3 = particle.x - particle.iSize;
            const y3 = particle.y - particle.iSize;
            const x4 = particle.x + particle.iSize;
            const y4 = particle.y + particle.iSize;

            if (x4 < x2 && x1 < x3 && y1 < y3 && y4 < y2) {
                this.particles.pop();
            }
        }

        for (let i = 0; i < this.particles.length; i++) {
            const particle = this.particles[i];

            if (this.dead) {
                particle.x -= (this.x - particle.x) * deltaTime / 1000;
                particle.y -= (this.x - particle.x) * deltaTime / 1000;
            }

            const percentage = (particle.maxTime - particle.time) / particle.maxTime;

            if (percentage < 0.2) {
                this.particles.splice(i, 1);
                i--;
            }

            const size = percentage * particle.iSize;

            if (Math.abs(size) > particle.iSize) {
                continue;
            }

            Draw.rect(
                particle.x - size * 0.5 + playerX / 1.6 + 100,
                particle.y - size * 0.5 + playerY + 75,
                size, size
            );

            particle.time += deltaTime;
        }
    }
}

/**
 * @returns {boolean}
 */
function aabbCheck(x1, y1, x2, y2, x3, y3, x4, y4) {
    return x1 < x4 && x2 > x3 && y1 < y4 && y2 > y3;
}

function isApprox(a, b, n = 0.01) {
    return Math.abs(a - b) < n;
}

class Game {
    static startTime = 0;
    static lastTime = 0;
    static x = 0;
    static y = 0;

    static health = 50;
    static maxHealth = 50;

    /**
     * @type {Enemy[]}
     */
    static enemies = [];
    static totalEnemies = 50;

    static xSpeed = 8;
    static ySpeed = 20;

    static maxSwingTime = 500;
    static swingTimer = 0;
    static playerOnTop = false;
    static swingDirection = false;
    static startAngle = 0;
    static endAngle = 0;
    static lastDirection = false; // false = left, true = right
    static minSwingAngle = Math.PI / 2;
    static maxSwingAngle = Math.PI / 1.5;
    static swingAngle = 0;

    static tileSize = 10;
    static tileDifference = 80;
    static tileEpsilon = 10;

    static kills = 0;

    static tileColor = new Color(0x3B4757);
    static playerColor = new Color(0xCCCCCC);

    static init() {
        Draw.ctx.globalAlpha = 1;
        this.startTime = document.timeline.currentTime;
        this.lastTime = document.timeline.currentTime;
        Draw.ctx.setLineDash([]);

        window.requestAnimationFrame(this.draw.bind(this));
    }

    /**
     * @param {number} deltaTime 
     */
    static swing(deltaTime) {
        const ctx = Draw.ctx;
        const multiplier = Draw.multiplier;

        const n = Math.min((this.maxSwingTime - this.swingTimer) * 3 / this.maxSwingTime, 1);
        const iN = 1 - (1 - n) * (1 - n);
        const N = n * n;

        const lowAngle = this.startAngle + N * (this.endAngle - this.startAngle);
        const highAngle = this.startAngle + iN * (this.endAngle - this.startAngle);

        const minAngle = Math.min(lowAngle, highAngle);
        const maxAngle = Math.max(lowAngle, highAngle);

        ctx.beginPath();
        ctx.moveTo(100 * multiplier, 75 * multiplier);
        ctx.lineTo(
            100 * multiplier + Math.cos(minAngle) * 50,
            75 * multiplier + Math.sin(minAngle) * 50
        );
        ctx.arc(
            100 * multiplier,
            75 * multiplier,
            50 * multiplier,
            minAngle, maxAngle
        );
        ctx.lineTo(100 * multiplier, 75 * multiplier);
        ctx.closePath();
        Draw.color = Enemy.color.toString();
        ctx.fill();

        let x1 = Math.cos(this.swingAngle) * 50 + 100;
        let y1 = Math.sin(this.swingAngle) * 50 + 75;
        let x2 = 100;
        let y2 = 75;

        if (isApprox(Math.abs(Math.sin(this.swingAngle)), 1)) {
            x1 = x2 - 25;
            x2 = x2 + 25;
        } else if (isApprox(Math.abs(Math.sin(this.swingAngle)), 0)) {
            y1 = y2 - 25;
            y2 = y2 + 25;
        }

        if (x2 < x1) {
            const temp = x1;
            x1 = x2;
            x2 = temp;
        }

        if (y2 < y1) {
            const temp = y1;
            y1 = y2;
            y2 = temp;
        }

        Draw.ctx.globalAlpha = 1;

        for (let i = 0; i < this.enemies.length; i++) {
            const x3 = this.enemies[i].x - 5 + this.x / 1.6 + 100;
            const y3 = this.enemies[i].y - 16 + this.y + 75;
            const x4 = x3 + 10;
            const y4 = y3 + 16;
            
            if (n < 1 && aabbCheck(x1, y1, x2, y2, x3, y3, x4, y4)) {
                this.enemies[i].health -= deltaTime * 0.1;
                if (this.enemies[i].health <= 0 && !this.enemies[i].dead) {
                    this.enemies[i].dead = true;
                    this.health += 6;
                    this.kills++;
                    this.health = Math.min(this.health, this.maxHealth);
                }
            }
        }

        this.swingTimer = Math.max(this.swingTimer - deltaTime, 0);
    }

    static draw(time) {
        const deltaTime = time - this.lastTime;
        this.lastTime = time;

        this.update(deltaTime);

        Draw.clear();

        Draw.color = this.tileColor.toString();

        Draw.ctx.globalAlpha = 0.5;

        for (let i = 0; i < (150 + this.tileDifference) / this.tileSize + 1; i++) {
            const y1 = i * this.tileSize * 2 + (this.y % (this.tileSize * 2)) - this.tileDifference / 2;
            const y2 = i * this.tileSize * 2 - this.tileDifference * 1.5 + (this.y % (this.tileSize * 2));

            const div = this.x / 4.4 % 20;

            Draw.line(-this.tileEpsilon, y1 + div, 200 + this.tileEpsilon, y2 + div, this.tileSize);
            Draw.line(-this.tileEpsilon, y2 - div, 200 + this.tileEpsilon, y1 - div, this.tileSize);
        }

        Draw.ctx.globalAlpha = 1;

        Draw.color = Enemy.color.toString();
        for (let i = 0; i < this.enemies.length; i++) {
            this.enemies[i].draw(deltaTime, this.x, this.y);
        }

        if (!this.playerOnTop && this.swingTimer > 0) {
            this.swing(deltaTime);
        }

        Draw.color = this.playerColor.toString();

        Draw.rect(95, 64, 10, 16);

        if (this.playerOnTop && this.swingTimer > 0) {
            this.swing(deltaTime);
        }

        Draw.color = this.tileColor.toString();

        Draw.rect(50, 143, 100, 7);

        Draw.color = Enemy.color.toString();
        
        Draw.rect(50, 143, 100 * this.health / this.maxHealth, 7);

        window.requestAnimationFrame(this.draw.bind(this));
    }

    /**
     * @param {number} deltaTime 
     */
    static update(deltaTime) {
        if (this.health <= 0) {
            Draw.background = Enemy.color.toString();
            Draw.clear();
            Draw.color = '#ffffff';
            Draw.text(100, 70, 'You Died!', 20, true, true);
            Draw.text(100, 90, `Kills: ${this.kills}`, 10, true, true);
            throw new Error('You died');
        }
        if (this.enemies.length < this.totalEnemies) {

            for (let i = this.enemies.length; i < this.totalEnemies; i++) {
                const r = Math.pow(Math.random(), 2) * 500 + 150;
                const theta = Math.random() * Math.PI * 2;

                this.enemies.push(new Enemy(r * Math.cos(theta) + this.x, r * Math.sin(theta) + this.y, 20));
            }
        }

        for (let i = 0; i < this.enemies.length; i++) {
            if (this.enemies[i].dead && this.enemies[i].particles.length === 0) {
                this.enemies.splice(i, 1);
            }
        }

        let dy = 0;
        let dx = 0;

        if (Key.w || Key.arrowUp) {
            dy += deltaTime / this.ySpeed;
        }
        if (Key.s || Key.arrowDown) {
            dy -= deltaTime / this.ySpeed;
        }
        if (Key.a || Key.arrowLeft) {
            dx += deltaTime / this.xSpeed;
            this.lastDirection = true;
        }
        if (Key.d || Key.arrowRight) {
            dx -= deltaTime / this.xSpeed;
            this.lastDirection = false;
        }

        this.x += dx;
        this.y += dy;

        if (Key.update().enter) {
            if (this.swingTimer === 0) {
                this.swingTimer = this.maxSwingTime;
                let angle = Math.PI * this.lastDirection; // God awful code
                if (dy !== 0 || dx !== 0) {
                    angle = Math.atan2(-dy, -dx);
                }

                this.swingAngle = angle;

                this.playerOnTop = dy < 0;

                this.swingDirection = !this.swingDirection;

                const offset = dx === 0 && dy !== 0 ? this.maxSwingAngle : this.minSwingAngle;
                
                this.startAngle = angle + offset * 0.5;
                this.endAngle = angle - offset * 0.5;

                if (this.swingDirection) {
                    const temp = this.startAngle;
                    this.startAngle = this.endAngle;
                    this.endAngle = temp;
                }

                this.health -= 7;
            }
        }
    }
}

IntroScreen.draw(document.timeline.currentTime);