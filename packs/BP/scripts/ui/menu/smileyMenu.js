import { world } from "@minecraft/server";
import { createActionForm } from "../../game/utils/functions";
import { data } from "../../game/utils/loaddata";
import { BPT } from "../../game/utils/enums/custom";

const emojisoundId = [{ id: 0, sound: "smiley.default" }
    , { id: 1, sound: "smiley.frosty" },
{ id: 2, sound: "smiley.angry" },
{ id: 3, sound: "smiley.smartass" },
{ id: 5, sound: "smiley.cry" },
{ id: 6, sound: "smiley.sleeping" },
{ id: 8, sound: "smiley.cry" },
]

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
            let sound = emojisoundId.find((sound) => sound.id === emote.value)
            entity.runCommand(`execute at @s run playsound ${sound.sound} @a[r=10] ~ ~ ~ 1 1`)
        })
    }
})



