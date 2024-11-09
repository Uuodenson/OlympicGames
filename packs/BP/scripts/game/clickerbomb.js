import { world, system, Player, ItemStack } from "@minecraft/server"
import resetSkin, { calcTimetoTicks, getAllPlayers, getOwner, runCommand } from "./utils/functions"
import { gameEvents } from "./Events"

let bomb = 0
let range = [0]
let timer = 15
let current_player
let players;
let indexed_player = 0
let loop
let cap_max_number = 30
let can_interact = true
let cube_type = { one: 1, two: 2, three: 3, four: 4 }
function GameLoop() {
    loop = system.runInterval(() => {
        world.getDimension("overworld").runCommandAsync("/execute as @a run inputpermission set @s camera disabled")
        showText()
        if (getPlayers().length <= 1) {
            system.clearRun(loop)
            world.afterEvents.itemUse.unsubscribe(itemUseEvent)
            if (getPlayers()[0] instanceof Player) {
                world.sendMessage("§l" + getPlayers()[0].name + "§r wins!")
                runCommand("/function resetmap")
            }
            getAllPlayers().forEach(player => {
                gameEvents.triggerEvent("Exp.Coins", { amount: 30, player: player }) //! Trigger Event
            })
            gameEvents.triggerEvent("NextRound", { player: getOwner()[0] })
            gameEvents.triggerEvent("Looby")
            world.getDimension("overworld").runCommandAsync("/execute as @a run inputpermission set @s camera enabled")
            world.getDimension("overworld").runCommandAsync("/execute as @a run camera @s clear")
        }
    }, 20)

    const itemUseEvent = world.afterEvents.itemUse.subscribe((event) => {
        showItems(event, "minecraft:stone_sword", 1, cube_type.one)
        showItems(event, "minecraft:golden_sword", 2, cube_type.two)
        showItems(event, "minecraft:diamond_sword", 3, cube_type.three)
    })
}

function setupRange() {
    let random = Math.floor(Math.random() * 30)
    range[0] = random
}

function showItems(event, item_string, amount, cube) {
    if (event.itemStack.typeId == item_string && current_player == event.source && can_interact) {
        can_interact = false
        system.runTimeout(() => {
            const treassure = world.getDimension("overworld").getEntities().filter((e) => e.hasTag("treassure") == false && e.typeId == "ao:interactable")
            treassure.forEach((entity) => {
                entity.remove()
            })
        }, 40)
        system.runTimeout(() => {

            const cubes = world.getDimension("overworld").spawnEntity("ao:interactable",
                { x: event.source.location.x, y: event.source.location.y + 1.75, z: event.source.location.z })
            cubes.setProperty("ao:type", cube)
            cubes.nameTag = cube.toString()

            if (bomb > cap_max_number) {
                bomb = 0
            }
            bomb += amount
            if (getPlayers().length > indexed_player + 1) {
                indexed_player++;
            }
            // otherwise, reset to 0
            else {
                indexed_player = 0;
            }
            event.source.runCommandAsync("clear @s")
            if (bomb > range[0]) {
                current_player.setProperty("ao:is_spectator", true)
                world.sendMessage(current_player.name + " " + "got eaten by the Kraken")
                const treassure = world.getDimension("overworld").spawnEntity("ao:interactable", { x: 76.57, y: -48.00, z: 121.44 })
                treassure.setProperty("ao:type", cube_type.four)
                treassure.addTag("treassure")
                treassure.teleport({ x: 76.57, y: -48.00, z: 121.44 }, { facingLocation: { x: 83.96, y: -47.53, z: 121.46 } })
                let i = 0;
                let commands = [
                    { command: "/camera @a clear", tick: 0 },
                    { command: "/camera @a fade time 1 2 1", tick: 0 },
                    { command: "/effect @a invisibility 30 30 true", tick: 10 },
                    { command: "/testfor @p", tick: 8 },
                    { command: "/camera @a set minecraft:free ease 1 in_out_quad pos 87.37 -45.00 121.37 facing 76.93 -46.77 121.50", tick: 0 },
                    { command: "/camera @a set minecraft:free ease 8 in_out_quad pos 81.21 -46.13 121.53 facing 74.92 -45.52 121.42", tick: 20 },
                    { command: "/playsound treassure @a", tick: 0 },
                    { command: "/playanimation @e[type=ao:interactable] treassure", tick: 18 },
                    { command: "/camera @a fade time 1 1 1", tick: 70 },
                    { command: "/event entity @e[type=ao:interactable] despawn", tick: 20 },
                    { command: "/camera @a clear", tick: 0 },
                    { command: "/effect @a clear", tick: 0 },
                ]
                commands.forEach((command) => {

                    i = i + command.tick
                    system.runTimeout(() => {
                        world.getDimension("overworld").runCommand(command.command)
                    }, i)
                })
                system.runTimeout(() => {
                    if (current_player instanceof Player) {
                        event.source.removeTag("clicker")
                        current_player = getPlayers()[indexed_player] ? getPlayers()[indexed_player] : getPlayers().filter((p) => p.hasTag("clicker"))[0]
                        if (getPlayers().length > indexed_player + 1) {
                            indexed_player++;
                        }
                        // otherwise, reset to 0
                        else {
                            indexed_player = 0;
                        }
                        // show ui for the next player (or the first one if we just looped)
                        indexed_player += 1
                    }
                    bomb = 0

                    world.sendMessage(current_player.name)
                    giveItems()
                    if (current_player) {
                        current_player.playSound("note.pling", current_player.location)
                        world.getDimension("overworld").spawnParticle("minecraft:flame", current_player.location)
                        current_player.runCommandAsync("/camera @a set minecraft:free ease 0.5 in_sine pos ^^2^5 facing @s")
                        can_interact = true
                    }
                    resetSkin()
                }, i + 10)
            }
            else {
                current_player = getPlayers()[indexed_player] ? getPlayers()[indexed_player] : getPlayers().filter((p) => p.hasTag("clicker"))[0]
                current_player.playSound("note.pling", current_player.location)
                giveItems()
                current_player.runCommandAsync("/camera @a set minecraft:free ease 0.5 in_sine pos ^^2^5 facing @s")
                can_interact = true
            }
        }, 5)
    }
    else {
        if (event.itemStack.typeId == item_string) {
            world.sendMessage("You can not do it right now!")
            world.playSound("random.pop", event.source.location)
        }
    }
}

function showText() {
    for (const player of world.getPlayers()) {
        if (player == current_player) {
            player.onScreenDisplay.setActionBar("§6>> §cIts your Turn §6<<\n§f     Points: " + bomb)
        } else {
            if (current_player) {
                player.onScreenDisplay.setActionBar("§6>> Its " + current_player.name + " Turn §6<<\n§f     Points: " + bomb)
            }
        }
    }
}

function teleportPlayers() {
    for (let i = 0; i < players.length; i++) {
        if (i == 0) {
            players[i].teleport({ x: 86, y: -46, z: 119 }, { facingLocation: { x: 87, y: -46, z: 119 } })
        }
        if (i == 1) {
            players[i].teleport({ x: 86, y: -46, z: 121 }, { facingLocation: { x: 87, y: -46, z: 121 } })
        }
        if (i == 2) {
            players[i].teleport({ x: 82, y: -46, z: 123 }, { facingLocation: { x: 82, y: -46, z: 125 } })
        }
        if (i == 3) {
            players[i].teleport({ x: 82, y: -46, z: 119 }, { facingLocation: { x: 81, y: -46, z: 119 } })
        }
        if (i == 4) {
            players[i].teleport({ x: 82, y: -46, z: 121 }, { facingLocation: { x: 81, y: -46, z: 121 } })
        }
        if (i == 5) {
            players[i].teleport({ x: 82, y: -46, z: 123 }, { facingLocation: { x: 81, y: -46, z: 121 } })
        }
    }
}
function giveItems() {
    const inventory = current_player.getComponent("inventory").container
    let sword = new ItemStack("minecraft:stone_sword", 1)
    sword.nameTag = "Add 1 Point"
    inventory.setItem(0, sword)
    let axe = new ItemStack("minecraft:golden_sword", 1)
    axe.nameTag = "Add 2 Points"
    inventory.setItem(1, axe)
    let bow = new ItemStack("minecraft:diamond_sword", 1)
    bow.nameTag = "Add 3 Points"
    inventory.setItem(2, bow)
}

function setupPlayers() {
    runCommand("tag @a remove clicker")
    runCommand("tag @a add clicker")
    players = getAllPlayers().filter((p) => p.hasTag("clicker"))
}

function getPlayers() {
    return getAllPlayers().filter((p) => p.hasTag("clicker"))
}

gameEvents.addRemoteEvent("SetupTreasure", () => {
    getAllPlayers().forEach(player => {
        player.setProperty("ao:is_spectator", false)
    })
})
gameEvents.triggerEvent("SetupTreasure", {})

system.afterEvents.scriptEventReceive.subscribe((event) => {
    if (event.id == "ao:game" && event.message == "clicker") {
        setupPlayers()
        if (getPlayers().length == 1) return;
        can_interact = true
        if (loop) {
            system.clearRun(loop)
        }
        world.getDimension("overworld").runCommand("clear @a")
        world.getDimension("overworld").runCommand("/execute as @a run inputpermission set @s camera disabled")
        world.getDimension("overworld").runCommand("/execute as @a run inputpermission set @s movement disabled")
        indexed_player = 0
        timer = 15
        bomb = 0
        setupRange()
        GameLoop()
        current_player = getPlayers()[indexed_player] ? getPlayers()[indexed_player] : getAllPlayers()[0]

        giveItems()
        teleportPlayers()
        current_player.runCommandAsync("/camera @a set minecraft:free ease 0.5 in_sine pos ^^2^5 facing @s")
    }
    if (event.id == "ao:setup_treassure") {
        const treassure = world.getDimension("overworld").getEntities().filter((e) => e.hasTag("treassure"))
        treassure.forEach((entity) => {
            entity.setProperty("ao:type", cube_type.four)
        })
        gameEvents.triggerEvent("SetupTreasure", {})
    }
})
