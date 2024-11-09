import {
  DisplaySlotId,
  EntityRidingComponent,
  ObjectiveSortOrder,
  Player,
  ScoreboardObjective,
  system,
  world,
} from "@minecraft/server";

import "game/ring";

system.afterEvents.scriptEventReceive.subscribe((event) => {
  switch (event.id) {
    case "ao:message_player": {
      if (event.sourceEntity instanceof Player) {
        event.sourceEntity.sendMessage(event.message);
      }
    }
    case "ao:message": {
      world.sendMessage(event.message);
    }
  }
});
