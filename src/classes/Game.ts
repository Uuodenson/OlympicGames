import { world, Vector3, Entity, system, EntityHitEntityAfterEvent } from "@minecraft/server"
export enum EventType {
    ItemUse,
    ItemUseOn,
    ProjectileEntity,
    ProjectileBlock,
    EntityDamageEntity,
    EntityHitEntity,
    EntityDeath,
    EntitySpawn,
    EntityHitBlock,
    runInterval,
    ItemReleaseUse
}
export interface Event {
    id: EventType;
    data: Function;
}
interface SusbcribeElement {
    id: EventType
    func: Function
}
export class CustomEntity {
    readonly typeId: string;
    maxHealth: number;
    skinId: number;
    resistance: number;
    entity: Entity | null;

    constructor(typeId: string, maxHealth: number, resistance: number, skinId: number = 0) {
        this.typeId = typeId;
        this.maxHealth = maxHealth;
        this.resistance = resistance;
        this.skinId = skinId;
        this.entity = null;
    }

    spawnEntity(location: Vector3) {
        world.getDimension("minecraft:overworld").spawnEntity(this.typeId, location);

    }
};

class Game {
    id: number
    active: boolean
    timer: number
    Events: Event[]
    Entitys: CustomEntity[]
    SubsrcibeValues: SusbcribeElement[]
    constructor(id: number, timer: number) {
        this.id = id;
        this.active = false
        this.timer = timer
        this.Events = []
        this.Entitys = []
        this.SubsrcibeValues = []
        system.afterEvents.scriptEventReceive.subscribe((callback) => {
            if (callback.id == "ao:game" && callback.message == this.id.toString()) {
                this.active = true
            }
        })
    }
    init(): void {
        let parent = this
        parent.SubsrcibeValues = []
        parent.Events.push({
            id: EventType.EntityHitEntity, data: ((data: EntityHitEntityAfterEvent) => {
                if (AllowedEntities.includes(data.hitEntity.typeId) && !this.Entitys.find(entity => entity.entity === data.hitEntity)) {
                    if (data.hitEntity.typeId != "minecraft:player") {
                        let entity = new CustomEntity(data.hitEntity.typeId, 20, 2, 0)
                        entity.entity = data.hitEntity
                        this.Entitys.push(entity)
                    }
                }
                if (data.hitEntity.typeId != "minecraft:player") {
                    let hE: CustomEntity | undefined = this.Entitys.find((dt) => dt.entity = data.hitEntity)
                    if (hE === undefined) return;
                    hE.maxHealth -= 1 / hE.resistance;
                    if (hE.maxHealth <= 0) {
                        this.Entitys.splice(this.Entitys.indexOf(hE), 1)
                        if (!hE.entity) return;
                        hE.entity.remove()
                    }
                }
            })
        })

        function subscribe(etype: EventType): Event[] {
            return parent.Events.filter((event) => event.id === etype)
        }
        function savecallbacks(id: EventType, func: Function) {
            let obj = { id: id, func: func }
            parent.SubsrcibeValues.push(obj)
        }
        let itemUse = world.afterEvents.itemUse.subscribe(({ source, itemStack }) => {
            subscribe(EventType.ItemUse).forEach((event) => event.data({ source, itemStack }))
        })
        savecallbacks(EventType.ItemUse, itemUse)
        let itemUseOn = world.afterEvents.itemUseOn.subscribe(({ source, itemStack, block, faceLocation, isFirstEvent }) => {
            subscribe(EventType.ItemUseOn).forEach((event) => event.data({ source, itemStack, block, faceLocation, isFirstEvent }))
        })
        savecallbacks(EventType.ItemUseOn, itemUseOn)
        let projectileHitEntity = world.afterEvents.projectileHitEntity.subscribe(({ source, dimension, getEntityHit, hitVector, location, projectile }) => {
            subscribe(EventType.ProjectileEntity).forEach((event) => event.data({ source, dimension, getEntityHit, hitVector, location, projectile }))
        })
        savecallbacks(EventType.ProjectileEntity, projectileHitEntity)
        let projectileHitBlock = world.afterEvents.projectileHitBlock.subscribe(({ source, dimension, getBlockHit, hitVector, location, projectile }) => {
            subscribe(EventType.ProjectileBlock).forEach((event) => event.data({ source, dimension, getBlockHit, hitVector, location, projectile }))
        })
        savecallbacks(EventType.ProjectileBlock, projectileHitBlock)
        let itemRealeaseUse = world.afterEvents.itemReleaseUse.subscribe(({ source, useDuration, itemStack }) => {
            subscribe(EventType.ItemReleaseUse).forEach((event) => event.data({ source, useDuration, itemStack }))
        })
        savecallbacks(EventType.ItemReleaseUse, itemRealeaseUse)
        let entityHitEntity = world.afterEvents.entityHitEntity.subscribe(({ damagingEntity, hitEntity }) => {
            subscribe(EventType.EntityHitEntity).forEach((event) => event.data({ damagingEntity, hitEntity }))
        })
        savecallbacks(EventType.EntityHitEntity, entityHitEntity)
        const AllowedEntities: Array<string> = ['minecraft:pig']
        const EntityList: Array<CustomEntity> = parent.Entitys
        system.runInterval(() => {
            EntityList.forEach((entity) => {
                if (!entity.entity) return;
                if (!world.getDimension('minecraft:overworld').getEntities().includes(entity.entity)) {
                    EntityList.splice(EntityList.indexOf(entity), 1)
                }
            })
        }, 20)
    }
    stop() {
        let parent = this
        function unsubscribe(etype: EventType): Event[] {
            return parent.Events.filter((event) => event.id === etype)
        }
        function filterArrays(id: EventType): Array<SusbcribeElement> {
            return parent.SubsrcibeValues.filter((element) => {
                if (element.id === id) {
                    return true
                }
                return false

            })
        }
        filterArrays(EventType.ItemUse).forEach((el) => {
            world.afterEvents.itemUse.unsubscribe(({ source, itemStack }) => { })
        })
        world.afterEvents.itemUseOn.unsubscribe(({ source, itemStack, block, faceLocation }) => {
            unsubscribe(EventType.ItemUseOn).forEach((event) => event.data({ source, itemStack, block, faceLocation }))
        })
        world.afterEvents.projectileHitEntity.unsubscribe(({ source, dimension, getEntityHit, hitVector, location, projectile }) => {
            unsubscribe(EventType.ProjectileEntity).forEach((event) => event.data({ source, dimension, getEntityHit, hitVector, location, projectile }))
        })
        world.afterEvents.projectileHitBlock.unsubscribe(({ source, dimension, getBlockHit, hitVector, location, projectile }) => {
            unsubscribe(EventType.ProjectileBlock).forEach((event) => event.data({ source, dimension, getBlockHit, hitVector, location, projectile }))
        })
        world.afterEvents.itemReleaseUse.unsubscribe(({ source, useDuration, itemStack }) => {
            unsubscribe(EventType.ItemReleaseUse).forEach((event) => event.data({ source, useDuration, itemStack }))
        })
        world.afterEvents.entityHitEntity.unsubscribe(({ damagingEntity, hitEntity }) => {
            unsubscribe(EventType.EntityHitEntity).forEach((event) => event.data({ damagingEntity, hitEntity }))
        })
        const AllowedEntities: Array<string> = ['minecraft:pig']
        const EntityList: Array<CustomEntity> = parent.Entitys

        system.runInterval(() => {
            EntityList.forEach((entity) => {
                if (!entity.entity) return;
                if (!world.getDimension('minecraft:overworld').getEntities().includes(entity.entity)) {
                    EntityList.splice(EntityList.indexOf(entity), 1)
                }
            })
        }, 20)
    }
    addContent(id: EventType, func: Function) {
        this.Events.push({ id: id, data: func })
    }
}