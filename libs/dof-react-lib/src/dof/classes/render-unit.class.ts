import { IRenderItemConfig, IUnit } from "../models/spritesheet.interfaces";

export class RenderUnit {

    constructor(private unit: IUnit, private pathFcn: (name: string) => string) {
        this.urls = {
            default: pathFcn(unit.name),
            alts: unit.alt ? Object.keys(unit.alt).reduce((c, k) => ({ ...c, [k]: pathFcn(`${unit.name}_${k}`) }), {}) : {}
        };
        this.character = { ...this.unit };
        this.character.displayName = this.character.displayName ?? this.capitalize(this.character.name);
        const unitAlts = this.unit.alt;
        if (unitAlts) {
            this.character.alt = Object.keys(unitAlts).reduce((alts, key) => ({ ...alts, [key]: { ...unitAlts[key], displayName: unitAlts[key].displayName ?? this.capitalize(key) } }), {});
        }
    }

    character: IUnit;
    urls: {
        default: string,
        alts: { [key: string]: string }
    };

    get data(): IRenderItemConfig {
        return {
            name: this.unit.name,
            renderOrder: Number.MAX_SAFE_INTEGER,
            type: 'unit',
            default: { ...this.unit, path: this.urls.default },
            alts: this.unit.alt ? Object.entries(this.unit.alt).map(([key, value]) => ({ ...value, name: key, path: this.urls.alts[key] })) : undefined
        };
    }

    private capitalize(str: string) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}