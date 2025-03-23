import { world, Entity, Player, system } from "@minecraft/server";
import { worldData } from "../../settings/world_data";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { gameEvents } from "../Events";
import { CommandSceneSyntax, GameType, Vector3 } from "../../types";
import { RingGame } from "game/core/RingGame";
import { ClickerBombGame } from "game/core/ClickerBombGame";
import { ThunderHammerGame } from "game/core/ThunderHammerGame";


const Games = [
    {
        id: "ring", name: "Ring Game", callback: new RingGame({
            name: "ring", scoreboardId: "ao:ring", timer: 10,
            defaultScore: 0, rounds: 1, ringSpawnPoints: [{ x: 74, y: -44, z: 106 }], fine: 0.2, finemultiplier: 3
        },)
    },
    {
        id: "click", name: "Click Game", callback: new ClickerBombGame({
            name: "click", scoreboardId: "ao:click", timer: 10,
            defaultScore: 0, rounds: 2, maxBombValue: 30
        })
    },
    {
        id: "thunder", name: "Thunder Hammer", callback: new ThunderHammerGame({
            name: "thunder", scoreboardId: "ao:thunder", timer: 10,
            defaultScore: 0, rounds: 2 
        })
    }
]

function nextGame(data = worldData) {
    let type = data.game.type
    let rounds = data.game.rounds
    if (rounds <= 0) {
        gameEvents.triggerEvent("GameFinished", {})
    } else {
        if (type == GameType.Random) {
            rounds -= 1
            world.setDynamicProperty("settings", JSON.stringify(data))
            gameEvents.triggerEvent("UpdateWorldData", { data: data })
            let id = Games[Math.floor(Math.random() * Games.length)].id
            gameEvents.triggerEvent("RandomTitleAnimation", { game: id, times: 2, games: Games })
        }
        if (type == GameType.Choosing) {
            const action = new ActionFormData()
                .title("HiveStyle")
                .body("" + rounds)

            Games.forEach(game => {
                action.button(game.name)
            })
            action.show(world.getPlayers()[0]).then(result => {
                if (result.canceled || !result.selection) return
                // if (getAllPlayers().length <= 0) return
                let game = Games[result.selection]
                let id = game.id
                runCommand("/scriptevent ao:game " + id)
                data.game.rounds -= 1
                world.setDynamicProperty("settings", JSON.stringify(worldData))
                gameEvents.triggerEvent("UpdateWorldData", {})
            })
        }
    }
}

gameEvents.addRemoteEvent("startGame", () => {
    nextGame()
})

export function calcDistance(a: Vector3, b: Vector3): number {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2)
}

/**
 * 
 * @param {String} title
 * @returns 
 */

export function createActionForm(title: string): ActionFormData {
    const actionform = new ActionFormData()
        .title(title)
    return actionform
}
/**
 * 
 * @param {String} title 
 * @returns 
 */

export function createModalForm(title: string) {
    const modalform = new ModalFormData()
        .title(title)
    return modalform
}

/**
 * 
 * @param {number} time 
 * @returns 
 */
export function calcTimetoTicks(time: number) {
    return time * 20
}

export function getAllPlayers() {
    return world.getPlayers()
}
export function command(string: string, tick: number, looptimer: boolean = false): CommandSceneSyntax {
    return { command: string, time: tick, looptimer: looptimer }
}

export function getOwner(): Player[] {
    return world.getPlayers().filter((p) => {
        // if (p.name == "S7riel") return true
        if (p.hasTag("owner")) return true
        return false
    })
}

export function spawnEntity(typeId: string, location: Vector3, dimension: string = "overworld"): Entity {
    return world.getDimension(dimension).spawnEntity(typeId, location)
}

export function getRandomPlayer(): Player {
    return getAllPlayers()[Math.floor(Math.random() * getAllPlayers().length)]
}

export default function resetSkin(): void {
    world.getPlayers().forEach(player => player.setProperty("ao:skin_id", 0));
}

export function runCommand(command: string, dimension: string = "overworld"): void {
    world.getDimension(dimension).runCommand(command)
}

export function playSound(sound: string, location: Vector3): void {
    world.getDimension("overworld").playSound(sound, location)
}