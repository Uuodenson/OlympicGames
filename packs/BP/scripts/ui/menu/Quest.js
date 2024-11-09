import { Player, system } from "@minecraft/server"
import { createActionForm, getAllPlayers } from "../../game/utils/functions"

const questsInfo = [
    { id: 0, Game: "Thunder Hammer", Description: "Hit 200 Players with a Thunder Hammer" }
]

export function Quests(player) {
    const parsedquest = { quest: [false] }
    const questForm = createActionForm("Quests")
    if (player instanceof Player) {
        questsInfo.forEach(quest => {
            questForm.button(quest.Game + "\n" + quest.Description)
        })
        questForm.show(player).then(result => {
            if (result.canceled) return
            const questData = player.getDynamicProperty("quest") ?
                JSON.parse(player.getDynamicProperty("quest")) : parsedquest
            const quest = questData.quest[result.selection]
            if (quest == true) {
                console.error("Claimed 300 BattlePoints " + player.name)
            } else {
                quest == false
                console.error("Quest is not Finnished " + player.name + " !")
            }
            player.setDynamicProperty("quest", JSON.stringify(questData))
        })
    }
}

system.afterEvents.scriptEventReceive.subscribe((systemevent) => {
    if (systemevent.id == "ao:property") {
        getAllPlayers().forEach(player => {
            if (player.getDynamicProperty(systemevent.message) == null) return;
            createActionForm("DynamicPropertyData")
                .title("Quest Data")
                .body(player.getDynamicProperty(systemevent.message))
                .button("Close")
                .show(player)
        })
    }
})