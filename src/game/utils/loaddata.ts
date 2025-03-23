import { Player, world } from "@minecraft/server";
import { version } from "../../settings/world_data";
import { PlayerData } from "../../types";
import { LoadPoint } from "./LoadPoint";
import { PlayerDatas } from "classes/PlayerData";

export let data: PlayerDatas = new PlayerDatas();

function addPlayer(id: string): void {
  const player = world.getAllPlayers().find((player) => player.id === id);
  if (!player) return;
  const PlayerLoadPoint: LoadPoint = new LoadPoint(player, version);
  const playerData: PlayerData = { id: id, data: PlayerLoadPoint };
  data.loadData()

}

export function getPlayerData(player:Player): PlayerData {
  const isInData = data.cdata.find(item => item.id === player.id);
  if (!isInData) return;
  return isInData;

}

function checkAndAddPlayer(player: Player): void {
  const isInData = data.cdata.find(item => item.id === player.id);
  if (!isInData) return;
  data.loadData(player)
}

// Event handlers
world.afterEvents.worldInitialize.subscribe(() => {
  world.getAllPlayers().forEach(player => data.loadData(player));
});

world.afterEvents.playerJoin.subscribe(() => {
  world.getAllPlayers().forEach(checkAndAddPlayer);
});

// Game action events that need player data verification
const gameEvents = [
  world.afterEvents.itemUse,
  world.afterEvents.entityHitEntity,
  world.afterEvents.entityHitBlock
];

gameEvents.forEach(event => {
  event.subscribe(() => {
    world.getPlayers().forEach(checkAndAddPlayer);
  });
});
