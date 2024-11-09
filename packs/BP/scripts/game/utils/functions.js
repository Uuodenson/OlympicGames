import { world } from "@minecraft/server";
import { worldData } from "../../settings/world_data";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { gameEvents } from "../Events";

export const timeValues = { default: 30, middle: 60, long: 120, really_long: 240 }

const Games = [
    { name: "RingGame", id: "ring" },
    { name: "ClickerBomb", id: "clicker" },
    { name: "ThunderHit", id: "thunder" },
    { name: "Jerusalem", id: "jerusalem" },
    { name: "WheelieRun", id: "wheelie" },
    { name: "Tailhitter", id: "tailhitter" }
]
function nextGame(data = worldData) {
    let type = data.game.type
    let rounds = data.game.rounds
    if (rounds <= 0) {
        gameEvents.triggerEvent("GameFinished")
    } else {
        if (type == "random") {
            rounds -= 1
            world.setDynamicProperty("settings", JSON.stringify(data))
            gameEvents.triggerEvent("UpdateWorldData", { data: data })
            let id = Games[Math.floor(Math.random() * Games.length)].id
            gameEvents.triggerEvent("RandomTitleAnimation", { game: id, times: 2, games: Games })
        }
        if (type == "choose") {
            const action = new ActionFormData()
                .title("HiveStyle")
                .body("" + rounds)
            let index = 0;

            Games.forEach(game => {
                game.index = index
                action.button(game.name)
                index += 1
            })
            action.show(world.getPlayers().filter((p) => p.name == "S7riel")[0]).then(result => {
                if (result.canceled) return
                // if (getAllPlayers().length <= 0) return
                let game = Games[result.selection]
                let id = game.id
                runCommand("/scriptevent ao:game " + id)
                data.game.rounds -= 1
                world.setDynamicProperty("settings", JSON.stringify(worldData))
                gameEvents.triggerEvent("UpdateWorldData")
            })
        }
    }
}

gameEvents.addRemoteEvent("startGame", () => {
    nextGame()
})

export function calcDistance(a, b) {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2)
}

/**
 * 
 * @param {String} title
 * @returns 
 */

export function createActionForm(title) {
    const actionform = new ActionFormData()
        .title(title)
    return actionform
}
/**
 * 
 * @param {String} title 
 * @returns 
 */

export function createModalForm(title) {
    const modalform = new ModalFormData()
        .title(title)
    return modalform
}

/**
 * 
 * @param {number} time 
 * @returns 
 */
export function calcTimetoTicks(time) {
    return time * 20
}

export function getAllPlayers() {
    return world.getPlayers()
}

export function command(string, tick, looptimer = false) {
    return { command: string, time: tick, looptimer: looptimer }
}

export function getOwner() {
    return world.getPlayers().filter((p) => {
        // if (p.name == "S7riel") return true
        if (p.hasTag("owner")) return true
        return false
    })
}

export function spawnEntity(typeId, location, dimension = "overworld") {
    return world.getDimension(dimension).spawnEntity(typeId, location)
}

export function getRandomPlayer() {
    return getAllPlayers()[Math.floor(Math.random() * getAllPlayers().length)]
}

export default function resetSkin() {
    world.getPlayers().forEach(player => player.setProperty("ao:skin_id", 0));
}

export function runCommand(command, dimension = "overworld") {
    world.getDimension(dimension).runCommand(command)
}

export function playSound(sound, location) {
    world.getDimension("overworld").playSound(sound, location)
}