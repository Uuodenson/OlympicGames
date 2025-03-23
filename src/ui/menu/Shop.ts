import { Player, world } from "@minecraft/server";
import { createActionForm } from "../../game/utils/functions";
import { showError, formatCurrency } from "./utils";
import { BattlePassSyntax, CoinsSyntax, ShopSyntax } from "../../types";
import { data as dt } from "../../game/utils/loaddata";

function Shop(player: Player): void {
    const action = createActionForm("Shop");
    const data = dt.cdata.find(playerData => playerData.id === player.id);

    if (!data) return;

    const items = data.data.Shop;
    const unpurchasedItems = items.content.filter(item => !item.purchased);

    unpurchasedItems.forEach((item, index) => {
        if (!item.cost) return;
        action.button(`${item.title} - ${formatCurrency(item.cost)}`);
        item.index = index;
    });

    action.button("§cBack");
    action.show(player).then(result => {
        if (result.canceled || result.selection === unpurchasedItems.length) return;

        const selectedItem = unpurchasedItems.find(item => item.index === result.selection);
        if (!selectedItem)  return;
        Purchase(player, selectedItem);
    });
}

function Purchase(player: Player, item: ShopSyntax): void {
    const data = dt.cdata.find(playerData => playerData.id === player.id);
    if (!data) return;
    const action = createActionForm("Purchase");
    const battlePassData = data.data.BattlePass.content;
    const coinsData = data.data.Coins.content;

    if (!battlePassData || !coinsData) return;

    action.button("Purchase");
    action.button("§cCancel");

    action.show(player).then(result => {
        if (result.canceled || result.selection !== 0 || !item.cost) return;

        const playerCoins = coinsData.value;
        if (playerCoins >= item.cost) {
            item.purchased = true;
            coinsData.value -= item.cost;
            player.setDynamicProperty("ao:battle_pass", JSON.stringify(battlePassData));
            player.setDynamicProperty("ao:coins", JSON.stringify(coinsData));
            world.sendMessage(`Purchased ${item.title}`);
        } else {
            showError(player, "Not enough coins");
        }
    });
}

world.afterEvents.itemUse.subscribe(event => {
    if (event.itemStack.typeId === "minecraft:diamond") {
        Shop(event.source);
    }
});