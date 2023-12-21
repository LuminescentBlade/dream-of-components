import { RenderUnit } from "./render-unit.class";
import { IRenderCharacterConfig, IUnit } from "../models/spritesheet.interfaces";

// TODO: have a DoFCharacter class that extends this

export class RenderCharacter extends RenderUnit {
    constructor(
        private characterInput: IUnit,
        private getPath: (name: string) => string,
        private renderRules: { bypassSpoiler?: boolean, useEarliest?: boolean, renderAll?: boolean } = {},
        private conditionalFields: string[] = []
    ) {
        super(characterInput, getPath);
    }

    protected renderData?: any;
    protected placements?: { value: string, chapter: number }[];

    set currentChapter(data: { chapter: number, route?: string } | undefined) {
        const chapterData = this.renderRules?.renderAll ? { chapter: Number.MAX_SAFE_INTEGER } : data;
        this.placements = chapterData ? this.getCharacterPlacements(chapterData) : undefined;
        const placement = this.placements ? this.placements[0] : undefined;
        const parsedCharacter = placement ? this.parseCharacter(placement) : undefined;
        if (parsedCharacter && chapterData && placement) {
            this.renderData = this.getRenderItems(parsedCharacter, chapterData, placement)
        } else {
            this.renderData = undefined;
        }
    }

    public get data() {
        return this.renderData;
    }

    private readonly DEFAULT_PLACEMENT = { chapter: Number.MAX_SAFE_INTEGER, value: 'character' };

    private getCharacterPlacements(chapterData: { chapter: number, route?: string }) {
        const { bypassSpoiler, useEarliest } = this.renderRules;
        const { chapter, route } = chapterData;
        if (this.character.isSpoiler && !bypassSpoiler) {
            return;
        }
        let placement: { value: string, chapter: number }[] | undefined;
        if (this.renderRules?.renderAll) {
            return [this.DEFAULT_PLACEMENT];
        }
        if (!this.character.routeConfig) {
            return [this.DEFAULT_PLACEMENT];
        }
        if (chapterData.route == null) {
            placement = this.getAllPlacement(chapter, this.character, useEarliest, bypassSpoiler);
        } else {
            placement = this.getSinglePlacement(route, chapter, this.character, useEarliest, bypassSpoiler);
        }
        return placement;
    }

    private getSinglePlacement(route: string | undefined | null, chapter: number, character: IUnit, useEarliest = false, showSecretPlayable = false) {
        let routeConfig;
        const characterRouteConfig = character?.routeConfig;
        if (route && characterRouteConfig && characterRouteConfig[route]) {
            routeConfig = characterRouteConfig[route];
        } else if (characterRouteConfig?.allRoute) {
            routeConfig = characterRouteConfig.allRoute;
        }
        if (!routeConfig) {
            return;
        }
        const validStates: any[] = [];
        const checkByLatest = (config: number | number[], type: string) => {
            if (typeof config === 'number') {
                if (config <= chapter) {
                    validStates.push({ value: type, chapter: config });
                }
            } else {
                let index = -1;
                while (config[index + 1] <= chapter) {
                    index++;
                }
                if (index >= 0) {
                    validStates.push({ value: type, chapter: config[index] });
                }
            }
        }

        if (routeConfig.player != null && (!character.secret || showSecretPlayable)) {
            checkByLatest(routeConfig.player, 'player');
        }
        if (routeConfig.enemy != null) {
            checkByLatest(routeConfig.enemy, 'enemy');
        }
        if (routeConfig.npc != null) {
            checkByLatest(routeConfig.npc, 'npc');
        }
        if (validStates.length) {
            validStates.sort((a, b) => {
                const chapterDiff = b.chapter - a.chapter;
                if (chapterDiff) {
                    return (useEarliest ? -1 : 1) * chapterDiff;
                } else {
                    return b.value === 'player' ? 1 :
                        b.value === 'enemy' && a.value === 'npc' ? 1 : -1;
                }
            });
            return validStates;
        } else {
            return;
        }
    }

    private getAllPlacement(chapter: number, character: IUnit, useEarliest = false, showSecretPlayable = false) {
        // refactor to be more genericized to accept n routes
        const placements = Object.keys(character.routeConfig!)
            // @ts-ignore
            .map((route) => {
                const routePlacement = this.getSinglePlacement(route, chapter, character, useEarliest, showSecretPlayable);
                if (routePlacement) {
                    routePlacement.sort((a, b) => (useEarliest ? a!.chapter - b!.chapter : b!.chapter - a!.chapter));
                    return routePlacement[0];
                } else {
                    return undefined;
                }
            }
            )
            .filter(placement => placement);
        if (!placements.length) {
            return undefined;
        }
        placements.sort((a, b) => {
            if (useEarliest) {
                return a!.chapter - b!.chapter;
            } else if (b!.value === a!.value) {
                return a!.chapter - b!.chapter;
            } else if (b!.value !== 'player' && a!.value !== 'player') {
                return b!.chapter - a!.chapter;
            }
            else if (b!.value === 'player') {
                return 1;
            } else {
                return -1;
            }
        });
        return placements;
    }

    private parseCharacter(placement: { value: string, chapter: number }) {
        const { bypassSpoiler } = this.renderRules;
        if (placement) {
            const characterItem: IUnit = { ...this.character };
            if (this.character.alt) {
                let characterAlt = { ...this.character.alt };
                if (!bypassSpoiler) {
                    characterAlt = Object.keys(this.character.alt).reduce((alts, altName) => (characterAlt[altName].isSpoiler ? alts : { ...alts, [altName]: { ...characterAlt[altName] } }), {})
                }
                characterItem.alt = Object.keys(characterAlt)?.length ? characterAlt : undefined;
            }
            return characterItem;
        }
    }

    private getRenderItems(unit: IUnit, chapterConfig: { chapter: number, route?: string }, placement: { value: string, chapter: number }): IRenderCharacterConfig {
        let defaultDisplay = { name: unit.name, displayName: unit.displayName, path: this.urls.default, artists: unit.artists };
        let alts;
        let defaultSwap;
        const { chapter, route } = chapterConfig;
        // check conditionals
        // consolidate unit type vs chapter based conditionals and then apply them all
        // chapter based override unit type based if chapter > placement.chapter, if equal or less then unit type
        let newDisplayName, swapPortrait: string, ogPortraitName, className;
        const customConditionalCache: any = {};
        if (unit.conditional) {
            const chapterConditionals = unit.conditional.chapter && unit.conditional.chapter.chapter! <= chapter ? unit.conditional.chapter : null;
            // @ts-ignore
            const typeConditionals = unit.conditional[placement.value];
            if (chapterConditionals && typeConditionals) {
                let primary: any, secondary: any;
                if (chapterConditionals.chapter! > placement.chapter) {
                    primary = chapterConditionals;
                    secondary = typeConditionals;
                } else {
                    primary = typeConditionals;
                    secondary = chapterConditionals;
                }
                newDisplayName = primary.displayName ?? secondary.displayName;
                swapPortrait = primary.swapPortrait ?? secondary.swapPortrait;
                ogPortraitName = primary.ogPortraitName ?? secondary.ogPortraitName;
                className = primary.class ?? secondary.class;
                this.conditionalFields.forEach(field => {
                    customConditionalCache[field] = primary[field] ?? secondary[field];
                });

            } else if (chapterConditionals || typeConditionals) {
                const conditionals = chapterConditionals ?? typeConditionals;
                newDisplayName = conditionals.displayName;
                swapPortrait = conditionals.swapPortrait;
                ogPortraitName = conditionals.ogPortraitName;
                className = conditionals.class;
                this.conditionalFields.forEach(field => {
                    customConditionalCache[field] = conditionals[field];
                });
            }
        }
        // @ts-ignore
        if (swapPortrait && unit.alt && unit.alt[swapPortrait]) { // ogPortraitName is always configured for swapPortrait otherwise it doesn't do anything
            const swapItem = unit.alt[swapPortrait];
            defaultSwap = defaultDisplay;
            defaultDisplay = { name: swapPortrait, path: this.urls.alts[swapPortrait], artists: swapItem.artists, displayName: swapItem.displayName }
            defaultSwap.displayName = ogPortraitName ?? defaultSwap.displayName;
            newDisplayName = newDisplayName ?? unit.displayName ?? unit.name;
        }
        if (newDisplayName) {
            defaultDisplay.displayName = newDisplayName;
        }
        if (unit.alt) {
            alts = Object.entries(unit.alt)
                .filter(([key, value]) => key !== swapPortrait && (!value.chapter || value.chapter <= chapter))
                .map(([key, value]) => ({ ...value, name: key, path: this.urls.alts[key], displayName: `${unit.displayName} ${value.displayName}` }));
        }
        if (defaultSwap) {
            alts = alts ? [defaultSwap, ...alts] : [defaultSwap];
        }

        const newUnitData = { ...unit, path: defaultDisplay.path, class: className ?? unit?.class };
        this.conditionalFields.forEach(field => {
            // @ts-ignore
            newUnitData[field] = customConditionalCache[field] ?? newUnitData[field];
        });

        return {
            name: this.character.name,
            renderOrder: placement.chapter,
            type: placement.value,
            unitData: newUnitData,
            default: defaultDisplay,
            alts,
            chapter,
            route
        };
    }
};

