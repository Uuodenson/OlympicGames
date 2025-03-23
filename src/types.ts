import { LoadPoint } from "./game/utils/LoadPoint"

export type Vector3 = { x: number, y: number, z: number }
export interface CommandSceneSyntax {
    command: string,
    time: number,
    looptimer: boolean
}
export interface WorldData {
    game: {
        type: GameType,
        rounds: number
    },
}
export interface CosmeticSyntax {
    skin: number
    cape: number
    cape_equipped: boolean
}
export enum GameType {
    Random = "random",
    Choosing = "choosing"
}
export enum timeValues { default = 30, middle = 60, long = 120, really_long = 240 }
export interface GameEvent {
    [key: string]: Function
}
export interface RemoteEvent {
    [key: string]: Function | any
}
export interface ShopSyntax {
    readonly title: string
    purchased: boolean
    readonly type: BTP
    readonly version?: string
    readonly value?: number
    readonly cost?: number
    readonly skin?: number
    index?: number
}
export interface LootboxSyntax extends ShopSyntax {
    readonly rarity: LootRarity
    amount? : number
}
export enum LootRarity {
    Common = 1,
    Rare = 0.5,
    Epic = 0.25,
    Legendary = 0.1
}
export enum BTP {
    EMOJIS,
    NAMETAGS,
    SKINS,
    LOOTBOX,
    BPT,

}
export enum ShopType {
    BattlePass = "battlepass",
    LootBox = "lootbox"
}
export enum WorldType {
    OverWorld = "minecraft:overworld",
    Nether = "minecraft:the_nether",
    End = "minecraft:the_end"
}
export enum SceneType {
    LOOP = -1,
    INSTANT = -2
}
export enum SavedDataTypes {
    Coins = "ao:coins",
    EXP = "ao:experience",
    BattlePass = "ao:battle_pass",
    Lootbox = "ao:lootbox",
    Shop = "ao:shop",
    Cosmetics = "ao:cosmetics"
}
export interface ExperienceSyntax { value: number, max_value: number, level: number, max_level: number, muliplier: number, levelup: number, levelup_multiplier: number, levelup_cost: number, levelup_cost_multiplier: number  }
export interface CoinsSyntax { value: number, muliplier: number }
export type BattlePassItem = {
    name: string,
}
export interface BattlePassSyntax { max_level: number, items: BattlePassItem[] }
export interface PlayerData {
    id: string,
    data: LoadPoint
}
export interface ActiveData {
    readonly name?: SavedDataTypes,
    readonly id: number,
    data: ShopSyntax[] | CoinsSyntax | ExperienceSyntax | BattlePassSyntax | LootboxSyntax[]
}
