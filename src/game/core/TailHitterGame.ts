import { Player, world } from "@minecraft/server";
import { Game, GameConfig } from "./Game";
import { runCommand } from "../utils/functions";

interface TailHitterConfig extends GameConfig {
    spawnPoint?: { x: number; y: number; z: number };
    arenaSize?: { width: number; length: number };
}

export class TailHitterGame extends Game {
    private readonly spawnPoint: { x: number; y: number; z: number };
    private readonly arenaSize: { width: number; length: number };
    private readonly playerProperty = "ao:tailhitter";
    private readonly tag = "ao:tailhitter";
    private readonly tailTag = "ao:tail";

    constructor(config: TailHitterConfig) {
        super(config);
        this.spawnPoint = config.spawnPoint || { x: 0, y: 0, z: 0 };
        this.arenaSize = config.arenaSize || { width: 10, length: 10 };
    }

    protected initialize(): void {
        runCommand("structure load mystructure:tailmap 0 0 0");
        runCommand("event entity @e ao:despawn");
        runCommand(`tag @a remove ${this.tag}`);

        // Setup players and their tails
        world.getPlayers().forEach(player => {
            player.addTag(this.tag);
            player.setDynamicProperty(this.playerProperty, 1);
            player.teleport({
                x: this.spawnPoint.x,
                y: this.spawnPoint.y,
                z: this.spawnPoint.z
            });

            // Spawn tail entity for each player
            const tail = world.getDimension("overworld").spawnEntity(
                "ao:tail",
                player.location
            );
            tail.addTag(player.name);
            tail.addTag(this.tailTag);
        });
    }

    protected gameLoop(): void {
        // Main game loop
        this.addLoop(() => {
            this.checkWinCondition();
            this.updateTails();
            this.checkPlayerCollisions();
            this.setActionBar(`Rounds: ${this.getRounds()}`);
        }, 0);
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
        runCommand("structure load mystructure:tailmap 0 0 0");
        runCommand("event entity @e ao:despawn");

        world.getPlayers().forEach(player => {
            if (player.hasTag(this.tag)) {
                player.setDynamicProperty(this.playerProperty, 1);
                player.teleport({
                    x: this.spawnPoint.x,
                    y: this.spawnPoint.y,
                    z: this.spawnPoint.z
                });

                // Respawn tail entity
                const tail = world.getDimension("overworld").spawnEntity(
                    "ao:tail",
                    player.location
                );
                tail.addTag(player.name);
                tail.addTag(this.tailTag);
            }
        });
    }

    private updateTails(): void {
        world.getPlayers().forEach(player => {
            if (!player.hasTag(this.tag)) return;

            const tail = world.getDimension("overworld")
                .getEntities()
                .find(e => e.hasTag(player.name) && e.hasTag(this.tailTag));

            if (tail) {
                // Update tail position to follow player with a delay
                const dx = player.location.x - tail.location.x;
                const dy = player.location.y - tail.location.y;
                const dz = player.location.z - tail.location.z;

                tail.teleport({
                    x: tail.location.x + dx * 0.1,
                    y: tail.location.y + dy * 0.1,
                    z: tail.location.z + dz * 0.1
                });
            }
        });
    }

    private checkPlayerCollisions(): void {
        const playingPlayers = this.getPlayingPlayers();

        playingPlayers.forEach(player => {
            // Check if player is out of bounds
            const outOfBounds = 
                Math.abs(player.location.x - this.spawnPoint.x) > this.arenaSize.width / 2 ||
                Math.abs(player.location.z - this.spawnPoint.z) > this.arenaSize.length / 2;

            if (outOfBounds) {
                this.eliminatePlayer(player);
                return;
            }

            // Check collision with other players' tails
            const nearbyTails = world.getDimension("overworld").getEntities({
                location: player.location,
                maxDistance: 1,
                tags: [this.tailTag]
            });

            nearbyTails.forEach(tail => {
                if (!tail.hasTag(player.name) && player.getDynamicProperty(this.playerProperty) === 1) {
                    this.eliminatePlayer(player);
                }
            });
        });
    }

    private eliminatePlayer(player: Player): void {
        player.setDynamicProperty(this.playerProperty, 0);
        world.sendMessage(`${player.name}: Got knocked Out!`);

        // Remove player's tail
        const tail = world.getDimension("overworld")
            .getEntities()
            .find(e => e.hasTag(player.name) && e.hasTag(this.tailTag));

        if (tail) {
            tail.triggerEvent("ao:despawn");
        }
    }
}