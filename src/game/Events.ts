import { Player, system } from "@minecraft/server";
import { getAllPlayers, runCommand } from "./utils/FunctionUtils";
import { SavedDataTypes } from "./utils/enums/custom";
import { data } from "./utils/loaddata";
import { GameEvents } from "./utils/events";
import { ActionFormData } from "@minecraft/server-ui";
import { LoadPoint } from "./utils/LoadPoint";
import { version } from "settings/world_data";

interface GameEventProps {
    player: Player;
    level?: number;
    game?: string;
    times?: number;
    games?: Array<{ name: string; id: string }>;
}

interface PlayerData {
    coins: {
        value: number;
        muliplier: number;
    };
    exp: {
        value: number;
        max_value: number;
        level: number;
        max_level: number;
    };
}

class LevelSystem {
    static addExperience(player: Player): void {
        const playerData = data.cdata.find((p)=> p.id === player.id).data.Experience;
        playerData.addExperience(5)
    }
}
export const gameEvents = new GameEvents("ao:game", "minecraft:redstone");
export const uiEvents = new GameEvents("ao:ui", "minecraft:diamond_axe");
const showData = ():void=>{
    getAllPlayers().forEach((p)=>{
        const player = data.cdata.find(pd => pd.id === p.id)
        const action = new ActionFormData()
        .title("Show Player Data")
        .body(`Coins: ${player.data.Coins.content}\n
       Exp: ${player.data.Experience.content}\n
       Shop: ${player.data.Shop.content}\n
       Lootbox: ${player.data.Lootbox.content}\n
       `)
       .button("Close")
       .show(p).then((res)=>{
          if(res.canceled) return
      })
    })
}

const handleBattlePassUpgrade = ({ player, level }: GameEventProps): void => {
    if (!(player instanceof Player) || level === undefined) return;
    
    const playerData = data.cdata.find(pd => pd.id === player.id)
    if (!playerData) return;
    
    const item = playerData.data.BattlePass
    if (item) {
        player.sendMessage(`§6§l>>§r§f ${item.name} §ais now available to you`);
    }
};

const handleExpCoins = ({ player }: GameEventProps): void => {
    if (!(player instanceof Player)) return;

    const coins = JSON.parse(player.getDynamicProperty(SavedDataTypes.COINS) as string);
    coins.value += 3 * coins.muliplier;
    player.setDynamicProperty(SavedDataTypes.COINS, JSON.stringify(coins));

    LevelSystem.addExperience(player);
};

const handleRandomTitleAnimation = ({ game: endpoint, times = 1, games = [] }: GameEventProps): void => {
    let tickTimer = 0;
    let speed = 0.15;
    for (let i = 0; i < times; i++) {
        games.forEach(game => {
            tickTimer += speed;
            system.runTimeout(() => {
                runCommand("playsound random.pop @a");
                runCommand(`/title @a title ${game.name}`);
            }, tickTimer * 20);
        });
    }

    tickTimer += 1;
    system.runTimeout(() => {
        runCommand("playsound random.pop @a");
        runCommand(`/title @a title ${endpoint}`);
        system.runTimeout(() => {
        }, tickTimer * 10);
    }, tickTimer * 20);
};

const handleNextRound = ({ player }: GameEventProps): void => {
    if (!(player instanceof Player)) return;

    const currentRounds = (player.getDynamicProperty("ao:round") as number) || 0;
    player.setDynamicProperty("ao:round", currentRounds + 1);
    gameEvents.triggerEvent("giveShears", { player });
};
uiEvents.addEvent("showData",showData)
// Event registrations

gameEvents.addEvent("clearData",()=>{
    data.clearData()
})

gameEvents.addEvent("saveData",()=>{
    data.saveData()
})

gameEvents.addEvent("loadData",()=>{
    data.loadData()
})
gameEvents.addEvent("resetCosmetic",()=>{
    data.cdata.forEach(p=>{
        p.data.Cosmetic.resetData()
    })
})
gameEvents.addRemoteEvent("Battle Pass Upgrade", handleBattlePassUpgrade);
gameEvents.addRemoteEvent("RandomTitleAnimation", handleRandomTitleAnimation);
gameEvents.addRemoteEvent("NextRound", handleNextRound);
gameEvents.addRemoteEvent("Lobby", () => {
    // Lobby event handler
});