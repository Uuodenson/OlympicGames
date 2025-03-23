import { Player } from "@minecraft/server";
import { Scene } from "../../cutscenes/start";
import { gameEvents } from "../../game/Events";
import { createActionForm } from "../../game/utils/functions";

function StartOlympicGames(player:Player) {
    console.error(player.name);
    gameEvents.triggerEvent("startGame",{})
}
const forms = [{ name: "StartOlympicGames", callback: StartOlympicGames }]

export function Settings(player: Player) {
    const action = createActionForm("Settings")
    forms.forEach((form) => {
        action.button(form.name)
    })
    action.show(player).then(result => {
        if (result.canceled) return

        async function startGame(callback: Function) {
            await Scene.init(0)
            callback()
        }
        startGame(forms[result.selection].callback)
    })
}

