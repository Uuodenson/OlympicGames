// Core types and base classes
import "./types";
import "./classes/Game"

// Utils and enums - load before game modules
import "./game/utils/enums/custom"
import "./game/utils/enums/particles"
import "./game/utils/enums/sounds"
import "./game/utils/syntax/saveddatatypes"
import "./game/utils/LoadPoint"
import "./game/utils/loaddata"
import "./game/utils/events"
import "./game/utils/Editor"

// Game settings
import "./settings/world_data"

// Core game modules
import "./game/Events"
import "./game/core/RingGame"
import "./game/core/ClickerBombGame"
import "./game/core/ThunderHammerGame"
import "./game/core/WheelieRunGame"
import "./game/core/JerusalemGame"
import "./game/core/TailHitterGame"

// UI components
import "./ui/menu"
import "./ui/menu/smileyMenu"
import "./ui/menu/Lootbox"

// Cutscenes
import "./cutscenes/start"
