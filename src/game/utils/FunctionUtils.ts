import { world, Entity, Player } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { CommandSceneSyntax, Vector3 } from "../../types";

export function calcDistance(a: Vector3, b: Vector3): number {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2)
}

/**
 * 
 * @param {String} title
 * @returns 
 */

export function createActionForm(title: string): ActionFormData {
    const actionform = new ActionFormData()
        .title(title)
    return actionform
}
/**
 * 
 * @param {String} title 
 * @returns 
 */

export function createModalForm(title: string) {
    const modalform = new ModalFormData()
        .title(title)
    return modalform
}

/**
 * 
 * @param {number} time 
 * @returns 
 */
export function calcTimetoTicks(time: number) {
    return time * 20
}

export function getAllPlayers() {
    return world.getPlayers()
}
export function command(string: string, tick: number, looptimer: boolean = false): CommandSceneSyntax {
    return { command: string, time: tick, looptimer: looptimer }
}

export function getOwner(): Player[] {
    return world.getPlayers().filter((p) => {
        // if (p.name == "S7riel") return true
        if (p.hasTag("owner")) return true
        return false
    })
}

export function spawnEntity(typeId: string, location: Vector3, dimension: string = "overworld"): Entity {
    return world.getDimension(dimension).spawnEntity(typeId, location)
}

export function getRandomPlayer(): Player {
    return getAllPlayers()[Math.floor(Math.random() * getAllPlayers().length)]
}

export default function resetSkin(): void {
    world.getPlayers().forEach(player => player.setProperty("ao:skin_id", 0));
}

export function runCommand(command: string, dimension: string = "overworld"): void {
    world.getDimension(dimension).runCommand(command)
}

export function playSound(sound: string, location: Vector3): void {
    world.getDimension("overworld").playSound(sound, location)
}