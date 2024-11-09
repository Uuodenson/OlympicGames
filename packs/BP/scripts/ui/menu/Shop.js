import { Player, world } from "@minecraft/server";
import { createActionForm } from "../../game/utils/functions";
import { data } from "../../game/utils/loaddata";
function returnData(player, type) {
    return data.find(data => data.id === player.id).data.find(data => data.id === type)
}
/**
 * 
 * @param {Player} player 
 */
function Shop(player) {
    const action = createActionForm("Shop");
    let data = returnData(player, 0)
    let options = []
    if (data) {
        let filterd = data.data
        let value = 0
        filterd.forEach(data => {
            data.index = value
            value++
            options.push(data)
        })
        let nfiltered = filterd.filter(data => !data.purchased)
        nfiltered.forEach((data, index) => {
            action.button(data.title)
            data.index = index
        })
        action.button("§cBack")
        action.show(player).then(result => {
            if (result.canceled) return
            if (result.selection === filterd.length) {
                return
            }
            let v = nfiltered.find(data => data.index == result.selection).index
            Purchase(player, v)
        })

    }
}

function Purchase(player, index) {
    const action = createActionForm("Purchase")
    let data = returnData(player, 0)
    if (data) {
        action.button("Purchase")
        action.button("§cCancel")
        action.show(player).then(result => {
            if (result.canceled) return
            if (result.selection === 0) {
                if (JSON.stringify(returnData(player, 1).data.value) >= returnData(player, 0).data.filter(data => !data.purchased)[index].cost) {
                    world.sendMessage("Purchased " + returnData(player, 0).data.filter(data => !data.purchased)[index].title)
                    returnData(player, 0).data.filter(data => !data.purchased)[index].purchased = true
                    player.setDynamicProperty("ao:battle_pass", JSON.stringify(data.data))
                    returnData(player, 1).data.value -= returnData(player, 0).data.filter(data => !data.purchased)[index].cost
                    player.setDynamicProperty("ao:coins", JSON.stringify(returnData(player, 1)).data)
                }
                else {
                    world.sendMessage("Not enough coins")
                }
            }
        })
    }
}

world.afterEvents.itemUse.subscribe(event => {
    if (event.itemStack.typeId === "minecraft:diamond") {
        Shop(event.source)
    }
})