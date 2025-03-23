import { DimensionType, DimensionTypes, Player, system, world } from "@minecraft/server";
import { Game, GameConfig } from "./Game";
import { runCommand } from "../utils/functions";
import { getAllPlayers } from "game/utils/FunctionUtils";
import { data } from "game/utils/loaddata";

interface RingConfig extends GameConfig {
    ringSpawnPoints?: { x: number; y: number; z: number }[];
    playerSpawnPoint?: { x: number; y: number; z: number };
    fine: number;
    finemultiplier: number;
}

export class RingGame extends Game {
    private readonly ringSpawnPoints: { x: number; y: number; z: number }[];
    private readonly playerSpawnPoint: { x: number; y: number; z: number };
    private readonly playerProperty = "ao:ring";
    private readonly playerRings: Map<Player, number> = new Map();
    private readonly tag = "ao:ring";
    private readonly ringTag = "ao:ring_point";
    private ringTimer : number;
    private readonly centerRingPoint = { x: 86, y: -48, z: 124 };
    private readonly ringRadius = 6;
    private readonly numRings = 8;
    private readonly config: RingConfig;
    private floatTimer = 0;
    private readonly floatAmplitude = 0.5;
    private readonly floatSpeed = 0.05;

    constructor(config: RingConfig) {
        super(config);
        this.config = config
        this.ringSpawnPoints = this.calculateRingPositions();
        this.playerSpawnPoint = config.playerSpawnPoint || this.centerRingPoint;
        system.afterEvents.scriptEventReceive.subscribe(event => {
            if (event.id === "ao:game" && event.message === this.config.name) {
                this.start()
            }
        });
    }

    private calculateRingPositions(): { x: number; y: number; z: number }[] {
        const positions = [];
        // Add center golden ring
        positions.push(this.centerRingPoint);
        const raidus = Math.ceil(Math.random()*8) + 3;
        // Calculate positions for 8 rings in a circle
        for (let i = 0; i < this.numRings; i++) {
            const angle = (i / this.numRings) * raidus * Math.PI;
            const x = this.centerRingPoint.x + Math.cos(angle) * this.ringRadius;
            const z = this.centerRingPoint.z + Math.sin(angle) * this.ringRadius;
            positions.push({
                x: Math.round(x),
                y: this.centerRingPoint.y,
                z: Math.round(z)
            });
        }
        return positions;
    }

    protected initialize(): void {
        runCommand("structure load mystructure:ring_point 86 -48 124");
        runCommand("event entity @e despawn");
        runCommand(`tag @a remove ${this.tag}`);
        // Setup players as cannons
        world.getPlayers().forEach(player => {
            player.addTag(this.tag);
            player.setDynamicProperty(this.playerProperty, 0);
            const upperPlayerPostion = this.playerSpawnPoint.y + 2;
            player.teleport({x: this.playerSpawnPoint.x, y: upperPlayerPostion, z: this.playerSpawnPoint.z});
            // Transform player into cannon
            player.setDynamicProperty("ao:is_cannon", true);
        });
        this.ringTimer = this.config.timer;
        this.spawnRings();
    }

    protected gameLoop(): void {
        // Main game loop
        this.addLoop(() => {
            this.checkWinCondition();
            this.checkRingCollection();
            const text_content = JSON.stringify(`Rounds: ${this.getRounds()} Timer: ${this.ringTimer}`);
            this.setActionBar(text_content);
            this.updateRingFloating();
        }, 0);

        // Ring respawn loop
        this.addLoop(() => {
            this.spawnRings();
        }, 200);
        this.addLoop(() => {
            this.updateTimer();
            this.canonSystem();
        }, 20);
    }

    private checkWinCondition(): void {
        if (this.ringTimer <= 0) {
            const winner = this.getWinner();
            if (winner) {
                this.announceWinner(winner);
            }
            if (this.rounds > 1) {
                this.resetRound();
            } else {
                this.end();
            }
        }
    }

    private updateTimer(): void {
        if (this.ringTimer > 0) {
            this.ringTimer--;
        }
    }

    private resetRound(): void {
        this.decrementRounds();
        this.ringTimer = this.config.timer;

        runCommand("structure load mystructure:ring_point 86 -48 124");
        runCommand("event entity @e despawn");

        world.getPlayers().forEach(player => {
            if (player.hasTag(this.tag)) {
                player.setDynamicProperty(this.playerProperty, 0);
                player.teleport(this.playerSpawnPoint);
            }
        });

        this.spawnRings();
    }

    private spawnRings(): void {
        this.ringSpawnPoints.forEach((point, index) => {
            const entities = world.getDimension("overworld").getEntities({
                location: { x: point.x, y: point.y + Math.sin(this.floatTimer) * this.floatAmplitude, z: point.z },
                maxDistance: 2,
                tags: [this.ringTag]
            });

            if (entities.length === 0) {
                let randomId = Math.floor(Math.random() * 2) + 1;
                if (index === 0) {
                    randomId = 3;
                }
                const ring = world.getDimension("overworld").spawnEntity(
                    "ao:ring",
                    point
                );
                ring.setProperty("ao:type", randomId);
                ring.setDynamicProperty("baseY", point.y);
                ring.addTag(this.ringTag);
            }
        });
    }

    private checkRingCollection(): void {
        world.getPlayers().forEach(player => {
            if (!player.hasTag(this.tag)) return;

            const nearbyRings = world.getDimension("overworld").getEntities({
                location: player.location,
                maxDistance: 2,
                tags: [this.ringTag]
            });

            nearbyRings.forEach(ring => {
                let type = ring.getProperty("ao:type") as number || 0;
                type += 1;
                const score = player.getDynamicProperty(this.playerProperty) as number;
                const boardscore = world.scoreboard.getObjective(this.config.scoreboardId).getScore(player)
                world.scoreboard.getObjective(this.config.scoreboardId).setScore(player, boardscore + Math.ceil(this.config.finemultiplier) * type);
                player.setDynamicProperty(this.playerProperty, score + 1);
                if (!this.playerRings.has(player)) {this.playerRings.set(player, 0)};
                this.playerRings.set(player, this.playerRings.get(player)+ 1);
                ring.triggerEvent("despawn");            
                // Apply levitation effect when collecting ring
                const view = player.getViewDirection();
                player.applyKnockback(view.x, view.y, 2.35, 0.5);
                const otherPlayers = getAllPlayers().filter(p => p !== player);
                otherPlayers.forEach(p => {
                    const score = world.scoreboard.getObjective(this.config.scoreboardId).getScore(p)
                    world.scoreboard.getObjective(this.config.scoreboardId).setScore(p, score - Math.ceil(this.config.fine));
                })
                world.sendMessage(`${player.name} collected a ring! Score: ${score + 1} ${this.playerRings.get(player)}`);
                if(this.playerRings.get(player) >= 5){
                    player.setProperty("ao:skin_id", 1)
                    this.playerRings.set(player, 0)
                }
            });
        });
    }

    private updateRingFloating(): void {
        this.floatTimer += this.floatSpeed;
        const entities = world.getDimension("overworld").getEntities({
            tags: [this.ringTag]
        });
        entities.forEach(ring => {
            const currentPos = ring.location;
            ring.runCommandAsync(`tp @s ${currentPos.x} ${ring.getDynamicProperty("baseY") as number + Math.sin(this.floatTimer) * this.floatAmplitude} ${currentPos.z}`)
        });
    }

    private canonSystem(): void{
        getAllPlayers().forEach(player => {
            if (player.getProperty("ao:skin_id") === 1 && player.isSneaking) {
                const view = player.getViewDirection();
                player.applyKnockback(view.x, view.z, 4, 0.5);
                player.setProperty("ao:skin_id", 0)
            }
        });
    }
}