import { INonPlayableUnitStats, IPlayableUnitStats } from "./units.interfaces";

export interface IRenderItem {
    name: string,
    artists: string[],
    displayName?: string,
    path: string,
    isPortraitPublic?: boolean,
};
export interface IRenderItemConfig {
    name: string,
    default: IRenderItem;
    alts?: IRenderItem[];
    renderOrder: number;
    type: string;
};

export interface IRenderCharacterConfig extends IRenderItemConfig {
    unitData: any,
    chapter: number,
    route?: string,
};
export interface IUnit extends IPlayableUnitStats {
    name: string;
    artists: string[];
    displayName?: string;
    isPortraitPublic?: boolean,
    level?: number,
    class?: string;
    path?: string;
    alt?: {
        [name: string]: IAltConfig
    };
    conditional?: {
        player?: IConditional;
        enemy?: IConditional;
        npc?: IConditional;
        chapter?: IConditional | IConditional[];
    },
    routeConfig?: IRouteConfig,
    // this is basically a single route routeConfig. routeConfig takes precedence over this, but if no routeconfig is there
    // i will automatically conver this to allRoute routeconfig in the code.
    characterStates?: ICharacterStateChapter,
    isSpoiler?: boolean;
    secret?: boolean;
    fullSheetRenderOrderOverride?: number,
    bossStats?: INonPlayableUnitStats[],
    npcStats?: INonPlayableUnitStats[],
}


export type IConditional = {
    chapter?: number;
    route?: string;
    displayName?: string,
    swapPortrait?: string,
    ogPortraitName?: string,
    class?: string
} & {
    [key: string]: any
};

export interface IAltConfig {
    artists: string[],
    chapter?: number,
    displayName?: string,
    isSpoiler?: boolean,
    isPortraitPublic?: boolean,
}

export interface ICharacterStateChapter {
    player?: number | number[]; // x chapters will be counted as .5
    enemy?: number | number[];
    npc?: number | number[];
}

export type IRouteConfig = {
    allRoute?: ICharacterStateChapter
} & {
    [routeName: string]: ICharacterStateChapter,
}
