import { system } from "@minecraft/server";
import { runCommand } from "../game/utils/functions";
import { SceneTypes } from "../game/utils/enums/custom";
import { CommandSceneSyntax } from "../types";

interface CutsceneElement {
    command: string;
    looptimer: number;
}

interface CutsceneConfig {
    id: string;
    scene: CommandSceneSyntax[];
}

export class Cutscene {
    private readonly id: string;
    private readonly scene: CommandSceneSyntax[];
    private time: number;
    private readonly loopelements: CommandSceneSyntax[];
    private readonly tickelements: CommandSceneSyntax[];
    private tickArray: number[];
    private tick: number;
    constructor({ id, scene }: CutsceneConfig) {
        this.id = id;
        this.scene = scene.filter(element => element.time !== SceneTypes.INSTANT && !element.looptimer);
        this.time = 0;
        this.loopelements = scene.filter(element => element.time === SceneTypes.INSTANT && element.looptimer);
        this.tickelements = scene.filter(element => element.time === SceneTypes.LOOP && !element.looptimer);
        
        system.afterEvents.scriptEventReceive.subscribe(event => {
            if (event.id === "ao:scene" && event.message === id) {
                this.init(0);
            }
        });
    }
    public init = async (time: number = 0): Promise<number[]> => {
        try {
            this.time = time;
            this.tickArray = [];

            // Setup loop elements
            this.loopelements.forEach(element => {
                this.tickArray.push(system.runInterval(() => {
                    runCommand(element.command);
                }, element.time * 20));
            });

            // Setup tick elements
            this.tick = system.runInterval(() => {
                this.tickelements.forEach(element => {
                    runCommand(element.command);
                });
            }, 0);

            // Setup scene elements
            this.scene.forEach(element => {
                this.time += element.time * 20;
                system.runTimeout(() => {
                    runCommand(element.command);
                }, this.time);
            });

            // Clear tick array elements after scene completion
            this.tickArray.forEach(element => {
                system.runTimeout(() => {
                    system.clearRun(element);
                }, this.time);
            });

            return await new Promise((resolve, reject) => {
                try {
                    system.runTimeout(() => {
                        system.clearRun(this.tick);
                        resolve(this.tickArray);
                    }, this.time);
                } catch (error) {
                    reject(error);
                }
            });
        } catch (error) {
            console.error('Error in init:', error);
            throw error;
        }
    }
}
