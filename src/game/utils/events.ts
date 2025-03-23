import { system, world } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";

export class GameEvents {
    private readonly gameEvents: Map<string, Function>;
    private readonly remoteEvents: Map<string, Function>;
    private readonly eventId: string;

    constructor(eventId: string, itemname?: string) {
        this.gameEvents = new Map();
        this.remoteEvents = new Map();
        this.eventId = eventId;

        system.afterEvents.scriptEventReceive.subscribe((systemEvent) => {
            if (systemEvent.id === this.eventId && this.gameEvents.has(systemEvent.message)) {
                const callback = this.gameEvents.get(systemEvent.message);
                callback?.();
            }
        });
        world.afterEvents.itemUse.subscribe((p)=>{
            if(p.itemStack.typeId == itemname){
                const action = new ActionFormData()
                .title("eventId")
                .body("eventId")
               this.gameEvents.forEach((callback, key)=>{
                action.button(key)
               })
               action.show(p.source).then((res)=>{
                if (res.canceled) return
                const callback = [...this.gameEvents]
                const cl = callback[res.selection]?.[1]
                cl?.()
               })
            }
        })
    }

    addEvent(id: string, callback: Function) {
        this.gameEvents.set(id, callback);
    }

    clearEvents(): void {
        this.gameEvents.clear();
    }

    removeEvent(id: string) {
        this.gameEvents.delete(id);
    }

    triggerEvent(id: string, props?: any): void {
        const callback = this.remoteEvents.get(id);
        if (!callback) {
            return;
        }

        if (props) {
            callback(props);
        } else {
            world.sendMessage(`Triggered ${id}`);
            callback();
        }
    }

    addRemoteEvent(id: string, callback: Function): void {
        this.remoteEvents.set(id, callback);
    }

    hasEvent(id: string): boolean {
        return this.gameEvents.has(id);
    }

    hasRemoteEvent(id: string): boolean {
        return this.remoteEvents.has(id);
    }
}