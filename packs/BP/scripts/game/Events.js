import { Player, system, world } from "@minecraft/server";
import { getAllPlayers, runCommand } from "./utils/functions";
import { ActionFormData } from "@minecraft/server-ui";
import { worldData } from "../settings/world_data";
import { EndScene } from "../cutscenes/start";
import { SavedDataTypes } from "./utils/enums/custom";
import { BattlpassSyntax } from "./utils/syntax/saveddatatypes";
import { data } from "./utils/loaddata";
import { GameEvents } from "./utils/events";
import { saveinGameData } from "./utils/savingdata";
import { SaveGameData } from "./utils/Editor";
export const gameEvents = new GameEvents("ao:game")

export const uiEvents = new GameEvents("ao:ui")

gameEvents.addEvent("Exp.Coins", (first = 10, second = 20, third = 30) => {
    getAllPlayers().forEach(player => {
        world.sendMessage(`Exp: ${first} ${second} ${third}`)
    })
})

gameEvents.addRemoteEvent("Battle Pass Upgrade", (props) => {
    let player = props.player
    let level = props.level
    if (player instanceof Player) {
        let item = BattlpassSyntax.items.find(item => {
            let index = BattlpassSyntax.items.indexOf(item)
            return index == level
        })
        if (item) {
            let index = BattlpassSyntax.items.indexOf(item)
            player.sendMessage("§6§l>>§r§f " + item.name + " §ais know available to you")
        }
    }
})

gameEvents.addRemoteEvent("Exp.Coins", (props) => {
    const levelUpThresholds = [
        0, 20, 45, 75, 110, 150, 195, 245, 300, 360, 425, 495, 570, 650, 735
    ];
    world.sendMessage(JSON.stringify(props))
    /**
     * @type {{value: number, muliplier: number}}
     */
    let coins = JSON.parse(props.player.getDynamicProperty(SavedDataTypes.COINS))
    /**
     * @type {{value: number, max_value: number, level: number, max_level: number}}
     */
    let exp = JSON.parse(props.player.getDynamicProperty(SavedDataTypes.EXP))
    let winnericon = ["", "", ""]
    coins.value += 3 * coins.muliplier
    let filteredBattlePass = data.find(data => data.id === props.player.id).data.find(data => data.id === 0).data.filter(data => data.purchased === false)
    world.sendMessage(exp.value + " " + exp.max_value + " " + exp.level + " " + exp.max_level)
    if (exp.value >= levelUpThresholds[exp.level]) {
        exp.level += 1
        if (filteredBattlePass.length > 0) {
            filteredBattlePass[0].purchased = true
            props.player.sendMessage("BattlepassUpgrade" + filteredBattlePass[0].title)
        }
        gameEvents.triggerEvent("Battle Pass Upgrade", { player: props.player, level: exp.level })
    } else {
        exp.value += 0.5
    }
    props.player.setDynamicProperty(SavedDataTypes.COINS, JSON.stringify(coins))
    props.player.setDynamicProperty(SavedDataTypes.EXP, JSON.stringify(exp))
    world.sendMessage(`${winnericon[0]} Player1`)
    world.sendMessage(`${winnericon[1]} Player2`)
    world.sendMessage(`${winnericon[2]} Player3`)
})

export function givePoints(player, amount = 1, winners) {

    const levelUpThresholds = [
        10, 20, 45, 75, 110, 150, 195, 245, 300, 360, 425, 495
    ];
    let exp = data.find((data) => data.id === player.id).data.find((data) => data.id === 2).data
    let coins = data.find(data => data.id === player.id).data.find(data => data.id === 1).data
    exp.value += amount
    coins.value += amount * coins.muliplier
    let winnericon = ["", "", ""]
    coins.value += 3 * coins.muliplier
    let filteredBattlePass = data.find(data => data.id === player.id).data.find(data => data.id === 0).data.filter(data => data.purchased === false)
    if (exp.value >= levelUpThresholds[exp.level]) {
        exp.level += 1
        if (filteredBattlePass.length > 0) {
            filteredBattlePass[0].purchased = true
            player.sendMessage("BattlepassUpgrade" + filteredBattlePass[0].title)
        }
        gameEvents.triggerEvent("Battle Pass Upgrade", { player: player, level: exp.level })
    } else {
        exp.value += amount
    }
    for (let ob of Object.keys(winners)) {
        if (winners[ob] == player) {
            exp.value += amount * 2
        }
        else {
            winners[ob] = { name: winners[ob] }
        }

    }

    player.sendMessage(`${winnericon[0]} ${winners.first.name}`)
    player.sendMessage(`${winnericon[1]} ${winners.second.name}`)
    player.sendMessage(`${winnericon[2]} ${winners.third.name}`)
    SaveGameData(player)
}


gameEvents.addRemoteEvent("RandomTitleAnimation", (props) => {
    let endpoint = props.game
    let times = props.times
    let games = props.games
    let tickTimer = 0
    for (let i = 0; i < times; i++) {
        games.forEach(game => {
            tickTimer += 0.15
            system.runTimeout(() => {
                runCommand("say hello")
                runCommand("playsound random.pop @a")
                runCommand("/title @a title " + game.name)
            }, tickTimer * 20)
        })
    }

    tickTimer += 1
    system.runTimeout(() => {
        runCommand("playsound random.pop @a")
        runCommand("title @a title " + endpoint)
        system.runTimeout(() => {
            runCommand(`/scriptevent ao:game ${endpoint}`)
        }, tickTimer * 10)
    }, tickTimer * 20)
})

gameEvents.addRemoteEvent("giveShears", (props) => {
    let player = props.player
    if (player instanceof Player) {
        runCommand(`give ${player.name} minecraft:shears`)
        world.sendMessage("Shears given to " + player.name)
    }
})

gameEvents.addRemoteEvent("NextRound", (props) => {
    let player = props.player
    if (player instanceof Player) {
        let rounds = player.getDynamicProperty("ao:round")
        if (rounds) {
            rounds = player.setDynamicProperty("ao:round", rounds + 1)
        }
        else {
            rounds = player.setDynamicProperty("ao:round", 1)
        }
        gameEvents.triggerEvent("giveShears", { player: player })
    }
})

gameEvents.addRemoteEvent("Looby", () => {

})

gameEvents.addRemoteEvent("GameFinished", () => {
    async function endScene() {
        await EndScene()
    }
    endScene()
    world.sendMessage("Game Finished")
    worldData.game.rounds = 0
    world.setDynamicProperty("settings", JSON.stringify(worldData))
})