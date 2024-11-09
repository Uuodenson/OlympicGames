
import { SceneTypes } from "../game/utils/enums/custom"
import { command } from "../game/utils/functions"
import { Cutscene } from "./class"
function returnSeconds(tick) {
    if (tick == 0) return 0
    return tick / 20
}
const scene = [
    command("effect @a invisibility 100 1 true", 0),
    command("camera @a fade time 0.5 1.2 0.8", 0),
    command("tp @a 91.63 -54.94 152.55 facing 86.98 -53.81 152.46", 1),
    command("summon ao:olympian 88.43 -55.00 155.54 facing 85.00 -55.00 155.51", returnSeconds(1)),
    command("playsound start_sound @a", returnSeconds(5)),
    command("camera @a set minecraft:free ease 0.1 in_bounce pos 84.58 -47.76 142.13 facing 84.5 -50.80 146.20", 0),
    command("camera @a set minecraft:free ease 9 in_out_quad pos 84.52 -52.26 147.16 facing 84.50 -52.30 148.20", returnSeconds(5)),
    command("playanimation @e[type=ao:olympian] animation.cutscene.opening.one", returnSeconds(4)),
    command("camera @a set minecraft:free ease 3 in_out_quad pos 85.73 -53.27 150.62 facing 87.86 -53.66 155.45", returnSeconds(110)),
    command("camera @a fade time 0.5 0.5 0.2", returnSeconds(90)),
    command("camera @a set minecraft:free ease 0.1 in_out_quad rot 84.53 -46.31", 0),
    command("camera @a fade time 0.5 1 0.5", 0),
    command("camera @a set minecraft:free ease 0.1 in_out_quad pos 84 -46.88 138 facing 84.54 -46.50 126.56", returnSeconds(10)),
    command("structure load olympischesfeuer 78 -48.00 118.23", returnSeconds(2)),
    command("camera @a set minecraft:free ease 9 in_out_quad pos 84.5 -44.84 129.5 facing 84 -45.36 124.5", 0),
    command("playanimation @e[type=ao:shroomy] animation.stehen.three", SceneTypes.INSTANT, 3),
    command("playanimation @e[type=ao:alien] animation.stehen.two", SceneTypes.INSTANT, 3),
    command("playanimation @e[type=ao:dragon] animation.stehen.three", SceneTypes.INSTANT, 3),
    command("playanimation @e[type=ao:olympian] animation.stehen.one", SceneTypes.INSTANT, 3),
    command("playanimation @e[type=ao:goat] animation.stehen.one", SceneTypes.INSTANT, 3),
    command("playanimation @e[type=ao:raven] animation.stehen.two", SceneTypes.INSTANT, 3),
    command("camera @a fade time 0.3 0.2 0.3", returnSeconds(110)),
    command("camera @a set example:example_free ease 0.01 in_out_quad pos 88.82 -41.65 137.94 facing 90.46 -40.48 118.44", returnSeconds(5)),
    command("camera @a set example:example_free ease 11 in_out_quad pos 93.28 -42.46 112.95 facing 87.59 -45.53 121.59", returnSeconds(12)),
    command("camera @a set example:example_free ease 6 in_out_quad pos 73.92 -42.38 110.64 facing 84.72 -44.86 122.51", returnSeconds(180)),
    command("camera @a set example:example_free ease 5 in_out_quad pos 73.71 -44.04 133.28 facing 85.55 -45.10 122.92", returnSeconds(90)),
    command("camera @a fade time 0.3 0.3 0.3", returnSeconds(80)),
    command("camera @a set example:example_free ease 0.2 in_out_quad pos 84 -46.39 138 facing 84.40 -44.85 126.65", returnSeconds(10)),
    command("summon ao:olympicgames 84.47 -46.00 124.45", 0),
    command("setblock 95.72 -48.00 117.70 redstone_block", returnSeconds(2)),
    command("playanimation @e[type=ao:olympicgames] animation.olympicgames", returnSeconds(1)),
    command("camera @a set example:example_free ease 8 in_out_quad pos 84 -43.16 128 facing 84 -42.49 124", returnSeconds(10)),
    command("camera @a fade time 1 1 1", returnSeconds(150)),
    command("camera @a clear", returnSeconds(22)),
    command("effect @a clear", 0),
    command("kill @e[type=ao:olympicgames]", 0),
    command("kill @e[type=ao:olympian]", 0),
    command("kill @e[type=ao:goat]", 0),
    command("kill @e[type=ao:villagerking]", 0),
    command("kill @e[type=ao:dragon]", 0),
    command("kill @e[type=ao:alien]", 0),
    command("kill @e[type=ao:raven]", 0),
    command("kill @e[type=ao:shroomy]", 0),
    command("function resetmap", 0)

]
const endScene = [
    command("tp @a 84.55 -47.00 127.47 facing 84.43 -46.18 123.97", 0),
    command("structure load mystructure:podest_twostructure load mystructure:podest 80 -48 120 80 -48 120", 0),
    command("effect @a invisibility 100 1 true", 0),
    command("camera @a set minecraft:free ease 3 in_back pos 84.57 -25.24 121.53 facing 84.57 -46.24 121.53", returnSeconds(1)),
    command("camera @a set minecraft:free ease 3 in_back pos 90.14 -46.86 121.58 facing 87.57 -45.58 121.34", returnSeconds(61)),
    command("camera @a set minecraft:free ease 1 in_back pos 88.91 -47.00 121.50 facing 87.58 -46.00 121.63", returnSeconds(61)),
    command("camera @a set miencraf:free ease 1 in_back pos 87.41 -47.23 123.90 facing 87.52 -46.34 121.63", returnSeconds(23)),
    command("camera @a set minecraft:free ease 1 in_back pos 78.97 -45.40 121.58 facing 81.55 -45.08 121.52", returnSeconds(23)),
    command("camera @a set minecraft:free ease 1 in_back pos 84.59 -44.28 118.89 facing 84.50 -43.89 121.62", 1),
    command("camera @a set minecraft:free ease 1 in_back pos 84.60 -45.11 124.98 facing 84.45 -44.10 121.38", 1),
    command("camera @a set minecraft:free ease 3 in_back pos 84.38 -44.23 122.21 facing 84.38 -44.23 122.21", 1),
    command("camera @a fade time 3 2 1", 0),
    command("camera @a clear", returnSeconds(50)),
    command("effect @a clear", 0),
    command("function resetmap", 0)

]

const lootScene = [
    command("tp @p[tag=lootbox] 37.84 -41.40 174.20 facing 32.57 -48.00 195.07", 0),
    command("summon ao:lootbox 32 -48 195 facing 32 -48 193", 0),
    command("execute as @e[type=ao:lootbox] run playanimation @s lootbox.open", 0.25),
    command("camera @p[tag=lootbox] set minecraft:free ease 3 in_circ pos 32.51 -45.10 193.90 facing 32.45 -47.77 195.48", returnSeconds(5)),
    command("camera @p[tag=lootbox] clear", returnSeconds(1) + 6.50),
    command("tag @p[tag=lootbox] remove lootbox", 0)
]
export const Scene = new Cutscene("start", scene)
export const EndScene = new Cutscene("end", endScene)
export const LootScene = new Cutscene("loot", lootScene)