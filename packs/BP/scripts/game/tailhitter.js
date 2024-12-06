import { world, system, Player, ScoreboardObjective } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui"
import { calcTimetoTicks, getAllPlayers, getOwner, getRandomPlayer, runCommand, timeValues } from "./utils/functions";
import { gameEvents } from "./Events";
let timer = timeValues.default //30 seconds
let turns
let turns_multiplier = 3
let rounds

function calcRounds() {
    // world.getPlayers().length + 1
    return 1
}

const score = []
/**
 * @type {ScoreboardObjective}
 */
let scoreboard
function findoraddScore(player) {
    let scorechild = false
    score.forEach(score => {
        if (score.id == player.id) {
            scorechild = score
        }
    })
    if (scorechild == false) {
        score.push({ name: player.name, score: 0, id: player.id })
        return score[score.length - 1]
    }
    return scorechild
}

function findhighestScoreEntry() {
    let validScores = []
    getAllPlayers().forEach(player => {
        score.forEach(score => {
            if (score.id == player.id) {
                validScores.push(score)
            }
        })
    })
    validScores.sort(function (a, b) {
        return b.score - a.score
    })
    return validScores
}

function calculateTurns() {
    let length = getAllPlayers().length
    turns = length * turns_multiplier
    return 1
}
function resetValues() {
    timer = timeValues.default
    turns = 0
}
//Gives the player who hit the tail-person the tail and reset the timer and decrease the turns
/**
 * 
 * @param {Player} hitter 
 */
function updateTail(hitter) {
    getAllPlayers().forEach(player => {
        player.setProperty("ao:is_tail", false)
        player.nameTag = player.name
    })
    hitter.setProperty("ao:is_tail", true)
    findoraddScore(hitter).score++
    hitter.nameTag = "§6" + hitter.name
    timer = timeValues.default
    turns--
    runCommand("say " + hitter.name + " is has the tail!")
    world.playSound("note.pling", hitter.location)
    if (scoreboard) {
        scoreboard.setScore(hitter, scoreboard.getScore(hitter) + 1)
    } else {
        scoreboard.addScore(hitter, 0)
    }
}

function displayText() {
    getAllPlayers().forEach(player => {
        player.onScreenDisplay.setActionBar("Timer: " + timer + " , " + "Turns left: " + turns)
    })
}

function GameLoop() {
    let loop = system.runInterval(() => {
        if (rounds < 1) {
            system.clearRun(loop)
            system.clearRun(timerLoop)
            world.afterEvents.entityHitEntity.unsubscribe(hitevent)
            getAllPlayers().forEach(player => {
                player.setProperty("ao:is_tail", false)
            })
            let highscores = findhighestScoreEntry()
            world.sendMessage(JSON.stringify(highscores))
            world.sendMessage(highscores[0].name + " wins with" + highscores[0].score + " points!")
            // calculateWinner()
            world.getAllPlayers().forEach((player) => {
                gameEvents.triggerEvent("Exp.Coins", { amounts: 30, player: player }) //! Trigger Event
            })
            gameEvents.triggerEvent("NextRound", { player: getOwner()[0] })
            runCommand("function resetmap")
        }
        if (turns < 1) {
            rounds--
            turns = calculateTurns()
            getRandomPlayer().setProperty("ao:is_tail", true)
        }
        displayText()
        runCommand("execute as @a run execute at @s if block ~ ~-1 ~ barrier run effect @s levitation 1 7 true")
        runCommand("execute as @a run execute at @s if block ~ ~-1 ~ barrier run playsound ventilator @s ~ ~ ~")
        runCommand("execute as @a run execute at @s if block ~ ~-1 ~ barrier run particle minecraft:cauldron_explosion_emitter ~ ~-1 ~")
    }, 0)

    let timerLoop = system.runInterval(() => {
        timer--
        if (timer <= 0) {
            updateTail(getRandomPlayer())
        }
    }, calcTimetoTicks(1))

    let hitevent = world.afterEvents.entityHitEntity.subscribe((event) => {
        if (event.damagingEntity instanceof Player && event.hitEntity instanceof Player && event.damagingEntity.player.getProperty("ao:is_tail") == false && event.hitEntity.player.getProperty("ao:is_tail") == true) {
            updateTail(event.damagingEntity)
        }
    })
}

function spawnVentilators() {
    let positions = ["85 -49 131", "94 -49 120", "83 -49 109", "72 -49 120"]
    for (let i = 0; i < positions.length; i++) {
        let pos = positions[i]
        runCommand("/structure load mystructure:ventilator " + pos)
    }
}

function setupScoreboard() {
    let scoreboard = world.scoreboard.getObjective("tailhitter")
    if (scoreboard) {
        world.scoreboard.removeObjective("tailhitter")
    } else {
        world.scoreboard.addObjective("tailhitter", "Tail Hitter")
        getAllPlayers().forEach(player => {
            scoreboard = world.scoreboard.getObjective("tailhitter")
            scoreboard.addScore(player, 0)
        })
        scoreboard = world.scoreboard.getObjective("tailhitter")
    }
    return scoreboard
}

function calculateWinner() {
    const objective = world.scoreboard.getObjective("tailhitter");
    const players = getAllPlayers();
    let scorearray = ["-", "-", "-"];
    if (players.length >= 3) {
        scorearray = []
    }
    let participant = objective.getParticipants();
    for (const part of participant) {
        for (const player of players) {
            if (player.name === part.displayName) {
                scorearray.push(player);
            }
        }
    }
    scorearray.sort(function (a, b) {
        return objective.getScore(b) - objective.getScore(a);
    });
    return { first: scorearray[0], second: scorearray[1], third: scorearray[2] }
}



system.afterEvents.scriptEventReceive.subscribe((event) => {
    if (event.id == "ao:game" && event.message == "tailhitter") {
        GameLoop()
        resetValues()
        turns = calculateTurns()
        getRandomPlayer().setProperty("ao:is_tail", true)
        runCommand("structure load mystructure:tailmap 66 -50 103")
        spawnVentilators()
        scoreboard = setupScoreboard()
        rounds = calcRounds()
        runCommand("scoreboard objectives setdisplay sidebar tailhitter")
    }
    if (event.id == "ao:tail") {
        getAllPlayers().forEach(player => {
            let tail = player.getProperty("ao:is_tail")
            let boolean = true
            if (tail) {
                boolean = false
            }
            player.setProperty("ao:is_tail", boolean)
        })
    }
})