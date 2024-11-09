import { world } from "@minecraft/server";
import { SavedDataTypes } from "./enums/custom";
import { BattlePassNewSyntax, CoinsSyntax, ExperienceSyntax, LootSyntax } from "./syntax/saveddatatypes";
import { version } from "../../settings/world_data";

export let data = [];

export let activeData = [
  { name: SavedDataTypes.BattlePass, default: BattlePassNewSyntax, id: 0 },
  { name: SavedDataTypes.COINS, default: CoinsSyntax, id: 1 },
  { name: SavedDataTypes.EXP, default: ExperienceSyntax, id: 2 },
  { name: SavedDataTypes.Lootbox, default: LootSyntax, id: 3 }
];
function addPlayer(id) {
  let playerData = { id: id, data: [] };
  let newdata = [];
  let player = world.getAllPlayers().find((player) => player.id === id);
  let shouldupdate = false
  activeData.forEach((data, index) => {
    if (data.id !== 0) {
      return
    }
    let pushdata = { id: data.id, data: [] }
    let shouldreplace = false;
    if (!player.getDynamicProperty(data.name)) {
      player.setDynamicProperty(data.name, JSON.stringify(data.default));
    }
    let property = player.getDynamicProperty(data.name);
    let parsed = JSON.parse(property);
    if (parsed[0].version == version) {
      pushdata.data = parsed
      newdata.push(pushdata);
    } else {
      shouldreplace = true;
    }
    if (shouldreplace) {
      shouldupdate = true
      player.setDynamicProperty(data.name, JSON.stringify(data.default));
      let property = player.getDynamicProperty(data.name);
      let parsed = JSON.parse(property);
      parsed[0].version = version
      pushdata.data = parsed
      newdata.push(pushdata);
    }
  });
  activeData.forEach((data, index) => {
    if (data.id === 0) {
      return
    }
    let pushdata = { id: data.id, data: [] }
    if (!player.getDynamicProperty(data.name)) {
      player.setDynamicProperty(data.name, JSON.stringify(data.default));
    }
    let property = player.getDynamicProperty(data.name);
    if (!shouldupdate && property) {
      let parsed = JSON.parse(property);
      pushdata.data = parsed
      newdata.push(pushdata);
    } else {
      player.setDynamicProperty(data.name, JSON.stringify(data.default));
      let property = player.getDynamicProperty(data.name);
      let parsed = JSON.parse(property);
      pushdata.data = parsed
      newdata.push(pushdata);
    }
  })
  playerData.data = newdata
  data.push(playerData);
  console.error(JSON.stringify(data));
}
world.afterEvents.worldInitialize.subscribe((event) => {
  world.getAllPlayers().forEach((player) => {
    addPlayer(player.id);
  });
});
world.afterEvents.playerJoin.subscribe((event) => {
  world.getAllPlayers().forEach((player) => {
    let isindata = data.find((data) => data.id === player.id);
    if (!isindata) {
      addPlayer(player.id);
    }
  });
  console.error("Test");
});
world.afterEvents.itemUse.subscribe((event) => {
  world.getPlayers().forEach((player) => {
    let isindata = data.find((data) => data.id === player.id);
    if (!isindata) {
      addPlayer(player.id);
    }
  });
});
world.afterEvents.entityHitEntity.subscribe((event) => {
  world.getPlayers().forEach((player) => {
    let isindata = data.find((data) => data.id === player.id);
    if (!isindata) {
      addPlayer(player.id);
    }
  });
});
world.afterEvents.entityHitBlock.subscribe((event) => {
  world.getPlayers().forEach((player) => {
    let isindata = data.find((data) => data.id === player.id);
    if (!isindata) {
      addPlayer(player.id);
    }
  });
});
