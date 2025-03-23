import { Player } from "@minecraft/server";
import { createActionForm } from "../../game/utils/functions";
import { data } from "../../game/utils/loaddata";
import { BPT } from "../../game/utils/enums/custom";

function Skins(player: Player) {
  let playerData = data.cdata.find((data) => data.id === player.id);
  let filteredpass = playerData.data.Shop.content;
  let skins = filteredpass.filter((data) => data.type === BPT.SKINS && data.purchased);
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

function NameTags(player: Player) {
  let playerData = data.cdata.find((data) => data.id === player.id);
  let lootpass = playerData.data.Lootbox.content;
  let nametags = lootpass.filter((data) => data.type === BPT.NAMETAGS && data.purchased);
  const action = createActionForm("NameTags");
  action.body("Hello " + player.name + "! Select your nametag below");

  nametags.forEach((nametag, index) => {
    nametag.index = index;
    action.button(nametag.title);
  });
  action.button("§cDefault");

  action.show(player).then((result) => {
    if (result.canceled) return;
    if (result.selection === nametags.length) {
      player.nameTag = player.name;
      return;
    }
    let title = nametags[result.selection].title;
    player.nameTag = `${player.name}\n${title}`;
  });
}

function Capes(player: Player) {
  let id = player.getProperty("ao:cape_id");
  const newId = id === 0 ? 1 : 0;
  player.setProperty("ao:cape_id", newId);
}

interface Form {
  name: string;
  callback: Function;
  id?: number;
}

const forms: Form[] = [
  { name: "Skins", callback: Skins },
  { name: "NameTags", callback: NameTags },
  { name: "Capes", callback: Capes }
];

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
