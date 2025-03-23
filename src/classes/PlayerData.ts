import { Player, system, world } from "@minecraft/server";
import { getAllPlayers } from "game/utils/FunctionUtils";
import { LoadPoint } from "game/utils/LoadPoint";
import { version } from "settings/world_data";
import { PlayerData } from "types";

class PlayerDatas {
    public cdata: PlayerData[];
    private names : string[]
    private tick: number = 0;
    constructor(){
        this.cdata = [];
        this.names = [];
        this.tick
        world.beforeEvents.playerLeave.subscribe((data)=>{
            this.saveData()
            this.cdata = this.cdata.filter(item => item.id !== data.player.id)
        })
        world.afterEvents.playerJoin.subscribe((data)=>{
            this.names.push(data.playerId)
            this.tick = system.runInterval(()=>{
                if(this.names.length === 0) return system.clearRun(this.tick);
                this.names.forEach((name)=>{
                    const player = getAllPlayers().find(item => item.id === name)
                    if(player !== undefined) {this.loadData(player); this.names = this.names.filter(item => item !== name)};
                })
            }, 5)
        })
    }
    clearData(){
        this.cdata = [];
    }
    loadData(player?:Player){
        if(!this.cdata.find(item => item.id === player.id)){
            const PlayerLoadPoint: LoadPoint = new LoadPoint(player, version);
            const playerData: PlayerData = { id: player.id, data: PlayerLoadPoint };
            this.cdata.push(playerData);
        }else{
            this.cdata.forEach(item => {
                if(item.id === player.id){
                    item.data = new LoadPoint(player, version);
                }
            })
        }
    }
    saveData(){
        this.cdata.forEach(item => {
            item.data.saveData()
        })
    }
    findPlayer(player:Player){
        return
    }
}
export {PlayerDatas}