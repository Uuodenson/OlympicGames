import { Player, system, world } from "@minecraft/server";
import { getAllPlayers, runCommand } from "./utils/functions";
import { ActionFormData } from "@minecraft/server-ui";
import { worldData } from "../settings/world_data";
import { EndScene } from "../cutscenes/start";
import { SavedDataTypes } from "./utils/enums/custom";
import { BattlpassSyntax } from "./utils/syntax/saveddatatypes";
import { data } from "./utils/loaddata";
import { GameEvents } from "./utils/events";
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
    if (exp.value >= exp.max_value && exp.level < exp.max_level) {
        exp.level += 1
        exp.max_value = exp.value - exp.level
        exp.value = 0
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
    world.sendMessage("Now you have to go to the Lobby")
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