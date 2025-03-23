import { Player, world } from "@minecraft/server";
import { BattlePassSyntax, CoinsSyntax, CosmeticSyntax, ExperienceSyntax, LootboxSyntax, SavedDataTypes, ShopSyntax } from "../../types";

type SavedData = ShopSyntax[] | CoinsSyntax | ExperienceSyntax | BattlePassSyntax | LootboxSyntax[] | CosmeticSyntax;

abstract class Point<T extends SavedData> {
    readonly name: string;
    content: T;
    
    constructor(name: string, content: T) {
        this.name = name;
        this.content = content;
    }

    getContent(): T {
        return this.content;
    }
}

class BattlePassPoint extends Point<BattlePassSyntax> {
    constructor(data: BattlePassSyntax) {
        super(SavedDataTypes.BattlePass, data);
    }

    getMaxLevel(): number {
        return this.content.max_level;
    }
}

class ShopPoint extends Point<ShopSyntax[]> {
    constructor(data: ShopSyntax[]) {
        super(SavedDataTypes.Shop, data);
    }

    setBought(obj: ShopSyntax, stt:boolean) {
        obj.purchased = stt;
        this.content = this.content.map(obj => obj.title === obj.title ? obj : obj);
    }

    addContent(obj: ShopSyntax) {
        this.content.push(obj);
    }
}

class CoinsPoint extends Point<CoinsSyntax> {
    constructor(data: CoinsSyntax) {
        super(SavedDataTypes.Coins, data);
    }

    addCoins(amount: number) {
        this.content.value = (this.content.value || 0) + amount;
    }

    removeCoins(amount: number): boolean {
        if (this.content.value >= amount) {
            this.content.value -= amount;
            return true;
        }
        return false;
    }
}

class ExperiencePoint extends Point<ExperienceSyntax> {
    private player : Player;
    constructor(data: ExperienceSyntax, player: Player) {
        super(SavedDataTypes.EXP, data);
        this.player = player;
    }

    addExperience(amount: number) {
        this.content.value = (this.content.value || 0) + amount;
        world.sendMessage(JSON.stringify(this.content.value))
    }

    getLevel(): number {
        return this.content.level || 0;
    }

    LevelUp() {
        let level = this.getLevel();
        let exp = this.content.value || 0;
        let max_level = this.content.max_level || 0;
        let max_exp = this.content.max_value || 0;
        let muliplier = this.content.muliplier || 0
        if (exp >= max_exp) {
            level++;
            exp = 0;
            max_exp = max_exp * 2;
            muliplier = muliplier * 1.75;
            if (level >= max_level) {
                level = max_level;
                exp = max_exp;
                world.sendMessage(this.player.name + " has reached max level")
            }
        }
    }
}

class LootboxPoint extends Point<LootboxSyntax[]> {
    constructor(data: LootboxSyntax[]) {
        super(SavedDataTypes.Lootbox, data);
    }

    setBought(obj: LootboxSyntax, stt:boolean) {
        obj.purchased = stt;
        this.content = this.content.map(obj => obj.title === obj.title ? obj : obj);
    }

    addLootbox(lootbox: LootboxSyntax) {
        this.content.push(lootbox);
    }

    removeLootbox(title: string) {
        this.content = this.content.filter(box => box.title !== title);
    }
}

class CosmeticSavedata extends Point<CosmeticSyntax>{
    private player: Player
    constructor(data: CosmeticSyntax, player: Player) {
        super(SavedDataTypes.Cosmetics, data);
        this.player = player
        this.setDefault()
    }
    resetData(){
        this.content = {
            skin:0,
            cape:0,
            cape_equipped:false
        }
        this.setTail(false)
    }
    setCape(cape: number){
        this.content.cape = cape;
        this.player.setProperty("ao:cape_id", cape)
    }
    setSkin(skin: number){
        this.content.skin = skin;
        this.player.setProperty("ao:skin_id", skin)
    }
    setDefault(){
        this.setCape(0)
        this.setSkin(0)
        this.setTail(false)
    }
    setTail(stt: boolean){
        this.content.cape_equipped = stt;
        this.player.setProperty("ao:is_tail", stt)
    }
}

class LoadPoint {
    BattlePass: BattlePassPoint;
    Shop: ShopPoint;
    Coins: CoinsPoint;
    Experience: ExperiencePoint;
    Lootbox: LootboxPoint;
    Cosmetic: CosmeticSavedata;
    readonly player: Player;
    
    constructor(player: Player, version: string) {
        this.player = player;
        this.BattlePass = new BattlePassPoint({ max_level: 0, items: [] });
        this.Shop = new ShopPoint([]);
        this.Coins = new CoinsPoint({ value: 0,muliplier:1 });
        this.Experience = new ExperiencePoint({ value: 0, level: 0,max_level:10,max_value:10, muliplier: 1,levelup:1,levelup_multiplier:1,levelup_cost:1,levelup_cost_multiplier:1 }, player);
        this.Lootbox = new LootboxPoint([]);
        this.Cosmetic = new CosmeticSavedata({
            skin:0,
            cape:0,
            cape_equipped:false
        }, player)
        this.loadData();
    }
    saveData(){
        const points = [
            this.BattlePass,
            this.Shop,
            this.Coins,
            this.Experience,
            this.Lootbox,
            this.Cosmetic
        ];
        points.forEach(point => {
            this.player.setDynamicProperty(point.name, JSON.stringify(point.content));
        });
        world.sendMessage(`${this.player.name} saved data`)
    }
    clearData(){
        this.player.clearDynamicProperties();
    }
    loadData(){
        const points = [
            this.BattlePass,
            this.Shop,
            this.Coins,
            this.Experience,
            this.Lootbox
        ];
        points.forEach(point => {
            const data = this.player.getDynamicProperty(point.name);
            if (!data) {
                this.player.setDynamicProperty(point.name, JSON.stringify(point.content));
            }
            point.content = JSON.parse(data as string);
        });
    }
}

export {LoadPoint}