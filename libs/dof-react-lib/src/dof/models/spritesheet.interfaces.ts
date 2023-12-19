export interface IRenderItem {
    name: string,
    artists: string[],
    displayName?: string,
    path: string
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
export interface IUnit {
    name: string;
    artists: string[];
    displayName?: string;
    class?:string;
    alt?: {
        [name: string]: IAltConfig
    };
    conditional?: {
        player?: IConditional;
        enemy?: IConditional;
        npc?: IConditional;
        chapter?: IConditional;
    },
    routeConfig?: IRouteConfig,
    isSpoiler?: boolean;
    secret?: boolean;
    fullSheetRenderOrderOverride?: number
}


export type IConditional =  {
    chapter?: number;
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
    isSpoiler?: boolean
}

export interface ICharacterStateChapter {
    player?: number; // x chapters will be counted as .5
    enemy?: number | number[];
    npc?: number | number[];
}

export type IRouteConfig = {
    allRoute?: ICharacterStateChapter
} & {
    [routeName: string]: ICharacterStateChapter,
}
