import { world, system, Player, ItemStack, ItemLockMode } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import resetSkin, { getAllPlayers, getOwner } from "./utils/functions";
import { gameEvents } from "./Events";
let winPoints = 5;
let scoreboardidentity = "thundergame";
let loop;
let hit_points = "ao:thunder_hit_points";
let trident_tag = "trident:true";
let locations = ["80 -48 108", "89 -48 115", "96 -48 120", "96 -48 133", "89 -45 129", "73 -48 132"]
function GameLoop() {
  loop = system.runInterval(() => {
    if (getWinner()) {
      // calculateWinner()
      getAllPlayers().forEach((player) => {
        gameEvents.triggerEvent("Exp.Coins", { amount: 30, player: player }) //! Trigger Event
      })
      gameEvents.triggerEvent("NextRound", { player: getOwner()[0] })
      system.clearRun(loop)
      world.afterEvents.projectileHitEntity.unsubscribe(hitEvent)
      world.afterEvents.entityHitEntity.unsubscribe(hitEntityEvent)
      world.afterEvents.projectileHitBlock.unsubscribe(hitEventBlock)
      world.afterEvents.itemUse.unsubscribe(itemUseEvent)
      world.afterEvents.itemStopUse.unsubscribe(itemStopUse)
      world.getDimension("overworld").runCommand("/function resetmap")
      resetSkin()
    }
  }, 0);
  let hitEvent = world.afterEvents.projectileHitEntity.subscribe((event) => {
    let player = event.source
    let enemy = event.getEntityHit().entity
    world.playSound("minecraft:entity.enderman.teleport", player.location)
    if (enemy instanceof Player) {
      player.runCommandAsync(`scoreboard players add @s ${scoreboardidentity} 1`)
      enemy.runCommandAsync(`clear @s minecraft:trident`)
      enemy.runCommandAsync(`execute unless entity @s[hasitem=[{item=minecraft:trident}]] run give @s minecraft:trident`)
    }
    playerTp(enemy)
  });
  let hitEntityEvent = world.afterEvents.entityHitEntity.subscribe((event) => {
    let player = event.damagingEntity
    let enemy = event.hitEntity
    if (player instanceof Player) {
      let sword = player.getComponent("inventory").container.getItem(player.selectedSlotIndex)
      if (sword) {
        let enemy_hit_points = enemy.getDynamicProperty(hit_points)
        if (enemy_hit_points > 0) {
          enemy.setDynamicProperty(hit_points, enemy_hit_points - 1)
          let point = "§a"
          switch (enemy_hit_points) {
            case 2:
              point = "§b"
              break
            case 3:
              point = "§c"
              break
          }
          player.onScreenDisplay.setActionBar(point + enemy_hit_points + " " + enemy.nameTag)
        } else {
          enemy.setDynamicProperty(hit_points, 3)
          player.runCommandAsync(`execute unless entity @s[hasitem=[{item=minecraft:trident}]] run give @s minecraft:trident`)
          enemy.runCommandAsync("clear @s minecraft:trident")
          enemy.runCommandAsync(`give @s minecraft:trident`)
          player.runCommandAsync(`title @s actionbar ${enemy_hit_points} has been defeated!`)
          let scoreboard = world.scoreboard.getObjective(scoreboardidentity);
          scoreboard.addScore(player, 1);
          world.playSound("thunder_kill", player.location)
          playerTp(enemy)
        }
      }
    }
  });
  let hitEventBlock = world.afterEvents.projectileHitBlock.subscribe((event) => {
    let projectile = event.projectile
    projectile.kill()
  })
  let itemUseEvent = world.afterEvents.itemUse.subscribe((event) => {
    if (event.itemStack?.typeId == "ao:thunder") {
      return
    }
  })
  let itemStopUse = world.afterEvents.itemStopUse.subscribe((event) => {
    if (event.source.hasTag(trident_tag)) {
      const newlocation = event.source.location
      newlocation.y += 1
      world.getDimension("overworld").spawnParticle(minecraftParticles.lava_particle, newlocation)
      world.playSound(sounds.note_flute, newlocation)
    }
  });
}
function getWinner() {
  for (const player of world.getPlayers()) {
    if (world.scoreboard.getObjective(scoreboardidentity).getScore(player) >= winPoints) {
      return true
    }
  }
  return false
}
function calculateWinner() {
  const objective = world.scoreboard.getObjective(scoreboardidentity);
  const players = world.getPlayers();
  let scorearray = [];
  let participant = objective?.getParticipants();
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
}
function playerTp(player) {
  let random = Math.floor(Math.random() * locations.length);
  let location = locations[random]
  if (player instanceof Player) {
    player.runCommandAsync(`tp @s ${location}`)
  }
}

function giveSlowness() {
  for (const player of world.getPlayers()) {
    let container = player.getComponent("inventory").container;
    let thunder = "ao:thunder"
    if (container.getItem(player.selectedSlotIndex).typeId == thunder) {
      player.addEffect("slowness", 1, { showParticles: true, amplifier: 25 });
    }
  }
}

system.afterEvents.scriptEventReceive.subscribe((event) => {
  if (event.id == "ao:game" && event.message == "thunder") {
    loop = 0;

    let scoreboard = world.scoreboard.getObjective(scoreboardidentity);
    if (scoreboard) {
      world.scoreboard.removeObjective(scoreboardidentity);
    }
    world.scoreboard.addObjective(
      scoreboardidentity,
      "Thunder Hammer\nMinigame"
    );


    for (const player of world.getPlayers()) {
      let container = player.getComponent("inventory").container;
      let hammer = new ItemStack("minecraft:wooden_sword", 1);
      hammer.nameTag = "Thunder Hammer";
      hammer.lockMode = ItemLockMode.inventory;
      let thunder = new ItemStack("minecraft:trident", 1);
      thunder.nameTag = "Thunder Bow";
      thunder.lockMode = ItemLockMode.inventory;
      player.runCommandAsync(
        `scoreboard players set @s ${scoreboardidentity} 0`
      );
      player.setDynamicProperty(hit_points, 3);
      player.runCommandAsync("scoreboard objectives setdisplay sidebar " + scoreboardidentity);
      player.runCommandAsync("effect @s resistance 10000 225 true");
      container.setItem(3, hammer);
      container.setItem(4, thunder);
    }
    GameLoop();
    world.getDimension("overworld").runCommandAsync("structure load mystructure:thunder 67 -48 106");
  }
});
