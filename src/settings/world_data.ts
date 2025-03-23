import { world, Player } from "@minecraft/server"
import { ActionFormData, ModalFormData } from "@minecraft/server-ui"
import { gameEvents } from "../game/Events"
import { WorldData, GameType } from "../types"
export let worldData: WorldData = world.getDynamicProperty("settings") ? JSON.parse(world.getDynamicProperty("settings") as string) : { game: { rounds: 1, type: "random" } }
function Menu(player: Player): void {
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
    worldData = world.getDynamicProperty("settings") ? JSON.parse(world.getDynamicProperty("settings") as string) : worldData
})
function Submenu(player: Player): void {
    new ModalFormData()
        .title("World Settings")
        .dropdown("Game Type", ["random", "custom"], 0)
        .slider("Rounds", 1, 10, 1)
        .show(player).then(result => {
            if (result.canceled || !result.formValues) return
            let game = result.formValues[0]
            let gametype = GameType.Random
            if (game == 1) {
                gametype = GameType.Choosing
            }
            worldData.game = { type: gametype, rounds: result.formValues[1] as number }
            world.setDynamicProperty("settings", JSON.stringify(worldData))
            Menu(player)
        })
}
world.afterEvents.itemUse.subscribe((event) => {
    if (event.itemStack.typeId == "minecraft:egg") {
        Menu(event.source)
    }
})

export const version: string = "beta-0.1"