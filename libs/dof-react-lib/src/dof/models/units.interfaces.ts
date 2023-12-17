export interface IStats {
    [stat: string]: number
}


export interface IPlayableUnitStats {
    name: string,
    growths?: IStats,
    class?: string,
    promotesTo?: string,
    stats?: IStats,
    level?: number,
    ranks?: IStats,
}

export interface INonPlayableUnitStats {
    chapter: number,
    class?: string,
    promotesTo?: string,
    stats?: IStats,
    level?: number,
    ranks?: IStats,
    route?: string, // null means all routes
    weapons?: string[], // null means copy from base
    optional?: boolean,
    drops?: string,
    stealable?: string,
    talk?: boolean,
    gameOver?: boolean
};