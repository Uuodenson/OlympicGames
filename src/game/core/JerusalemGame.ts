import { Player, world } from "@minecraft/server";
import { Game, GameConfig } from "./Game";
import { runCommand } from "../utils/functions";

interface JerusalemConfig extends GameConfig {
    spawnPoint?: { x: number; y: number; z: number };
    arenaSize?: { width: number; length: number };
}

export class JerusalemGame extends Game {
    private readonly spawnPoint: { x: number; y: number; z: number };
    private readonly arenaSize: { width: number; length: number };
    private readonly playerProperty = "ao:jerusalem";
    private readonly tag = "ao:jerusalem";

    constructor(config: JerusalemConfig) {
        super(config);
        this.spawnPoint = config.spawnPoint || { x: 0, y: 0, z: 0 };
        this.arenaSize = config.arenaSize || { width: 10, length: 10 };
    }

    protected initialize(): void {
        runCommand("structure load mystructure:jerusalem 0 0 0");
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
        });
    }

    protected gameLoop(): void {
        // Main game loop
        this.addLoop(() => {
            this.checkWinCondition();
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
        runCommand("structure load mystructure:jerusalem 0 0 0");
        
        world.getPlayers().forEach(player => {
            if (player.hasTag(this.tag)) {
                player.setDynamicProperty(this.playerProperty, 1);
                player.teleport({
                    x: this.spawnPoint.x,
                    y: this.spawnPoint.y,
                    z: this.spawnPoint.z
                });
            }
        });
    }

    private setupEventHandlers(): void {
        // Add game-specific event handlers here
    }

    private checkPlayerStatus(): void {
        world.getPlayers().forEach(player => {
            // Check if player is out of bounds
            const outOfBounds = 
                Math.abs(player.location.x - this.spawnPoint.x) > this.arenaSize.width / 2 ||
                Math.abs(player.location.z - this.spawnPoint.z) > this.arenaSize.length / 2;

            if (outOfBounds && player.getDynamicProperty(this.playerProperty) === 1) {
                player.setDynamicProperty(this.playerProperty, 0);
                world.sendMessage(`${player.name}: Got knocked Out!`);
            }

            // Add more game-specific player status checks here
        });
    }
}