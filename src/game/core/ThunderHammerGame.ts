import { Player, system, world } from "@minecraft/server";
import { Game, GameConfig } from "./Game";
import { runCommand } from "../utils/functions";

interface ThunderHammerConfig extends GameConfig {
    spawnPoint?: { x: number; y: number; z: number };
    arenaSize?: { width: number; length: number };
}

export class ThunderHammerGame extends Game {
    private readonly spawnPoint: { x: number; y: number; z: number };
    private readonly arenaSize: { width: number; length: number };
    private readonly playerProperty = "ao:thunder";
    private readonly tag = "ao:thunder";
    private readonly hammerTag = "ao:hammer";
    private readonly hammerCooldown = 60;
    private playerCooldowns: Map<string, number> = new Map();
    private config: ThunderHammerConfig;
    constructor(config: ThunderHammerConfig) {
        super(config);
        this.config = config;
        this.spawnPoint = config.spawnPoint || { x: 85, y: -48, z: 123 };
        this.arenaSize = config.arenaSize || { width: 10, length: 10 };
        system.afterEvents.scriptEventReceive.subscribe((event) => {
            if (event.id === "ao:game" && event.message == this.config.name) {
                this.start()
            }
        });
    }

    protected initialize(): void {
        runCommand("structure load mystructure:thunder 67 -48 106");
        runCommand("event entity @e ao:despawn");
        runCommand(`tag @a remove ${this.tag}`);

        // Setup players
        world.getPlayers().forEach(player => {
            player.addTag(this.tag);
            player.setDynamicProperty(this.playerProperty, 1);
            player.teleport({
                x: this.spawnPoint.x,
                y: this.spawnPoint.y,
                z: this.spawnPoint.z
            });
            this.giveHammer(player);
        });
    }

    protected gameLoop(): void {
        // Main game loop
        this.addLoop(() => {
            this.checkWinCondition();
            this.updateCooldowns();
            this.checkPlayerStatus();
            this.setActionBar(`Rounds: ${this.getRounds()}`);
        }, 0);

        // Setup event handlers
        this.setupEventHandlers();
    }

    private checkWinCondition(): void {
        const playingPlayers = this.getPlayingPlayers();
        if (playingPlayers.length <= 1 && this.getRounds() >= 1) {
            if (playingPlayers[0]) {
                const objective = world.scoreboard.getObjective(this.scoreboardId);
                if (!objective) return;
                objective.addScore(playingPlayers[0], 1);
                this.resetRound();
            }
        } else if (this.getRounds() < 1) {
            const winner = this.getWinner();
            if (winner) {
                this.announceWinner(winner);
            }
            this.end();
        }
    }

    private getPlayingPlayers(): Player[] {
        return world.getPlayers().filter(
            player => player.getDynamicProperty(this.playerProperty) === 1
        );
    }

    private resetRound(): void {
        this.decrementRounds();
        runCommand("structure load mystructure:thunder 0 0 0");
        runCommand("event entity @e ao:despawn");

        world.getPlayers().forEach(player => {
            if (player.hasTag(this.tag)) {
                player.setDynamicProperty(this.playerProperty, 1);
                player.teleport({
                    x: this.spawnPoint.x,
                    y: this.spawnPoint.y,
                    z: this.spawnPoint.z
                });
                this.giveHammer(player);
            }
        });
        this.playerCooldowns.clear();
    }

    private setupEventHandlers(): void {
        world.afterEvents.itemUse.subscribe((event) => {
            const player = event.source;
            if (!player.hasTag(this.tag)) return;
            const coolodwn = this.playerCooldowns.get(player.name)
            if (!coolodwn) return;
            const item = event.itemStack;
            if ((!item)) return;
            if (coolodwn > 0) {
                player.onScreenDisplay.setActionBar("Hammer is on cooldown!");
                return;
            }

            // Create thunder effect
            const location = player.location;
            runCommand(`summon lightning_bolt ${location.x} ${location.y} ${location.z}`);

            // Check for nearby players
            const nearbyPlayers = world.getPlayers().filter(p => 
                p !== player && 
                p.getDynamicProperty(this.playerProperty) === 1 &&
                this.getDistance(p.location, location) <= 3
            );

            nearbyPlayers.forEach(p => this.eliminatePlayer(p));
            this.playerCooldowns.set(player.name, this.hammerCooldown);
        });
    }

    private updateCooldowns(): void {
        for (const [player, cooldown] of this.playerCooldowns.entries()) {
            if (cooldown > 0) {
                this.playerCooldowns.set(player, cooldown - 1);
            }
        }
    }

    private checkPlayerStatus(): void {
        world.getPlayers().forEach(player => {
            // Check if player is out of bounds
            const outOfBounds = 
                Math.abs(player.location.x - this.spawnPoint.x) > this.arenaSize.width / 2 ||
                Math.abs(player.location.z - this.spawnPoint.z) > this.arenaSize.length / 2;

            if (outOfBounds && player.getDynamicProperty(this.playerProperty) === 1) {
                this.eliminatePlayer(player);
            }
        });
    }

    private eliminatePlayer(player: Player): void {
        player.setDynamicProperty(this.playerProperty, 0);
        world.sendMessage(`${player.name}: Got knocked Out!`);
        player.runCommand(`clear @s`);
    }

    private giveHammer(player: Player): void {
        player.runCommand(`give @s trident 1`);
    }

    private getDistance(pos1: { x: number; y: number; z: number }, pos2: { x: number; y: number; z: number }): number {
        return Math.sqrt(
            Math.pow(pos1.x - pos2.x, 2) +
            Math.pow(pos1.y - pos2.y, 2) +
            Math.pow(pos1.z - pos2.z, 2)
        );
    }
}