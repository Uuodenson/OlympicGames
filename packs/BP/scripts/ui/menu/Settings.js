import { Scene } from "../../cutscenes/start";
import { gameEvents } from "../../game/Events";
import { createModalForm } from "../../game/utils/functions";


function StartOlympicGames(player) {
    gameEvents.triggerEvent("startGame")
}
const forms = [{ name: "StartOlympicGames", callback: StartOlympicGames }]

export function Settings(player) {
    const action = createModalForm("Settings")
    forms.forEach((form, index) => {
        action.button(form.name)
        forms[index].id = index
    })
    action.show(player).then(result => {
        if (result.canceled) return

        async function startGame(callback) {
            await Scene.init()
            callback()
        }
        startGame(forms[result.formValues[0]].callback)
    })
}

