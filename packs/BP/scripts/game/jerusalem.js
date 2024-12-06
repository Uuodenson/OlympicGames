import { Entity, EntityRideableComponent, EntityRidingComponent, system, world } from "@minecraft/server";
import { getAllPlayers, getOwner, playSound, runCommand, spawnEntity } from "./utils/functions";
import { gameEvents } from "./Events";

let chair = {
    typeId: "ao:jerusalem", property: {
        skin: { name: "ao:type", id: 0 }, animation: { idle: { name: "idle", id: "idle" }, spawn: { name: "chair_spawn", id: "spawn" }, swing: { name: "chair_swing", id: "swing" } }
    }
}
let chair_animation_enum = "ao:animation"
let songdf = {
    display: "", songs: [{ song: "jerusalem_song_one", name: "Meltdown Part 1" },
    { song: "jersualem_song_two", name: "Meltdown Part 2" },
    { song: "jerusalem_song_three", name: "Upbeat Song" }, { song: "jerusalem_song_four", name: "Upbeat Song 2" }]
}
let loop;
let rounds = 3
let coords = { first: { x: 90, y: -46, z: 127 }, second: { x: 77, y: -46, z: 114 } }
let exclued_coords = {}
function returnLocation() {
    let randomx = coords.second.x + Math.floor(Math.random() * (coords.first.x - coords.second.x + 1))
    let randomz = coords.second.z + Math.floor(Math.random() * (coords.first.z - coords.second.z + 1))
    let randomy = coords.first.y
    let randomloc = { x: randomx, y: randomy, z: randomz }
    while (exclued_coords[`${randomloc.x},${randomloc.z}`]) {
        randomloc = { x: coords.second.x + Math.floor(Math.random() * (coords.first.x - coords.second.x + 1)), y: randomy, z: coords.second.z + Math.floor(Math.random() * (coords.first.z - coords.second.z + 1)) }
    }
    exclued_coords[`${randomloc.x},${randomloc.z}`] = true
    return randomloc
}
function showText() {
    let players = world.getPlayers().filter((p) => !p.hasTag("chair:out")).length
    runCommand(`/title @a actionbar Current Song: ${songdf.display}\n${rounds} lenght:${players}`)
}



async function spawnChair() {
    return new Promise((resolve) => {
        runCommand("tag @a remove chair")
        runCommand("event entity @e ao:despawn")
        let players = world.getPlayers().filter((p) => !p.hasTag("chair:out"))
        let time = Math.floor(3 + Math.random() * 20) * 20
        let randomsong = Math.floor(Math.random() * songdf.songs.length)
        let song = songdf.songs[randomsong]
        if (rounds > 0 && players.length > 1) {
            world.playMusic(song.song)
            songdf.display = song.name
            system.runTimeout(() => {
                world.stopMusic()
                players.forEach((p) => { playSound("note.pling", p.location) })
                let lplayers = players.length - 1
                for (let i = 0; i < lplayers; i++) {
                    let player = players[i]
                    let location = returnLocation()
                    const chairEN = spawnEntity(chair.typeId, location)
                    chairEN.setProperty(chair.property.skin.name, chair.property.skin.id)
                    chairEN.setProperty(chair_animation_enum, chair.property.animation.spawn.id)
                    system.runTimeout(() => {
                        chairEN.setProperty(chair_animation_enum, chair.property.animation.swing.id)
                    }, Math.round(0.75 * 20))
                }
                let playertesting = system.runInterval(() => {
                    let chairplayer = world.getPlayers().filter((p) => p.hasTag("chair"))
                    if (chairplayer.length > 0) {
                        let playerOut = world.getPlayers().filter((p) => !p.hasTag("chair"))
                        playerOut.forEach((p) => {
                            p.addTag("chair:out")
                            runCommand(`/title @a actionbar ${p.name} got out of the game!`)
                        })
                        rounds -= 1
                        spawnChair()
                        system.clearRun(playertesting)
                    }
                }, 5)
            }, time)
        } else {
            let winner = players.filter((p) => p.hasTag("chair:out") == false)[0]
            runCommand(`/title @a actionbar ${winner.name} won the game!`)
            system.clearRun(loop)
            runCommand("function resetmap")
            getAllPlayers().forEach((p) => {
                gameEvents.triggerEvent("Exp.Coins", { amount: 30, player: p }) //! Trigger Event
            })
            gameEvents.triggerEvent("NextRound", { player: getOwner()[0] })
        }
    })

}

function Loop() {
    return system.runInterval(() => {
        showText()
    }, 0)
}


function startGame() {
    let plenght = world.getPlayers().length
    if (plenght > 1) {
        loop = Loop()
        spawnChair()
        runCommand("structure load mystructure:jerusalem 76 -48 113")
        runCommand("tp @a 84 -48 121")
        runCommand("tag @a remove chair:out")
    } else {
        runCommand("title @a actionbar Game needs more than two players, to function properly!")
    }
}

system.afterEvents.scriptEventReceive.subscribe((event) => {
    if (event.id == "ao:game" && event.message == "jerusalem") {
        world.getPlayers().forEach((player) => { player.removeTag("chair:out") })
        startGame()
    }
    if (event.id == "ao:stopMusic") {
        world.stopMusic()
    }
})