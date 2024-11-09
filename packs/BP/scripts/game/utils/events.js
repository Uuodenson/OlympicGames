import { system, world } from "@minecraft/server";


export class GameEvents {
    constructor(eventId) {
        this.gameEvent = [{}]
        this.RemoteEvents = {}
        this.callBackIds = []
        this.eventId = eventId
        system.afterEvents.scriptEventReceive.subscribe((systemevent) => {
            if (systemevent.id == this.eventId) {
                this.callBackIds.forEach((id) => {
                    if (systemevent.message == id)
                        this.gameEvent[0][id]()
                })
            }
        })
    }

    addEvent(id, callback) {
        this.gameEvent[0][id] = callback
        this.callBackIds.push(id)
        return this.gameEvent[0]
    }

    clearEvents() {
        this.gameEvent[0] = {}
        this.callBackIds = []
    }

    removeEvents(id) {
        this.gameEvent[0][id] = {}
        this.callBackIds.pop(id)
    }

    triggerEvent(id, props) {
        if (props) {
            this.RemoteEvents[id](props)
        }
        else {
            world.sendMessage("Triggered " + id)
            this.RemoteEvents[id]()
        }
    }

    addRemoteEvent(id, callback) {
        this.RemoteEvents[id] = callback
    }
}