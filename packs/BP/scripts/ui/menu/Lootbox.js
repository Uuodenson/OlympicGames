import { world } from "@minecraft/server";
import { sounds } from "../../game/utils/enums/sounds";
import { data } from "../../game/utils/loaddata";
import { LootSyntax } from "../../game/utils/syntax/saveddatatypes";
import { Shopvalue } from "../../game/utils/enums/custom";
import { LootScene } from "../../cutscenes/start";
import { createActionForm, getAllPlayers } from "../../game/utils/functions";
import { replaceData, saveinGameData } from "../../game/utils/savingdata";
let location = { x: 32.56, y: -48.00, z: 195.53 }
function returnData(player, type) {
    return data.find(data => data.id === player.id).data.find(data => data.id === type)
};
function spawnEntity(type, location) {
    return world.getDimension("overworld").spawnEntity(type, location)
}
world.afterEvents.itemUse.subscribe((event) => {
    if (event.itemStack.typeId === "minecraft:diamond") {
        event.source.playSound(sounds.copper_wax_on, { location: event.source.location, volume: 1, pitch: 0.75 });
        let lootbox = returnData(event.source, 3)
        let random = Math.random()
        let change
        let lootboxAmount = lootbox.data[0].amount
        if (lootboxAmount === undefined) {
            world.sendMessage(JSON.stringify(lootbox.data[0]["amount"]) + "")
            lootbox.data[0].amount = 0
            saveinGameData()
        }
        lootboxAmount = lootbox.data[0]["amount"]
        const actionform = createActionForm("Lootbox")
            .body("You have " + lootbox.data[0].amount + " lootboxes")
            .button("§cOpen")
            .button("§cBuy")
            .button("§cClose")
            .show(event.source).then((result) => {
                if (result.canceled) return;
                if (result.selection === 0) {
                    if (lootboxAmount === 0) {
                        event.source.playSound(sounds.armor_equip_diamond, { location: event.source.location, volume: 1, pitch: 0.75 })
                        event.source.sendMessage("§cYou don't have any lootboxes")
                        return
                    };
                    event.source.playSound("sounds.world.lootbox.open", { pitch: 0.75, volume: 1 })
                    for (let [key, value] of Object.entries(Shopvalue)) {
                        if (random <= value) {
                            change = value
                        }
                    }
                    let loot = lootbox.data.filter(data => data.rarity === change)
                    random = Math.floor(Math.random() * loot.length)
                    world.sendMessage(loot[random].title)
                    event.source.addTag("lootbox")
                    async function startLootbox() {
                        await LootScene.init()
                        world.sendMessage("LootBox Opened")
                        let actionform = createActionForm("Lootbox")
                        actionform.body("You opened" + loot[random].title)
                        actionform.button("§cClose")
                        actionform.show(event.source)
                        if (loot.find(data => data === loot[random]).purchased === true) {
                            world.sendMessage("You already opened this loot here have this")
                        }
                        lootbox.data[0].amount -= 1
                        loot.find(data => data === loot[random]).purchased = true
                        saveinGameData()
                        event.source.setDynamicProperty("ao:lootbox", JSON.stringify(loot))
                    }
                    startLootbox()
                }
                if (result.selection === 1) {
                    let coinData = returnData(event.source, 1)
                    lootbox.data[0].amount += 1
                    replaceData(event.source, lootbox.data, 3)
                }
            })
    }
}
);