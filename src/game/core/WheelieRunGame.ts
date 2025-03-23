import { EntityInventoryComponent, ItemStack, ItemStartUseAfterEvent, Player, world } from "@minecraft/server";
import { Game, GameConfig } from "./Game";
import { runCommand } from "../utils/functions";

interface WheelieRunConfig extends GameConfig {
    wheelieEntity?: {
        typeId: string;
        property: string;
        value: number;
    };
}
export class WheelieRunGame extends Game {
    private readonly wheelieEntity: {
        typeId: string;
        property: string;
        value: number;
    };
    private readonly playerProperty = "ao:wheelie";
    private readonly tag = "ao:wheelie";
    private itemTimer = 10;
    private readonly items = [
        { id: "minecraft:slime_ball", name: "Use item to\nLevitate" },
        { id: "minecraft:shulker_shell", name: "Use item to\nReset some Blocks" }
    ];

    constructor(config: WheelieRunConfig) {
        super(config);
        this.wheelieEntity = config.wheelieEntity || {
            typeId: "ao:rideable",
            property: "ao:type",
            value: 0
        };
    }

    protected initialize(): void {
        runCommand("structure load mystructure:map 66 -49 105");
        runCommand("event entity @e ao:despawn");
        runCommand(`tag @a remove ${this.tag}`);

        // Setup players and their wheelies
        world.getPlayers().forEach(player => {
            player.addTag(this.tag);
            player.setDynamicProperty(this.playerProperty, 1);
            
            const entity = world.getDimension("overworld").spawnEntity(
                this.wheelieEntity.typeId,
                player.location
            );
            
            entity.addTag(player.name);
            player.runCommandAsync(`ride @s start_riding @e[tag="${player.name}"] teleport_ride`);
        });
    }

    protected gameLoop(): void {
        // Main game loop
        this.addLoop(() => {
            this.checkWinCondition();
            this.updateBlocks();
            this.checkPlayerStatus();
            this.setActionBar(`Rounds: ${this.getRounds()} Timer: ${this.itemTimer}`);
        }, 0);

        // Item distribution loop
        this.addLoop(() => {
            if (this.itemTimer > 0) {
                this.itemTimer--;
            } else {
                this.distributeItems();
                this.itemTimer = 10;
            }
        }, 40);

        // Block color change loop
        this.addLoop(() => {
            this.updateBlockColors();
        }, 60);

        // Setup item use handler
        this.setupItemHandlers();
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
        runCommand("structure load mystructure:map 66 -49 105");
        runCommand("tp @a 82 -48 120");
        runCommand("event entity @e ao:despawn");

        world.getPlayers().forEach(player => {
            if (player.hasTag(this.tag)) {
                const entity = world.getDimension("overworld").spawnEntity(
                    this.wheelieEntity.typeId,
                    player.location
                );
                entity.addTag(player.name);
                player.setDynamicProperty(this.playerProperty, 1);
                player.runCommandAsync(
                    `ride @s start_riding @e[tag="${player.name}"] teleport_ride`
                );
            }
        });
    }

    private distributeItems(): void {
        world.getPlayers().forEach(player => {
            const randomIndex = Math.floor(Math.random() * this.items.length);
            const item = new ItemStack(this.items[randomIndex].id, 1);
            item.nameTag = this.items[randomIndex].name;
            
            const inventory = player.getComponent("inventory") as EntityInventoryComponent;
            if (inventory) {
                const container = inventory.container;
                if (container) {
                    container.setItem(3, item);
                }
            }
        });
    }

    private updateBlockColors(): void {
        const commands = [
            "fill 64 -49 101 104 -49 141 yellow_concrete replace lime_concrete",
            "fill 64 -49 101 104 -49 141 orange_concrete replace yellow_concrete",
            "fill 64 -49 101 104 -49 141 red_concrete replace orange_concrete"
        ];

        commands.forEach(cmd => {
            runCommand(cmd);
        });
    }

    private setupItemHandlers(): void {
        world.afterEvents.itemUse.subscribe((event: ItemStartUseAfterEvent) => {
            const item = event.itemStack;
            if (!item) return;

            if (item.typeId === this.items[0].id) {
                const wheelie = world.getDimension("overworld")
                    .getEntities()
                    .find(e => e.typeId === this.wheelieEntity.typeId && e.hasTag(event.source.name));

                if (wheelie) {
                    wheelie.runCommandAsync("effect @s levitation 1 3");
                    event.source.runCommand(`clear @s ${this.items[0].id}`);
                }
            } else if (item.typeId === this.items[1].id) {
                const position = "~-3 ~-2 ~-3 ~3 ~ ~3";
                event.source.runCommand(`fill ${position} sand replace lime_concrete`);
                event.source.runCommand(`fill ${position} sand replace yellow_concrete`);
                event.source.runCommand(`fill ${position} sand replace orange_concrete`);
                event.source.runCommand(`fill ${position} sand replace red_concrete`);
                event.source.runCommand(`clear @s ${this.items[1].id}`);
            }
        });
    }

    private checkPlayerStatus(): void {
        world.getPlayers().forEach(player => {
            const block = world.getDimension("overworld").getBlock({
                x: player.location.x,
                y: player.location.y - 1,
                z: player.location.z
            });

            if ((block.typeId === "minecraft:red_concrete" || 
                 block.typeId === "minecraft:blackstone") && 
                player.getDynamicProperty(this.playerProperty) === 1) {
                player.setDynamicProperty(this.playerProperty, 0);
                world.sendMessage(`${player.name}: Got knocked Out!`);
            }

            const wheelie = world.getDimension("overworld")
                .getEntities()
                .find(e => e.typeId === this.wheelieEntity.typeId && e.hasTag(player.name));

            if (wheelie) {
                const distance = Math.sqrt(
                    Math.pow(player.location.x - wheelie.location.x, 2) +
                    Math.pow(player.location.y - wheelie.location.y, 2) +
                    Math.pow(player.location.z - wheelie.location.z, 2)
                );

                if (distance > 2) {
                    player.setDynamicProperty(this.playerProperty, 0);
                    world.sendMessage(`${player.name}: Got knocked Out!`);
                }
            }
        });
    }

    private updateBlocks(): void {
        const wheelies = world.getDimension("overworld")
            .getEntities()
            .filter(e => e.typeId === this.wheelieEntity.typeId);

        wheelies.forEach(wheelie => {
            wheelie.runCommandAsync(
                "execute if block ~ ~-1 ~ sand run setblock ~ ~-1 ~ minecraft:lime_concrete"
            );
        });
    }
}