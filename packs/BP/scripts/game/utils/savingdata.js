import { system, world } from "@minecraft/server";
import { SavedDataTypes } from "./enums/custom";
import { getAllPlayers } from "./functions";
import { CoinsSyntax, ExperienceSyntax } from "./syntax/saveddatatypes";
import { data as dt } from "./loaddata";
const data = [
    { id: SavedDataTypes.COINS, default: CoinsSyntax },
    { id: SavedDataTypes.EXP, default: ExperienceSyntax },
]

world.afterEvents.playerJoin.subscribe((event) => {
    const newplayers = async () => {
        await checkPlayerLength()
    }
    returnNewPlayers().forEach(player => {
        data.forEach(data => {
            let savedData
            if (!savedData) {
                savedData = data.default
                player.setDynamicProperty(data.id, JSON.stringify(savedData))
            }
        })
    })

})
function saveData() {
    returnNewPlayers().forEach(player => {
        data.forEach(data => {
            let savedData = dt.find(data => data.id === player.id).data.find(data => data.id === data.id)
            if (!savedData) {
                savedData = data.default
                player.setDynamicProperty(data.id, JSON.stringify(savedData))
            } else {
                savedData = JSON.stringify(savedData.data)
            }
        })
    })
}

export function saveinGameData() {
    getAllPlayers().forEach(player => {
        data.forEach(data => {
            let savedData = dt.find(data => data.id === player.id).data.find(data => data.id === data.id)
            if (!savedData) {
                savedData = data.default
                player.setDynamicProperty(data.id, JSON.stringify(savedData))
            } else {
                savedData = JSON.stringify(savedData.data)
                console.error(savedData)
                player.setDynamicProperty(data.id, savedData)
            }
        })
    })
}

export function replaceData(player, data, id) {
    dt.find(data => data.id === player.id).data.find(data => data.id === id).data = data
}


world.afterEvents.itemUse.subscribe((event) => {
    saveData()
})
world.afterEvents.entityHitEntity.subscribe((event) => {
    saveData()
})
world.afterEvents.entityHitBlock.subscribe((event) => {
    saveData()
})


async function checkPlayerLength() {
    const promise = new Promise((resolve) => {
        system.runInterval(() => {
            if (getAllPlayers().length > 0) {
                resolve()
            }
        }, 5)
    })

}

function returnNewPlayers() {
    let players = getAllPlayers().filter(player => {
        let isNew = false
        data.forEach(data => {
            if (!player.getDynamicProperty(data.id)) {
                isNew = true
            }
        })
        return isNew
    })
    return players
}