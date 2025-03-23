import { Player } from "@minecraft/server";
import { SavedDataTypes } from "../utils/enums/custom";
import { ExperienceSyntax } from "../../types";
import { gameEvents } from "../Events";
import { data } from "game/utils/loaddata";

interface LevelUpReward {
    level: number;
    reward: string;
    multiplier: number;
}

class LevelSystem {
    public static readonly BASE_EXP_GAIN = 0.5;
    public static readonly MILESTONE_LEVELS = [5, 10, 15, 20, 25, 30];
    public static readonly LEVEL_REWARDS: LevelUpReward[] = [
        { level: 5, reward: "Bronze Milestone", multiplier: 1.2 },
        { level: 10, reward: "Silver Milestone", multiplier: 1.5 },
        { level: 15, reward: "Gold Milestone", multiplier: 1.8 },
        { level: 20, reward: "Platinum Milestone", multiplier: 2.0 },
        { level: 25, reward: "Diamond Milestone", multiplier: 2.5 },
        { level: 30, reward: "Master Milestone", multiplier: 3.0 }
    ];

    public static calculateExpThreshold(level: number): number {
        return Math.floor(20 * Math.pow(1.2, level));
    }

    public static addExperience(player: Player, baseAmount: number = this.BASE_EXP_GAIN): void {
        const expData = JSON.parse(player.getDynamicProperty(SavedDataTypes.EXP) as string) as ExperienceSyntax;
        const currentLevel = expData.level;
        const multiplier = this.getLevelMultiplier(currentLevel);
        
        expData.value += baseAmount * multiplier;
        const threshold = this.calculateExpThreshold(currentLevel);

        if (expData.value >= threshold) {
            this.levelUp(player, expData);
        }
        data
    }

    public static levelUp(player: Player, expData: ExperienceSyntax): void {
        expData.level += 1;
        expData.value = 0;
        
        // Check for milestone rewards
        const milestone = this.LEVEL_REWARDS.find(r => r.level === expData.level);
        if (milestone) {
            player.sendMessage(`§6§l>> §r§fCongratulations! You've reached level ${expData.level}!`);
            player.sendMessage(`§6§l>> §r§fUnlocked: ${milestone.reward}`);
            player.sendMessage(`§6§l>> §r§fNew EXP Multiplier: ${milestone.multiplier}x`);
        } else {
            player.sendMessage(`§6§l>> §r§fLevel Up! You are now level ${expData.level}!`);
        }

        gameEvents.triggerEvent("Battle Pass Upgrade", { player, level: expData.level });
    }

    public static getLevelMultiplier(level: number): number {
        const milestone = [...this.LEVEL_REWARDS]
            .reverse()
            .find(r => level >= r.level);
        return milestone ? milestone.multiplier : 1.0;
    }

    public static getProgressInfo(player: Player): { level: number; progress: number; nextThreshold: number } {
        const expData = JSON.parse(player.getDynamicProperty(SavedDataTypes.EXP) as string) as ExperienceSyntax;
        const nextThreshold = this.calculateExpThreshold(expData.level);
        const progress = (expData.value / nextThreshold) * 100;

        return {
            level: expData.level,
            progress: Math.min(progress, 100),
            nextThreshold
        };
    }
}
export {LevelSystem as LevelSys}