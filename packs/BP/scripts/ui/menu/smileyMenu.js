import { world } from "@minecraft/server";
import { createActionForm } from "../../game/utils/functions";
import { data } from "../../game/utils/loaddata";
import { BPT } from "../../game/utils/enums/custom";


const emojis = [{ name: "smiley", id: 0 }, { name: "frosty", id: 1 }, { name: "angry", id: 2 }, { name: "smartass", id: 3 }]


world.afterEvents.itemUse.subscribe(({ source, itemStack }) => {
    if (itemStack.typeId == "minecraft:stick") {
        const menu = createActionForm("EMOJIS")
        const activeSmiley = world.getDimension("overworld").getEntities({ type: "ao:smiley", tags: [source.name] })
        const values = []
        const battlepassdata = data.find((player) => player.id === source.id).data.find((data) => data.id === 0).data.filter((data) => data.type === BPT.EMOJIS && data.purchased === true)
        const lootboxdata = data.find((player) => player.id === source.id).data.find((data) => data.id === 3).data.filter((data) => data.type === BPT.EMOJIS && data.purchased === true)
        battlepassdata.forEach(element => {
            menu.button(element.title)
            values.push({ value: element.value })
        });
        lootboxdata.forEach(element => {
            menu.button(element.title)
            values.push({ value: element.value })
        });
        if (values.length === 0) {
            source.sendMessage("Please unlock an emoji, you dont have one!")

        }
        menu.show(source).then(result => {
            if (result.canceled) return
            if (activeSmiley.length > 0) {
                source.sendMessage("§6§l>> §r§fWait for you smiley to disapear before using the item again!")
                return
            }
            const emote = values[result.selection]
            const entity = world.getDimension("overworld").spawnEntity("ao:smiley", source.location)
            entity.setProperty("ao:type", emote.value)
            entity.addTag(source.name)
            entity.runCommand(`ride @s start_riding ${source.name}`)
        })
    }
})



