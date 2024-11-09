import { createActionForm } from "../../game/utils/functions";


const Shop = (player) => {
    console.error("Shop")
}

const Coins = (player) => {
    console.error("Coins")
}

const Skins = (player) => {
    console.error("Skins")
}

const HubTitle = (player) => {
    console.error("HubTitle")
}

const Animations = (player) => {
    console.error("Animations")
}

const Sites = [
    [
        { name: "Skin1", function: Skins, id: 0 }, { name: "300 Coins", function: Coins, id: 0 }, { name: "Start of the Games", function: HubTitle, id: 0 },
        { name: "Back", function: Shop, id: 1 }, { name: "Shop", function: Shop, id: 2 }, { name: "Next", function: Shop, id: 3 }
    ],
    [
        { name: "?", function: Skins, id: 0 }, { name: "?", function: Coins, id: 0 }, { name: "Start of the Games", function: Coins, id: 0 },
        { name: "Back", function: Shop, id: 1 }, { name: "Shop", function: Shop, id: 2 }, { name: "Next", function: Shop, id: 3 }
    ],
    [
        { name: "?", function: Skins, id: 0 }, { name: "300 Coins", function: Coins, id: 0 }, { name: "Onin Skin", function: Skins, id: 0 },
        { name: "Back", function: Shop, id: 1 }, { name: "Shop", function: Shop, id: 2 }, { name: "Next", function: Shop, id: 3 }
    ],
]


let site = 0
export function BattlePass(player) {
    const battlepassForm = createActionForm("BattlePass")
    battlepassForm.title("BattlePass")
        .body("You can use this to buy a BattlePass")
    Sites[site].forEach((button, index) => {
        battlepassForm.button(button.name, "textures/ui/menu/yellow_stripe")
    })
    battlepassForm.show(player).then(result => {
        if (result.canceled) return
        const button = Sites[site][result.selection]
        if (button.id == 0 || button.id == 2) {
            button.function(player)
        }
        if (button.id == 3 && site < 2) {
            site++
            BattlePass(player)
        }
        if (button.id == 1 && site > 0) {
            site--
            BattlePass(player)
        }
    })
}