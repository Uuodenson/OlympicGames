import { world } from "@minecraft/server";
import { createActionForm } from "../../game/utils/functions";
import { data } from "../../game/utils/loaddata";
import { BPT } from "../../game/utils/enums/custom";
import { BattlePassSyntax, BTP, LootboxSyntax, ShopSyntax } from "../../types";

interface EmojiSound {
    id: number;
    sound: string;
}

const emojisoundId: EmojiSound[] = [
    { id: 0, sound: "smiley.default" },
    { id: 1, sound: "smiley.frosty" },
    { id: 2, sound: "smiley.angry" },
    { id: 3, sound: "smiley.smartass" },
    { id: 4, sound: "smiley.laughing" },
    { id: 5, sound: "smiley.cry" },
    { id: 6, sound: "smiley.sleeping" },
    { id: 7, sound: "smiley.cry" }
];

world.afterEvents.itemUse.subscribe(({ source, itemStack }) => {
    if (itemStack.typeId === "minecraft:stick") {
        const menu = createActionForm("EMOJIS");
        const activeSmiley = world.getDimension("overworld").getEntities({
            type: "ao:smiley",
            tags: [source.name]
        });

        const values: { value: number }[] = [];
        const bdb = data.cdata.find((player) => player.id === source.id)?.data.Shop
        const battlepassdata = bdb.content
            .filter((data) => data.type === BPT.EMOJIS && data.purchased === true) || [];

        const lbl = data.cdata.find((player) => player.id === source.id)?.data.Lootbox.content
        const lootboxdata = lbl
            .filter((data) => data.type === BPT.EMOJIS && data.purchased === true) || [];

        battlepassdata.forEach(element => {
            if (!element.value) return;
            menu.button(element.title);
            values.push({ value: element.value });
        });

        lootboxdata.forEach(element => {
            if (!element.value) return;
            menu.button(element.title);
            values.push({ value: element.value });
        });

        if (values.length === 0) {
            source.sendMessage("Please unlock an emoji, you dont have one!");
            return;
        }

        menu.show(source).then(result => {
            if (result.canceled) return;
            if (activeSmiley.length > 0) {
                source.sendMessage("§6§l>> §r§fWait for your smiley to disappear before using the item again!");
                return;
            }

            const emote = values[result.selection];
            const entity = world.getDimension("overworld").spawnEntity("ao:smiley", source.location);
            entity.setProperty("ao:type", emote.value);
            entity.addTag(source.name);
            entity.runCommand(`ride @s start_riding ${source.name}`);
            // console.error(entity.location);
            
            const sound = emojisoundId.find((sound) => sound.id === emote.value);
            if (!sound) return;

            entity.runCommand(`execute at @s run playsound ${sound.sound} @a[r=10] ~ ~ ~ 1 1`);
        });
    }
});



