import { createActionForm } from "../../game/utils/functions";
import { Player } from "@minecraft/server";
import { MenuItem } from "./types";
import { createMenu } from "./utils";

const Sites: MenuItem[][] = [
    [
        { name: "Skin1", function: () => {}, id: 0 },
        { name: "300 Coins", function: () => {}, id: 0 },
        { name: "Start of the Games", function: () => {}, id: 0 },
        { name: "Back", function: () => {}, id: 1 },
        { name: "Shop", function: () => {}, id: 2 },
        { name: "Next", function: () => {}, id: 3 }
    ],
    [
        { name: "?", function: () => {}, id: 0 },
        { name: "?", function: () => {}, id: 0 },
        { name: "Start of the Games", function: () => {}, id: 0 },
        { name: "Back", function: () => {}, id: 1 },
        { name: "Shop", function: () => {}, id: 2 },
        { name: "Next", function: () => {}, id: 3 }
    ],
    [
        { name: "?", function: () => {}, id: 0 },
        { name: "300 Coins", function: () => {}, id: 0 },
        { name: "Onin Skin", function: () => {}, id: 0 },
        { name: "Back", function: () => {}, id: 1 },
        { name: "Shop", function: () => {}, id: 2 },
        { name: "Next", function: () => {}, id: 3 }
    ]
];

let currentSite = 0;

export function BattlePass(player: Player): void {
    const config = {
        title: "BattlePass",
        body: "You can use this to buy a BattlePass",
        buttons: Sites[currentSite].map(button => ({
            ...button,
            texture: "textures/ui/assets/battlepass/angry"
        }))
    };

    createMenu(config, player);
}