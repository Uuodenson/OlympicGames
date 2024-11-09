import { system } from "@minecraft/server"
import { runCommand } from "../game/utils/functions"
import { SceneTypes } from "../game/utils/enums/custom"

export class Cutscene {
    constructor(id, scene) {
        this.scene = scene.filter(element => element.time !== SceneTypes.INSTANT && !element.looptimer)
        this.time = 0
        this.loopelements = scene.filter(element => element.time == SceneTypes.INSTANT && element.looptimer)
        this.tickelements = scene.filter(element => element.time == SceneTypes.LOOP && !element.looptimer)
        console.error(this.scene.length)
        system.afterEvents.scriptEventReceive.subscribe(event => {
            if (event.id == "ao:scene" && event.message == id) {
                this.init()
            }
        })

    }
    init = async (time) => {
        this.time = 0
        this.tickArray = []
        this.loopelements.forEach(element => {
            this.tickArray.push(system.runInterval(() => {
                runCommand(element.command)
            }, element.looptimer * 20))
        })
        this.tick = system.runInterval(() => {
            this.tickelements.forEach(element => {
                runCommand(element.command)
            })
        }, 0)

        this.scene.forEach(element => {
            this.time += element.time * 20
            system.runTimeout(() => {
                runCommand(element.command)
            }, this.time)
        })
        this.tickArray.forEach(element => {
            system.runTimeout(() => {
                system.clearRun(element)
            }, this.time)
        })
        return new Promise((resolve, reject) => {
            system.runTimeout(() => {
                system.clearRun(this.tick)
                resolve(this.tickArray)
            }, this.time)
        })

    }
}
