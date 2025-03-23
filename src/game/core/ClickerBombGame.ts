import { Player, world, system, ItemStack, EntityInventoryComponent } from "@minecraft/server";
import { Game, GameConfig } from "./Game";
import { runCommand } from "../utils/functions";
import { getAllPlayers } from "game/utils/FunctionUtils";
import { ClickScene } from "cutscenes/start";

interface ClickerBombConfig extends GameConfig {
    spawnPoints?: Array<{ x: number; y: number; z: number; facing?: { x: number; y: number; z: number } }>;
    maxBombValue?: number;
}
export class ClickerBombGame extends Game {
    private readonly spawnPoints: Array<{ x: number; y: number; z: number; facing?: { x: number; y: number; z: number } }>;
    private readonly maxBombValue: number;
    private readonly playerProperty = "ao:clicker";
    private readonly tag = "ao:clicker";

    private bombValue = 0;
    private currentPlayerIndex = 0;
    private targetValue: number;
    private canInteract = true;
    private config: ClickerBombConfig;
    constructor(config: ClickerBombConfig) {
        super(config);
        this.config = config;
        this.spawnPoints = config.spawnPoints || [
            { x: 86, y: -46, z: 119, facing: { x: 87, y: -46, z: 119 } },
            { x: 86, y: -46, z: 121, facing: { x: 87, y: -46, z: 121 } },
            { x: 82, y: -46, z: 123, facing: { x: 82, y: -46, z: 125 } },
            { x: 82, y: -46, z: 119, facing: { x: 81, y: -46, z: 119 } },
            { x: 82, y: -46, z: 121, facing: { x: 81, y: -46, z: 121 } },
            { x: 82, y: -46, z: 123, facing: { x: 81, y: -46, z: 121 } }
        ];
        this.maxBombValue = config.maxBombValue || 30;
        this.targetValue = Math.floor(Math.random() * this.maxBombValue);
        system.afterEvents.scriptEventReceive.subscribe(event => {
            if (event.id === "ao:game" && event.message === this.config.name) {
                this.start()
            }
        });
    }

    protected initialize(): void {
        runCommand("structure load mystructure:map 0 0 0");
        runCommand("event entity @e ao:despawn");
        getAllPlayers().map(player => {
            player.setDynamicProperty(this.playerProperty, 1);
            player.addTag(this.tag);
            player.inputPermissions.cameraEnabled = false;
            player.inputPermissions.movementEnabled = false;
        })

        const scoreboard = world.scoreboard.getObjective(this.scoreboardId);
        // Setup players
        const players = this.getPlayingPlayers();

        players.forEach((player, index) => {
            if (index < this.spawnPoints.length) {
                const spawnPoint = this.spawnPoints[index];
                player.teleport(
                    { x: spawnPoint.x, y: spawnPoint.y, z: spawnPoint.z }, {facingLocation: spawnPoint.facing || { x: 0, y: 0, z: 0 }}
                );
            }
            scoreboard.setScore(player, 0);
        });

        // Give items to first player
        if (players.length > 0) {
            this.giveItems(players[0]);
        }
    }

    protected gameLoop(): void {
        // Main game loop
        this.addLoop(() => {
            this.checkWinCondition();
            this.setActionBar(`Current Value: ${this.bombValue} | Target: ???`);
        }, 0);

        // Setup event handlers
        this.setupEventHandlers();
    }

    private setupEventHandlers(): void {
        world.afterEvents.itemUse.subscribe((event) => {
            const player = event.source;
            if (!player.hasTag(this.tag)) return;

            const currentPlayer = this.getPlayingPlayers()[this.currentPlayerIndex];
            console.error(this.currentPlayerIndex, player, currentPlayer, this.getPlayingPlayers()[0].name)
            if (player !== currentPlayer || !this.canInteract) return;

            const item = event.itemStack;
            if (!item) return;

            let points = 0;
            switch (item.typeId) {
                case "minecraft:stone_sword":
                    points = 1;
                    break;
                case "minecraft:golden_sword":
                    points = 2;
                    break;
                case "minecraft:diamond_sword":
                    points = 3;
                    break;
                default:
                    return;
            }

            this.handlePlayerAction(player, points);
        });
    }

    private  async handlePlayerAction(player: Player, points: number): Promise<void> {
        this.canInteract = false;
        this.bombValue += points;

        if (this.bombValue > this.targetValue) {
            await this.eliminatePlayer(player).then(() => {
                if (this.getPlayingPlayers().length <= 1) {
                    getAllPlayers().map(player => {
                        player.removeTag(this.tag);
                        player.setDynamicProperty(this.playerProperty, 0);
                        player.inputPermissions.cameraEnabled = true;
                        player.inputPermissions.movementEnabled = true;
                        this.end();
                    });
                }
            });
            this.bombValue = 0;
            this.targetValue = Math.floor(Math.random() * this.maxBombValue);
        }

        this.moveToNextPlayer();
        system.runTimeout(() => {
            this.canInteract = true;
        }, 5);
    }

    private moveToNextPlayer(): void {
        const players = this.getPlayingPlayers();
        if (players.length === 0) return;

        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % players.length;
        const nextPlayer = players[this.currentPlayerIndex];
        this.giveItems(nextPlayer);

        nextPlayer.runCommand("/camera @s set minecraft:free ease 0.5 in_sine pos ^^2^5 facing @s");
        world.playSound("note.pling", nextPlayer.location);
    }

    private getPlayingPlayers(): Player[] {
        return world.getPlayers().filter(
            player => player.hasTag(this.tag) && player.getDynamicProperty(this.playerProperty) === 1
        );
    }

    private async eliminatePlayer(player: Player): Promise<number[]> {
        player.setDynamicProperty(this.playerProperty, 0);
        world.sendMessage(`${player.name} got eliminated!`);
        player.runCommand("clear @s")
        return await ClickScene.init(0);
    }

    private giveItems(player: Player): void {
        const inventory = player.getComponent("inventory") as EntityInventoryComponent;
        if (!inventory) return;

        const container = inventory.container;
        if (!container) return;

        let sword = new ItemStack("minecraft:stone_sword", 1);
        sword.nameTag = "Add 1 Point";
        container.setItem(0, sword);

        let axe = new ItemStack("minecraft:golden_sword", 1);
        axe.nameTag = "Add 2 Points";
        container.setItem(1, axe);

        let bow = new ItemStack("minecraft:diamond_sword", 1);
        bow.nameTag = "Add 3 Points";
        container.setItem(2, bow);
    }

    private resetRound(): void {
        this.bombValue = 0;
        this.targetValue = Math.floor(Math.random() * this.maxBombValue);
        this.currentPlayerIndex = 0;
        this.canInteract = true;
    }

    private async checkWinCondition(): Promise<void> {
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
            getAllPlayers().forEach(player => {
                player.inputPermissions.cameraEnabled = true;
                player.inputPermissions.movementEnabled = true;
            });
            this.end();
        }
    }
}