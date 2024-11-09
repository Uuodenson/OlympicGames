import { Player, world } from "@minecraft/server";
import { createModalForm } from "./functions";
import { BattlePassNewSyntax as normal } from "./syntax/saveddatatypes";
import { activeData, data } from "./loaddata";
/**
 * 
 * @param {Player} player 
 */
export function SaveGameData(player) {
  let playerdata = data.find((data) => data.id === player.id).data
  playerdata.forEach((data, index) => {
    let name = activeData[index].name
    player.setDynamicProperty(name, JSON.stringify(data.data))
  })
}
world.afterEvents.itemUse.subscribe((event) => {
  if (event.itemStack.typeId === "minecraft:book") {
    let battlepassdata = data.find((data) => data.id === event.source.id);
    let filteredpass = battlepassdata.data.filter((data) => {
      return data.id === 0;
    });
    let lootboxpass = battlepassdata.data.find((data) => data.id === 3)

    if (battlepassdata) {
      let modal = createModalForm("Battle Pass Cheat Code");
      filteredpass[0].data.forEach((element, index) => {
        let purchased = element.purchased;
        modal.toggle(element.title, purchased);
      });
      lootboxpass.data.forEach((element, index) => {
        let purchased = element.purchased;
        modal.toggle(element.title, purchased);
      });
      let lengths = [filteredpass[0].data.length, lootboxpass.data.length]
      modal.show(event.source).then((rs) => {
        if (rs.canceled) return;
        rs.formValues.forEach((element, index) => {
          if (index <= lengths[0] - 1) {
            filteredpass[0].data[index].purchased = element
          }
          else {
            lootboxpass.data[Math.abs(index - lengths[0])].purchased = element
          }
        })
        SaveGameData(event.source)
      });
    }
  }
})

