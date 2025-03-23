import { Player } from "@minecraft/server";

export interface MenuItem {
    name: string;
    function: (player: Player) => void;
    id: number;
    texture?: string;
}

export interface MenuForm {
    name: string;
    callback: (player: Player) => void;
}

export interface BattlePassItem {
    id: number;
    name: string;
    purchased: boolean;
    type: string;
    cost: number;
    title: string;
    value?: number;
    skin?: number;
    index?: number;
}

export interface PlayerCoins {
    value: number;
    multiplier: number;
}

export interface QuestInfo {
    id: number;
    game: string;
    description: string;
}

export interface QuestData {
    quest: boolean[];
}

export interface CosmeticForm {
    name: string;
    callback: (player: Player) => void;
    id?: number;
}