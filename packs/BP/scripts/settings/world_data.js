import { world } from "@minecraft/server"
import { ActionFormData, ModalFormData } from "@minecraft/server-ui"
import { gameEvents } from "../game/Events"
/**
 * @type {{game: {type: string, rounds: number}, skins: {}}}
 */
export let worldData = world.getDynamicProperty("settings") ? JSON.parse(world.getDynamicProperty("settings")) : { game: { rounds: 1, type: "random" }, skins: {} }
function Menu(player) {
    const action = new ActionFormData()
        .title("Settings")
        .body("Data: " + JSON.stringify(worldData))
        .button("Change")
        .show(player).then(result => {
            if (result.canceled) return
            Submenu(player)
        })
}
gameEvents.addRemoteEvent("UpdateWorldData", (props) => {
    worldData = world.getDynamicProperty("settings") ? JSON.parse(world.getDynamicProperty("settings")) : worldData
    console.error(worldData.game.rounds)
})
function Submenu(player) {
    const modal = new ModalFormData()
        .title("World Settings")
        .dropdown("Game Type", ["random", "custom"], 0)
        .slider("Rounds", 1, 10, 1)
        .show(player).then(result => {
            if (result.canceled) return
            let game = result.formValues[0]
            if (game == 0) {
                game = "random"
            }
            if (game == 1) {
                game = "choose"
            }
            worldData.game = { type: game, rounds: result.formValues[1] }
            world.setDynamicProperty("settings", JSON.stringify(worldData))
            Menu(player)
        })
}
// getAllPlayers().forEach(player => {
//     Menu(player, worldData)
// })
world.afterEvents.itemUse.subscribe((event) => {
    if (event.itemStack.typeId == "minecraft:egg") {
        Menu(event.source)
    }
})

export const version = "beta-0.100"