import { ItemStack, system, world } from "@minecraft/server";
import { getAllPlayers, getOwner, runCommand } from "./utils/functions.js"
import { gameEvents } from "./Events.js";

const config = { wheelieEntity: { typeId: "ao:rideable", property: "ao:type", value: 0 }, player: { property: "ao:wheelie" } };
let tag = "ao:wheelie"
let rounds = 0
let ids = ["minecraft:slime_ball", "minecraft:shulker_shell"]
let itemNames = ["Use item to\nLevitate", "Use item to\nReset some Blocks"]
let itemtimer = 10

function calcRounds() {
    return world.getPlayers().filter((e) => e.hasTag(tag)).length + 1
}
function getAllPlayingPlayers() {
    return world.getPlayers().filter((e) => e.getDynamicProperty(config.player.property) == 1)
}

function getWinner() {
    if (getAllPlayingPlayers().length <= 1) {
        return getAllPlayingPlayers()[0]
    }
    return null
}

function startGame() {
    runCommand("structure load mystructure:map 66 -49 105")
    runCommand("event entity @e ao:despawn")
    runCommand("tag @a remove " + tag)
    for (const player of world.getPlayers()) {
        player.addTag(tag)
        player.setDynamicProperty(config.player.property, 1)
        const entity = world.getDimension("overworld").spawnEntity(config.wheelieEntity.typeId, player.location)
        let namearray = player.name.split(" ", 1)
        let setname = () => {
            let name
            for (const na in namearray) {
                if (na == " ") return
                name += namearray[na]
            }
            return name
        }
        let name = setname()

        // entity.setProperty(config.wheelieEntity.property, config.wheelieEntity.value)
        entity.addTag("" + player.name)
        player.runCommandAsync(`ride @s start_riding @e[tag="${player.name}"] teleport_ride`)
    }
    rounds = calcRounds()
    itemtimer = 10
    GameLoop()
}

let scorepoints = []

function getScoreWinner() {
    let finalscorepoints = []
    getAllPlayers().forEach(player => {
        let score = player.getDynamicProperty("ao:score")
        scorepoints.forEach(scorepoint => {
            if (scorepoint.id == player.id) {
                finalscorepoints.push({ id: player.id, score: scorepoint.score, player: player.name })
            }
        })
    })
    finalscorepoints.sort(function (a, b) {
        return b.score - a.score
    })
    console.error(JSON.stringify(finalscorepoints))
    return finalscorepoints[0]
}
function findScoreEntry(player) {
    let isInScorePoints = false
    let scorepointouter
    scorepoints.forEach(scorepoint => {
        if (scorepoint.id == player.id) {
            isInScorePoints = true
            scorepointouter = scorepoint
        }
    })
    if (isInScorePoints == false) {
        scorepoints.push({ id: player.id, score: 0, player: player.name })
        return scorepoints[scorepoints.length - 1]
    } else {
        return scorepointouter
    }


}

function resetGame() {
    runCommand("structure load mystructure:map 66 -49 105")
    runCommand("tp @a 82 -48 120")
    runCommand("event entity @e ao:despawn")
    for (const player of world.getPlayers()) {
        if (player.hasTag(tag)) {
            const entity = world.getDimension("overworld").spawnEntity(config.wheelieEntity.typeId, player.location)
            entity.addTag(player.name)
            player.setDynamicProperty(config.player.property, 1)
            player.runCommandAsync(`ride @s start_riding @e[tag="${player.name}"] teleport_ride`)
        }
    }
    runCommand("say next round")
    --rounds
}
function setActionbar() {
    for (const player of world.getPlayers()) {
        player.onScreenDisplay.setActionBar(`Rounds: ${rounds} Timer: ${itemtimer}`)
    }
}


function GameLoop() {
    let loop = system.runInterval(() => {
        let player = getWinner()
        if (player && rounds >= 1) {
            let scoreinfo = findScoreEntry(player)
            scoreinfo.score += 1
            resetGame()
        }
        if (rounds < 1) {
            system.clearRun(loop)
            system.clearRun(blockloop)
            system.clearRun(itemloop)
            world.afterEvents.itemUse.unsubscribe(itemUseEvent)
            runCommand("function resetmap")
            let scoreinfo = getScoreWinner()
            getAllPlayers().forEach((player) => {
                if (scoreinfo.id == player.id) {
                    world.sendMessage(player.name + " wins!")
                }
                gameEvents.triggerEvent("Exp.Coins", { amounts: 30, player: player }) //! Trigger Event
            })
            gameEvents.triggerEvent("NextRound", { player: getOwner()[0] })
        }
        setActionbar()
        let wheelies = world.getDimension("overworld").getEntities().filter((e) => e.typeId === config.wheelieEntity.typeId)
        wheelies.forEach((wheelie) => {
            wheelie.runCommandAsync("execute if block ~ ~-1 ~ sand run setblock ~ ~-1 ~ minecraft:lime_concrete")
        })
        for (const pl of world.getPlayers()) {
            const block = world.getDimension("overworld").getBlock({ x: pl.location.x, y: pl.location.y - 1, z: pl.location.z })
            if ((block.typeId == "minecraft:red_concrete" || block.typeId == "minecraft:blackstone") && pl.getDynamicProperty(config.player.property) == 1) {
                pl.setDynamicProperty(config.player.property, 0)
                world.sendMessage(pl.name + ": Got knocked Out!")
            }
            let wheelie = world.getDimension("overworld").getEntities().filter((e) => e.typeId === config.wheelieEntity.typeId && e.hasTag("" + pl.name))
            if (wheelie.length > 0) {
                const whel = wheelie[0]
                function calcdistance(player, wheelie) {
                    let distance = Math.sqrt(Math.pow(player.location.x - wheelie.location.x, 2) + Math.pow(player.location.y - wheelie.location.y, 2) + Math.pow(player.location.z - wheelie.location.z, 2))
                    return distance
                }
                let distance = calcdistance(pl, whel)
                if (distance > 2) {
                    pl.setDynamicProperty(config.player.property, 0)
                    world.sendMessage(pl.name + ": Got knocked Out!")
                }
            }

        }
    }, 0)
    let itemloop = system.runInterval(() => {
        if (itemtimer > 0) {
            itemtimer -= 1
        }
        if (itemtimer <= 0) {
            for (const player of world.getPlayers()) {
                let random = Math.random() * ids.length
                let item = new ItemStack(ids[Math.floor(random)], 1)
                item.nameTag = itemNames[Math.floor(random)]
                let container = player.getComponent("inventory").container
                container.setItem(3, item)
            }
            itemtimer = 10
        }
    }, 40)
    let index = 1;
    let blockloop = system.runInterval(() => {
        switch (index) {
            case 1:
                world.getDimension("overworld").runCommand("fill 64 -49 101 104 -49 141 yellow_concrete replace lime_concrete")
                index++
                break;
            case 2:
                world.getDimension("overworld").runCommand("fill 64 -49 101 104 -49 141 orange_concrete replace yellow_concrete")
                index++
                break;
            case 3:
                world.getDimension("overworld").runCommand("fill 64 -49 101 104 -49 141 red_concrete replace orange_concrete")
                index = 1
                break;
        }
    }, 60)
    let itemUseEvent = world.afterEvents.itemUse.subscribe((event) => {
        let item = event.itemStack

        if (ids[0] == item.typeId) {
            let entity = world.getDimension("overworld").getEntities().filter((e) => e.typeId === config.wheelieEntity.typeId && e.hasTag(event.source.name))
            let wheelie = entity.length > 0 ? entity[0] : null
            if (wheelie) {
                wheelie.runCommandAsync("effect @s levitation 1 3")
                event.source.runCommand("clear @s " + ids[0])
            }
        }
        if (ids[1] == item.typeId) {
            let position = "~-3 ~-2 ~-3 ~3 ~ ~3"
            event.source.runCommand("fill " + position + "sand replace lime_concrete")
            event.source.runCommand("fill " + position + "sand replace yellow_concrete")
            event.source.runCommand("fill " + position + "sand replace orange_concrete")
            event.source.runCommand("fill " + position + "sand replace red_concrete")
            event.source.runCommand("clear @s " + ids[1])
        }

    })
}



system.afterEvents.scriptEventReceive.subscribe((event) => {
    if (event.id == "ao:game" && event.message == "wheelie") {
        startGame()
    }
})