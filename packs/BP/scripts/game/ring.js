import { system, world, Player } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import resetSkin, { calcDistance, getAllPlayers, getOwner } from "./utils/functions";
import { gameEvents } from "./Events";
let timer = 120;
let spawn_timer = 2;
let crown_timer = 17
let ds = 1.5; //Distance
let loop;
let canon_icon = ""

let positions = [
    { one: { x: 77, y: -43, z: 138 }, two: { x: 77, y: -43, z: 104 }, },
    { one: { x: 91, y: -43, z: 104 }, two: { x: 91, y: -43, z: 138 } },
    { one: { x: 101, y: -43, z: 114 }, two: { x: 67, y: -43, z: 114 } },
    { one: { x: 101, y: -43, z: 128 }, two: { x: 67, y: -43, z: 128 } },
];

function spawnRings() {
    for (let i = 0; i < 3 + Math.floor(Math.random() * 3); i++) {
        let y_pos = [-46, -43, -40]
        let random_y_pos = Math.floor(Math.random() * y_pos.length);
        let random = Math.floor(Math.random() * positions.length);
        let pos = positions[random];
        let location = pos.one;
        let entity = world
            .getDimension("overworld")
            .spawnEntity("ao:ring", { x: location.x, y: y_pos[random_y_pos], z: location.z });
        entity.setDynamicProperty("ao:index", random);
        world.playSound("random.pop", pos.one)
    }
}

function spawnCrownRing() {
    let location = { x: 84, y: -44, z: 121 }
    let crowns = world.getDimension("overworld").getEntities().filter((e) => e.getProperty("ao:type") == 3);
    for (let crown of crowns) {
        crown.remove();
    }
    let entity = world.getDimension("overworld").spawnEntity("ao:ring", location);
    entity.setProperty("ao:type", 3);
    let el = entity.location
    world.getDimension("overworld").spawnParticle("minecraft:crop_growth_area_emitter", el)
    world.playSound("crown", el)
    world.sendMessage("Crown Ring Spawned!")
}

function moveRings() {
    let steps = 500
    let rings = world
        .getDimension("overworld")
        .getEntities()
        .filter((e) => e.typeId === "ao:ring");
    for (let ring of rings) {
        if (ring.getDynamicProperty("ao:index") >= 0) {
            let rl = ring.location
            let stepX = (positions[ring.getDynamicProperty("ao:index")].two.x - positions[ring.getDynamicProperty("ao:index")].one.x) / steps;
            let stepZ = (positions[ring.getDynamicProperty("ao:index")].two.z - positions[ring.getDynamicProperty("ao:index")].one.z) / steps;
            ring.teleport({ x: rl.x + stepX, y: rl.y, z: rl.z + stepZ },
                { facingLocation: positions[ring.getDynamicProperty("ao:index")].two });
            if (Math.abs(rl.x - positions[ring.getDynamicProperty("ao:index")].two.x) < 0.1 && Math.abs(rl.z - positions[ring.getDynamicProperty("ao:index")].two.z) < 0.1) {
                ring.triggerEvent("despawn");
            }
        }
        if (ring.getDynamicProperty("ao:type") == 3) {
            let crown = world
                .getDimension("overworld")
                .getEntities()
                .filter((e) => e.typeId === "ao:ring")[0];
            let y = crown.location.y;
            for (let i = 0; i < 6; i++) {
                crown.teleport({ x: crown.location.x, y: y + i, z: crown.location.z });
                system.runTimeout(() => {
                    crown.teleport({ x: crown.location.x, y: y + i - 1, z: crown.location.z });
                }, 1); // add a delay to make it look like the ring is moving
            }
        }


    }
}

function spawnInteractable() {
    let locations = [
        { x: 86, y: -48, z: 113 },
        { x: 71, y: -48, z: 113 },
        { x: 79, y: -48, z: 129 },
        { x: 90, y: -48, z: 128 },
        { x: 94, y: -48, z: 120 }
    ]
    let count = 1
    if (world.getPlayers().length - 1 > 1) {
        count = world.getPlayers().length - 1
    }
    for (let i = 0; i < count; i++) {
        let location = locations[Math.floor(Math.random() * locations.length)]
        let entity = world.getDimension("overworld").spawnEntity("ao:interactable", location);
        entity.setDynamicProperty("ao:timer", 10)
        entity.setProperty("ao:type", 0)
    }
}
function timerInteractable() {
    let interactables = world.getDimension("overworld").getEntities().filter((e) => e.typeId === "ao:interactable");
    for (let interactable of interactables) {
        if (interactable.getDynamicProperty("ao:timer")) {
            interactable.setDynamicProperty("ao:timer", interactable.getDynamicProperty("ao:timer") - 1);
            interactable.nameTag = "Timer: " + interactable.getDynamicProperty("ao:timer");
            if (interactable.getDynamicProperty("ao:timer") <= 0) {
                interactable.remove();
            }
        }
    }
}

function calculateWinner() {
    const objective = world.scoreboard.getObjective("ring");
    const players = world.getPlayers();
    let scorearray = [];
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
    let body_string =
        "\n\n\n\n----------\n1: §a" +
        scorearray[0].name +
        "§r§f with " +
        objective.getScore(scorearray[0]) +
        " points!";
    if (scorearray.length > 1) {
        body_string +=
            "\n" +
            "2: §b" +
            scorearray[1].name +
            "§r§f with " +
            objective.getScore(scorearray[1]) +
            " points!";
    }
    if (scorearray.length > 2) {
        body_string +=
            "\n" +
            "2: §6" +
            scorearray[2].name +
            "§r§f with " +
            objective.getScore(scorearray[2]) +
            " points!";
    }
    body_string +=
        "\nThere have been " +
        scorearray.length +
        " players participating!\n----------\n\n\n\n";
    const action = new ActionFormData()
        .title("Results")
        .body(body_string)
        .button("Close");
    for (const player of players) {
        action.show(player);
    }
    return scorearray[0]
}
function setupScoreBoard() {
    if (world.scoreboard) {
        const objective = world.scoreboard.getObjective("ring");
        if (objective) {
            world.scoreboard.removeObjective("ring");
        }
        world.scoreboard.addObjective("ring", "Ring Game Points");
        const dimension = world.getDimension("overworld");
        if (dimension) {
            dimension.runCommandAsync(
                "scoreboard objectives setdisplay sidebar ring"
            );
            dimension.runCommandAsync("scoreboard players set @a ring 0");
        }
    }
}
function showTimer(timer) {
    const players = world.getPlayers();
    if (players) {
        for (const player of players) {
            if (timer > 0) {
                let icon = ""
                if (player.getProperty("ao:skin_id") == 1) {
                    icon = canon_icon
                }
                player.onScreenDisplay.setActionBar(icon + " " + "Timer: " + timer + " " + player.getProperty("ao:skin_id"));
            } else {
                player.onScreenDisplay.setActionBar("§cGame Over");
            }
        }
    }
}

function canonsystem() {
    const canonentities = world.getDimension("overworld").getEntities().filter((e) => e.typeId === "ao:canon");
    for (const player of world.getPlayers().filter((e) => e.getProperty("ao:skin_id") !== 1)) {
        for (const canon of canonentities) {
            if (calcDistance(canon.location, player.location) < 1) {
                player.setProperty("ao:skin_id", 1)
                canon.remove()
            }
        }
    }
    const canons = world.getPlayers().filter((e) => e.getProperty("ao:skin_id") == 1);
    for (const canon of canons) {
        if (canon.isSneaking) {
            let lookdirection = canon.getViewDirection();
            canon.applyKnockback(
                lookdirection.x * 1.5,
                lookdirection.z * 1.5,
                2.0,
                1.0
            );
            canon.setProperty("ao:skin_id", 0);
            world.playSound("canon", canon.location)
            canon.addTag("flyingcanon")
            canon.runCommand("camerashake add @s 0.05 0.35 rotational")
        }
    }
    const flyingcanons = world.getPlayers().filter((e) => e.hasTag("flyingcanon"))
    for (const flyingcanon of flyingcanons) {
        if (flyingcanon.isOnGround) {
            flyingcanon.removeTag("flyingcanon")
        } else {
            flyingcanon.playAnimation("flyingcanon")
        }
    }
}
function GameLoop() {
    loop = system.runInterval(() => {
        if (spawn_timer > 0) {
            spawn_timer--;
        } else {
            spawnRings();
            spawn_timer = 5;
        }
        if (crown_timer > 0) {
            crown_timer--;
        } else {
            crown_timer = 17;
            spawnCrownRing();
            spawnInteractable();
        }
        if (timer > 0) {
            timer--;
        } else {
            const winner = calculateWinner();
            system.clearRun(loop);
            system.clearRun(collision_loop);
            world.afterEvents.entitySpawn.unsubscribe(entity_spawn);
            world.afterEvents.entityHitEntity.unsubscribe(entity_hit_entity);
            let rings = world
                .getDimension("overworld")
                .getEntities()
                .filter((e) => e.typeId === "ao:ring");
            rings.forEach((ring) => {
                ring.triggerEvent("despawn");
            });
            world.getDimension("overworld").runCommand("/execute positioned 82 -48 119 run structure load mystructure:sand ~ ~ ~")
            world.getDimension("overworld").runCommand("/execute positioned 69 -49 120 run structure load mystructure:sand ~ ~ ~")
            world.getDimension("overworld").runCommand("/execute positioned 72 -49 108 run structure load mystructure:sand ~ ~ ~")
            world.getDimension("overworld").runCommand("/execute positioned 83 -49 106 run structure load mystructure:sand ~ ~ ~")

            world.getDimension("overworld").runCommand("/execute positioned 94 -49 109 run structure load mystructure:sand ~ ~ ~")

            world.getDimension("overworld").runCommand("/execute positioned 97 -49 120 run structure load mystructure:sand ~ ~ ~")
            world.getDimension("overworld").runCommand("/execute positioned 94 -49 131 run structure load mystructure:sand ~ ~ ~")
            world.getDimension("overworld").runCommand("/execute positioned 72 -49 131 run structure load mystructure:sand ~ ~ ~")
            world.getDimension("overworld").runCommand("/execute positioned 83 -49 134 run structure load mystructure:ring_point ~ ~ ~")
            let interactables = world.getDimension("overworld").getEntities().filter((e) => e.typeId === "ao:interactable");
            interactables.forEach((interactable) => {
                interactable.remove();
            })
            world.getDimension("overworld").runCommand("/function resetmap")
            resetSkin();
            getAllPlayers().forEach((player) => {
                gameEvents.triggerEvent("Exp.Coins", { amount: 30, player: player }) //! Trigger Event
            })
            gameEvents.triggerEvent("NextRound", { player: getOwner()[0] })
            gameEvents.triggerEvent("Looby")
        }
        showTimer(timer);
        timerInteractable();
    }, 20);

    let collision_loop = system.runInterval(() => {
        world.getDimension("overworld").runCommandAsync("execute as @a run execute at @s if block ~ ~-1 ~ barrier run effect @s levitation 1 7 true")
        world.getDimension("overworld").runCommandAsync("execute as @a run execute at @s if block ~ ~-1 ~ barrier run playsound ventilator @s ~ ~ ~")
        world.getDimension("overworld").runCommandAsync("execute as @a run execute at @s if block ~ ~-1 ~ barrier run particle minecraft:cauldron_explosion_emitter ~ ~-1 ~")
        const overworld = world.getDimension("overworld");
        const ring = overworld.getEntities().filter((e) => e.typeId === "ao:ring");
        const players = overworld.getPlayers();
        for (const player of players) {
            let pl = player.location;
            let available_rings = ring.filter((e) => {
                let r = e.location;
                let distance = Math.sqrt(
                    (pl.x - r.x) ** 2 + (pl.y - r.y) ** 2 + (pl.z - r.z) ** 2
                );
                return distance < ds;
            });
            if (available_rings.length > 0) {
                let ring_type = available_rings[0].getProperty("ao:type");
                let points = 0;
                switch (ring_type) {
                    case 0:
                        points = 1;
                        break;
                    case 1:
                        points = 2;
                        break;
                    case 2:
                        points = 3;
                        break;
                    case 3:
                        points = 7;
                        break;
                }
                player.runCommandAsync(
                    "scoreboard players add @s ring " + points.toString()
                );
                player.playSound("note.pling", { location: pl });
                available_rings[0].triggerEvent("despawn");
            }
        }
        canonsystem();
        moveRings();
    }, 0);

    let entity_spawn = world.afterEvents.entitySpawn.subscribe((event) => {
        system.runTimeout(() => {
            if (event.entity.typeId === "ao:ring") {
                let random = Math.random() * 100;
                let indexnumber = 0;
                if (random >= 0 && random < 45) {
                    indexnumber = 0;
                } else if (random >= 45 && random < 75) {
                    indexnumber = 1;
                } else if (random >= 75 && random < 100) {
                    indexnumber = 2;
                }
                if (event.entity.getProperty("ao:type") != 3) {
                    event.entity.setProperty("ao:type", indexnumber);
                }
            }
        }, 20)
    });

    let entity_hit_entity = world.afterEvents.entityHitEntity.subscribe((event) => {
        if (event.hitEntity.typeId === "ao:interactable" && event.hitEntity.getProperty("ao:type") === 0) {
            if (event.damagingEntity instanceof Player) {
                event.damagingEntity.setProperty("ao:skin_id", 1)
            }
            event.hitEntity.remove();
        }
    });
}

system.afterEvents.scriptEventReceive.subscribe((event) => {
    if (event.id === "ao:game" && event.message === "ring") {
        timer = 20;
        spawn_timer = 2;
        crown_timer = 17
        setupScoreBoard();
        let rings = world
            .getDimension("overworld")
            .getEntities()
            .filter((e) => e.typeId === "ao:ring");
        rings.forEach((ring) => {
            ring.triggerEvent("despawn");
        });
        let interactables = world.getDimension("overworld").getEntities().filter((e) => e.typeId === "ao:interactable");
        interactables.forEach((interactable) => {
            interactable.remove();
        })
        spawnRings();
        GameLoop();
        world.getDimension("overworld").runCommand("/execute positioned 82 -48 119 run structure load ao:crown ~ ~ ~");
        world.getDimension("overworld").runCommand("/execute positioned 69 -49 120 run structure load mystructure:ring_point ~ ~ ~")
        world.getDimension("overworld").runCommand("/execute positioned 72 -49 108 run structure load mystructure:ring_point ~ ~ ~")
        world.getDimension("overworld").runCommand("/execute positioned 83 -49 106 run structure load mystructure:ring_point ~ ~ ~")

        world.getDimension("overworld").runCommand("/execute positioned 94 -49 109 run structure load mystructure:ring_point ~ ~ ~")

        world.getDimension("overworld").runCommand("/execute positioned 97 -49 120 run structure load mystructure:ring_point ~ ~ ~")
        world.getDimension("overworld").runCommand("/execute positioned 94 -49 131 run structure load mystructure:ring_point ~ ~ ~")
        world.getDimension("overworld").runCommand("/execute positioned 72 -49 131 run structure load mystructure:ring_point ~ ~ ~")

        world.getDimension("overworld").runCommand("/execute positioned 83 -49 134 run structure load mystructure:ring_point ~ ~ ~")
    }
    if (event.id == "ao:skin") {
        event.sourceEntity.setProperty("ao:skin_id", 0);
    }
    if (event.id == "ao:canon") {
        event.sourceEntity.setProperty("ao:skin_id", 1);
    }
});