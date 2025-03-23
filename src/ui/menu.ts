import { createActionForm } from "../game/utils/functions"
import { Quests } from "./menu/Quest"
import { Settings } from "./menu/Settings"
import { Cosmetics } from "./menu/Cosmetics"
import { BattlePass } from "./menu/Battlepass"
import { world, Player } from "@minecraft/server"
import { gameEvents } from "../game/Events"
const Titles: { mainMenu: string } = { mainMenu: "Menu" }
const Buttons: { mainMenu: { name: string, callBack: (player: Player) => void, texture: string }[], index?: number } = {
    mainMenu: [
        { name: "Cosmetics", callBack: Cosmetics, texture: "textures/ui/menu/Cosmetic" },
        { name: "Quests", callBack: Quests, texture: "textures/ui/menu/Quest" },
        { name: "BattlePass", callBack: BattlePass, texture: "textures/ui/menu/Cosmetic" },
        { name: "Settings", callBack: Settings, texture: "textures/ui/menu/red_stripe" },
    ]
}
const Forms = { mainMenu: [{ name: "Main Menu", callBack: mainMenu }] }

function mainMenu(player, menuName = Titles.mainMenu, content = Forms.mainMenu, callbacks = Buttons.mainMenu) {
    const mainMenu = createActionForm(menuName)
    Buttons.mainMenu.forEach((button, index) => {
        mainMenu.button(button.name, button.texture)
    })
    mainMenu.show(player).then(result => {
        if (result.canceled) return
        callbacks[result.selection].callBack(player)
        world.sendMessage(`${result.selection}`)
    })
}

world.afterEvents.itemUse.subscribe((event) => {
    if (event.itemStack.typeId == "minecraft:paper") {
        mainMenu(event.source)
    }
    if (event.itemStack.typeId == "minecraft:shears") {
        gameEvents.triggerEvent("startGame", {})
    }
})