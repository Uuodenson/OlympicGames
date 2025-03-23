import { Player, world } from "@minecraft/server";
import { sounds } from "../../game/utils/enums/sounds";
import { data } from "../../game/utils/loaddata";
import { Shopvalue } from "../../game/utils/enums/custom";
import { LootScene } from "../../cutscenes/start";
import { createActionForm } from "../../game/utils/functions";
import { LootboxSyntax } from "../../types";
world.afterEvents.itemUse.subscribe((event) => {
    if (event.itemStack.typeId === "minecraft:diamond") {
        event.source.playSound(sounds.copper_wax_on, { location: event.source.location, volume: 1, pitch: 0.75 });
        const dt = data.cdata.find(data => data.id === event.source.id).data
        let lootbox = dt.Lootbox.content
        let random = Math.random()
        let change = 0
        let lootboxAmount = lootbox[0].amount
        if (lootboxAmount === undefined) {
            world.sendMessage(JSON.stringify(lootbox[0]["amount"]) + "")
            lootbox[0].amount = 0
        }
        lootboxAmount = lootbox[0]["amount"]
        createActionForm("Lootbox")
            .body("You have " + lootbox[0].amount + " lootboxes")
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
                    let loot = lootbox as LootboxSyntax[]
                    random = Math.floor(Math.random() * loot.length)
                    for (let [key, value] of Object.entries(Shopvalue) as any) {
                        if (random <= value) {
                            change = value
                        }
                    }
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
                        loot[0]
                        loot.find(data => data === loot[random]).purchased = true
                        event.source.setDynamicProperty("ao:lootbox", JSON.stringify(loot))
                    }
                    startLootbox()
                }
                if (result.selection === 1) {
                    let loot = lootbox[0] as LootboxSyntax
                    loot[0].amount += 1
                }
            })
    }
}
);