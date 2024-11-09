import { BPT, Shopvalue } from "../enums/custom"
export const ExperienceSyntax = { value: 0, max_value: 0, level: 0, max_level: 10 }
export const CoinsSyntax = { value: 20, muliplier: 1 }
export const BattlpassSyntax = { max_level: 10, items: [{ name: "Hub Title\nKerryman" }, { name: "Starter Skin" }] }
export const BattlePassNewSyntax = [
    { title: "A fresh new Start", purchased: false, version: "beta-0.4", type: BPT.NAMETAGS, cost: 5 },
    {
        title: "Smiley skin", purchased: false, type: BPT.SKINS, skin: 2, cost: 5
    },
    {
        title: "35 coins", purchased: false, type: BPT.Coins, value: 35, cost: 5
    }, {
        title: "Emoji", purchased: false, type: BPT.EMOJIS, value: 0, cost: 5
    },
    {
        title: "Dragonlord Winkler", purchased: false, type: BPT.NAMETAGS, cost: 5
    },
    {
        title: "Chill skin", purchased: false, type: BPT.SKINS, skin: 3, cost: 5
    },
    {
        title: "45 coins", purchased: false, type: BPT.Coins, value: 45, cost: 5
    },
    {
        title: "Chillmoji", purchased: false, type: BPT.EMOJIS, value: 1, cost: 5
    },
    { title: "has anger issues", purchased: false, type: BPT.NAMETAGS, cost: 5 },
    {
        title: "Anger Skin", purchased: false, type: BPT.SKINS, skin: 4, cost: 5
    },
    {
        title: "45 coins", purchased: false, type: BPT.Coins, value: 45, cost: 5
    },
    {
        title: "AngerMoji", purchased: false, type: BPT.EMOJIS, value: 2, cost: 5
    }
]
export const LootSyntax = [
    { title: "It's going Down", purchased: false, type: BPT.NAMETAGS, rarity: Shopvalue.normal, amount: 0 },
    {
        title: "Oni Skin", purchased: false, type: BPT.SKINS, skin: 6, rarity: Shopvalue.legendary
    },
    {
        title: "Smartass Moji", purchased: false, type: BPT.EMOJIS, value: 3, rarity: Shopvalue.rare
    },
    {
        title: "LLJWRLD", purchased: false, type: BPT.NAMETAGS, rarity: Shopvalue.epic
    },
    {
        title: "Hades Skin", purchased: false, type: BPT.SKINS, skin: 7, rarity: Shopvalue.epic
    },
    {
        title: "Laugh Moji", purchased: false, type: BPT.EMOJIS, value: 4, rarity: Shopvalue.normal
    },
    {
        title: "Cry Moji", purchased: false, type: BPT.EMOJIS, value: 5, rarity: Shopvalue.normal
    },
    {
        title: "Sleeping Moji", purchased: false, type: BPT.EMOJIS, value: 6, rarity: Shopvalue.epic
    },
    {
        title: "by my size you judge me", purchased: false, type: BPT.NAMETAGS, rarity: Shopvalue.rare,
    }
]
//loading Data Syntax
