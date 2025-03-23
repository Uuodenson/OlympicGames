import { Player } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { MenuItem, MenuForm } from "./types";
import { data } from "../../game/utils/loaddata";

export interface MenuConfig {
    title: string;
    body?: string;
    buttons: MenuItem[];
}

export function createMenu(config: MenuConfig, player: Player): void {
    const menu = new ActionFormData()
        .title(config.title);

    if (config.body) {
        menu.body(config.body);
    }

    config.buttons.forEach(button => {
        menu.button(button.name, button.texture);
    });

    menu.show(player).then(result => {
        if (result.canceled || !result.selection) return;
        const selectedButton = config.buttons[result.selection];
        selectedButton.function(player);
    });
}

export function formatCurrency(amount: number): string {
    return `§6${amount.toLocaleString()}§r`;
}

export function showError(player: Player, message: string): void {
    player.sendMessage(`§c${message}§r`);
}