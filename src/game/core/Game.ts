import { Player, system, world } from "@minecraft/server";
import { gameEvents } from "../Events";
import { getAllPlayers, getOwner, runCommand } from "../utils/functions";
import { data, getPlayerData } from "game/utils/loaddata";
import { ActionFormData } from "@minecraft/server-ui";
import { LevelSys } from "./LevelSystem";

export interface GameConfig {
    name: string;
    rounds?: number;
    scoreboardId?: string;
    defaultScore?: number;
    winCondition?: (player: Player) => boolean;
    onStart?: () => void;
    onEnd?: () => void;
    onRoundEnd?: () => void;
    timer?: number;
}

export abstract class Game {
    protected name: string;
    protected rounds: number;
    protected scoreboardId: string;
    protected defaultScore: number;
    protected loops: number[] = [];
    protected eventSubscriptions: { unsubscribe: () => void }[] = [];
    private isGameActive: boolean = false;
    private defaultRounds: number;
    constructor(config: GameConfig) {
        this.name = config.name;
        this.rounds = config.rounds || 3;
        this.scoreboardId = config.scoreboardId || `game_${this.name.toLowerCase()}`;
        this.defaultScore = config.defaultScore || 0;
        this.defaultRounds = config.rounds || 3;
    }

    
    public start(): void {
        this.isGameActive = true;
        this.setupScoreboard();
        this.initialize();
        this.gameLoop();
    }

    protected end(): void {
        if (!this.isGameActive) return;
        try {
            // Clear all running intervals first
            this.loops.forEach(loop => system.clearRun(loop));
            
            // Unsubscribe all events before showing data
            this.eventSubscriptions.forEach(sub => sub.unsubscribe());

            this.addExp(2)

            // Reset map and give rewards before showing data
            runCommand("function resetmap");
            const owner = getOwner()[0];
            if (owner) {
            }

            // Set game as inactive before showing data
            this.isGameActive = false;

            // Show player data as the final step
            const players = world.getPlayers();
            const promises = players.map(player => {
                try {
                    return this.showPlayerData(player);
                } catch (error) {
                    console.warn(`Failed to show data for player ${player.name}: ${error}`);
                    return Promise.resolve();
                }
            });

            Promise.all(promises);
        } catch (error) {
            console.warn(`Error in game end: ${error}`);
            this.isGameActive = false;
        }
    }

    protected abstract initialize(): void;
    protected abstract gameLoop(): void;

    protected setupScoreboard(): void {
        const objective = world.scoreboard.getObjective(this.scoreboardId);
        if (objective) {
            world.scoreboard.removeObjective(this.scoreboardId);
        }

        world.scoreboard.addObjective(this.scoreboardId, this.name);

        getAllPlayers().forEach(player => {
            const objective = world.scoreboard.getObjective(this.scoreboardId);
            if (!objective) return;
            objective.setScore(player, this.defaultScore);
        });

        runCommand(`scoreboard objectives setdisplay sidebar ${this.scoreboardId}`);
    }

    protected addLoop(callback: () => void, tickInterval: number = 0): void {
        const loopId = system.runInterval(callback, tickInterval);
        this.loops.push(loopId);
    }

    protected subscribeToEvent<T>(event: { subscribe: (callback: (arg: T) => void) => { unsubscribe: () => void } }, callback: (arg: T) => void): void {
        const subscription = event.subscribe(callback);
        this.eventSubscriptions.push(subscription);
    }

    protected getWinner(): Player | null {
        const objective = world.scoreboard.getObjective(this.scoreboardId);
        const players = getAllPlayers();
        let highestScore = -1;
        let winner: Player | null = null;

        players.forEach(player => {
            if (!objective) return;
            const score = objective.getScore(player);
            if (!score) return;
            if (score > highestScore) {
                highestScore = score;
                winner = player;
            }
        });

        return winner;
    }

    protected announceWinner(player: Player): void {
        world.sendMessage(`${player.name} wins!`);
    }

    protected decrementRounds(): void {
        this.rounds--;
    }

    protected getRounds(): number {
        return this.rounds;
    }

    protected setActionBar(text: string): void {
        getAllPlayers().forEach(player => {
            player.onScreenDisplay.setActionBar(text);
        });
    }
    protected showPlayerData(player: Player): Promise<void> {
        return new Promise((resolve) => {
            try {
                const playerData = data.cdata.find((p) => player.id === p.id);
                if (!playerData) {
                    console.warn(`No player data found for ${player.name}`);
                    resolve();
                    return;
                }

                const showData = [
                    { title: "Level", content: playerData.data.Experience.content.level },
                    { title: "Experience", content: playerData.data.Experience.content.value }
                ];
                const text = showData.map((data) => `${data.title}: ${data.content}`).join("\n");

                try {
                    world.sendMessage(text);
                    const form = new ActionFormData()
                        .title("Player Data")
                        .body(text)
                        .button("Close");

                    form.show(player)
                        .then((res) => {
                            resolve();
                        })
                        .catch((error) => {
                            console.warn(`Failed to show form to ${player.name}: ${error}`);
                            resolve();
                        });
                } catch (error) {
                    console.warn(`Error showing data for ${player.name}: ${error}`);
                    resolve();
                }
            } catch (error) {
                console.warn(`Critical error in showPlayerData for ${player.name}: ${error}`);
                resolve();
            }
        });
    }
    private addExp(amount:number):void{
        getAllPlayers().forEach(element => {
            const dat = getPlayerData(element)
            if (!dat) return;
            dat.data.Experience.addExperience(amount)
        });
    }
}