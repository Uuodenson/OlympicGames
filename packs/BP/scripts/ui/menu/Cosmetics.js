import { Player, world } from "@minecraft/server";
import { createActionForm } from "../../game/utils/functions";
import { data } from "../../game/utils/loaddata";
import { BPT, SavedDataTypes } from "../../game/utils/enums/custom";
/**
 *
 * @param {Player} player
 */
function Skins(player) {
  let battlepassdata = data
    .find((data) => data.id === player.id)
  let filteredpass = battlepassdata.data.filter((data) => {
    return data.id === 0;
  });
  let lootpass = battlepassdata.data.filter((data) => {
    return data.id === 3;
  });
  let filtered = filteredpass[0].data.filter((data) => data.type === BPT.SKINS && data.purchased).concat(lootpass[0].data.filter((data) => data.type === BPT.SKINS && data.purchased))
  let skins = filtered
  const action = createActionForm("Skins");
  action.body("Hello " + player.name + "! Select your skins under here");
  skins.forEach((skin, index) => {
    skin.index = index;
    action.button(skin.title);
  });
  action.button("§cDefault");
  action.show(player).then((result) => {
    if (result.canceled) return;
    if (result.selection === skins.length) {
      player.setProperty("ao:skin_id", 0);
      return;
    }
    player.setProperty("ao:skin_id", skins[result.selection].skin);
  });
}
/**
 *
 * @param {Player} player
 */
function NameTags(player) {
  let battlepassdata = data
    .find((data) => data.id === player.id)
  let filteredpass = battlepassdata.data.filter((data) => {
    return data.id === 0;
  })
  let lootpass = battlepassdata.data.filter((data) => {
    return data.id === 3;
  });
  let filtered = filteredpass[0].data.concat(lootpass[0].data)
  let nametags = filtered.filter((data) => data.type === BPT.NAMETAGS && data.purchased)
  world.sendMessage(JSON.stringify(nametags));
  const action = createActionForm("NameTags");
  nametags.forEach((nametag, index) => {
    nametag.index = index;
    action.button(nametag.title);
  });
  action.button("§cDefault");
  action.show(player).then((result) => {
    if (result.canceled) return;
    if (result.selection === nametags.length) {
      player.nameTag = player.name
      return
    }
    let title = nametags[result.selection].title
    player.nameTag = player.name + "\n" + title
    world.sendMessage(player.nameTag)
  });
}
const forms = [
  { name: "Skins", callback: Skins },
  { name: "NameTags", callback: NameTags },
];
/**
 *
 * @param {Player} player
 */
export function Cosmetics(player) {
  const action = createActionForm("Cosmetics");
  action.body("Hello " + player.name + "! Select your cosmetics under here");
  forms.forEach((form, index) => {
    action.button(form.name);
    forms[index].id = index;
  });
  action.show(player).then((result) => {
    if (result.canceled) return;
    forms[result.selection].callback(player);
  });
}
