event entity @e[type=ao:interactable] despawn
event entity @e[type=ao:ring] despawn
fill 66 -49 101 102 -49 140 minecraft:sand replace barrier
structure load mystructure:map 66 -49 105
clear @a
event entity @e[type=ao:rideable] ao:despawn
event entity @e[type=ao:jerusalem] ao:despawn
inputpermission set @a movement enabled
scriptevent ao:resetspectator
camera @a clear
inputpermission set @a camera enabled
