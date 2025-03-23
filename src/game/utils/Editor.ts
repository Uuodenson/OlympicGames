import { world } from "@minecraft/server";
import { createModalForm } from "./functions";
import { ActiveData, ShopSyntax,  } from "../../types";
import { data } from "./loaddata";
world.afterEvents.itemUse.subscribe((event) => {
  if (event.itemStack.typeId === "minecraft:book") {
    let battlepassdata = data.cdata.find((data) => data.id === event.source.id);
    if (!battlepassdata) return;
    let filteredpass = data.cdata.find((data) => data.id === event.source.id).data;
    let lootboxpass = data.cdata.find((data) => data.id === event.source.id).data.Lootbox.content
    if (!lootboxpass) return;

    let modal = createModalForm("Battle Pass Cheat Code");
    let filteredpassData = filteredpass.Shop.content;
    filteredpassData.forEach((element) => {
      let purchased = element.purchased;
      modal.toggle(element.title, purchased);
    });
    lootboxpass.forEach((element) => {
      let purchased = element.purchased;
      modal.toggle(element.title, purchased);
    });
    let lengths = [filteredpassData.length, lootboxpass.length]
    modal.show(event.source).then((rs) => {
      if (rs.canceled) return;
      rs.formValues.forEach((element:boolean, index:number) => {
        if (index <= lengths[0] - 1) {
          filteredpassData[index].purchased = element
        }
        else {
          lootboxpass[Math.abs(index - lengths[0])].purchased = element
        }
      })
      data.cdata.find((data) => data.id === event.source.id).data.saveData();
    });

  }
})

