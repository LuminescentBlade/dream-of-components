import { ReactNode, useState } from "react";
import styles from './index.module.scss';
import { WeaponRanksDisplay } from "../weapon-ranks";
import { IPlayableUnitStats, IStats } from "../../models/units.interfaces";

let cachedState: any = {
    blossom: []
};

let currentCharacter: string | undefined;

export function PlayerAverages({
    characterDef,
    config
}: {
    characterDef: IPlayableUnitStats
    config?: {
        enableBlossomDew?: boolean,
        blossomCap?: number,
        blossomValue?: number,
        totalWeaponTypes?: any,
        displayWeaponIcons?: boolean,
        promotedClasses: any,
        unpromotedClasses: any,
        levelCap?: number,
        promotedLevelCap?: number,
        promotionLevelGate?: number,
        displayFields?: string[],
        disableCaps?: boolean,
        disableCapRowDisplay?: boolean
        uiIcons: {
            removeBlossom: () => ReactNode,
            addBlossom: (limit: boolean) => ReactNode
        }
        // todo: FE4 style levels dont reset
    }
}) {
    const enableBlossomDew = config?.enableBlossomDew ?? false;
    const BLOSSOM_VALUE = config?.blossomValue ?? 5;
    const BLOSSOM_LIMIT = config?.blossomCap ?? 1;
    const LEVEL_CAP = config?.levelCap ?? 20;
    const PROMOTED_LEVEL_CAP = config?.promotedLevelCap ?? LEVEL_CAP;
    const PROMOTION_LEVEL_GATE = config?.promotionLevelGate ?? 10;
    if (currentCharacter != characterDef.name) {
        cachedState.blossom = [];
    }

    const defaultLevels = getDefaultLevelByCharacter(characterDef);
    const [levelData, setLevelData] = useState(defaultLevels);
    const [widgetState, setWidgetState] = useState(cachedState);

    currentCharacter = characterDef.name;

    if (levelData.promotedLevel < defaultLevels.promotedLevel ||
        (defaultLevels.unpromotedLevel && (levelData.unpromotedLevel ?? -1) < defaultLevels.unpromotedLevel)) {
        setLevelData(defaultLevels);
    }

    const unpromotedLevelFloor = (characterDef.level ?? 1);
    let promoBonuses: IStats | undefined = undefined;
    let promotedLevelFloor: number, unpromotedCaps: IStats, promotedCaps: IStats;
    if (characterDef.promotesTo) {
        promotedLevelFloor = 0;
        // @ts-ignore
        const promotedClass = config?.promotedClasses[characterDef.promotesTo];
        // @ts-ignore
        unpromotedCaps = config?.unpromotedClasses[characterDef.class].caps ?? {};
        promoBonuses = promotedClass.promo;
        promotedCaps = promotedClass.caps ?? {};
    } else {
        promotedLevelFloor = (characterDef.level ?? 1);
        // @ts-ignore
        promotedCaps = config?.promotedClasses[characterDef.class]?.caps ?? {}; // remove ? later 
    }

    const blossomData = getBlossomLevels();

    function setWidgetStateCaching(widgetStateData: any) {
        cachedState = widgetStateData;
        setWidgetState(cachedState);
    }

    function setUnpromotedLevel(event: any) {
        const value = parseInt(event.currentTarget.value);
        if (isNaN(value) || value < unpromotedLevelFloor) {
            setLevelData({ ...levelData, unpromotedDisplay: event.currentTarget.value });
        } else {
            const calculatedLevel = Math.min(value, LEVEL_CAP);
            const newData = { ...levelData, unpromotedLevel: calculatedLevel, unpromotedDisplay: calculatedLevel };
            if (calculatedLevel < PROMOTION_LEVEL_GATE) {
                newData.promotedLevel = 0;
                newData.promotedDisplay = 0;
            }
            setLevelData(newData);
        }
    };


    function setPromotedLevel(event: any) {
        const value = parseInt(event.currentTarget.value);
        if (isNaN(value) || value < promotedLevelFloor) {
            setLevelData({ ...levelData, promotedDisplay: event.currentTarget.value });
        } else {
            const calculatedLevel = Math.min(value, PROMOTED_LEVEL_CAP);
            setLevelData({ ...levelData, promotedLevel: calculatedLevel, promotedDisplay: calculatedLevel });
        }
    }

    function isPromoted(): boolean {
        // this will evaluate to a boolean no matter what trust me ts lint
        // @ts-ignore
        return (!promoBonuses || (levelData.unpromotedLevel && levelData.unpromotedLevel >= PROMOTION_LEVEL_GATE)) && levelData.promotedLevel > 0;
    }

    function getDefaultLevelByCharacter(characterDef: IPlayableUnitStats) {
        const unpromotedLevel = characterDef.promotesTo ? characterDef.level : undefined;
        const promotedLevel = characterDef.promotesTo ? 0 : characterDef.level ?? 0
        return {
            unpromotedLevel,
            promotedLevel,
            unpromotedDisplay: unpromotedLevel,
            promotedDisplay: promotedLevel
        };
    }

    function addBlossom() {
        if (widgetState.blossom.length >= BLOSSOM_LIMIT) {
            return;
        } else if (!widgetState.blossom.length) {
            const isCharacterPromoted = promoBonuses == null;
            const isLevelPromoted = defaultLevels.promotedLevel >= 1;
            const defaultLevel = defaultLevels.promotedLevel || defaultLevels.unpromotedLevel;

            const blossomItem = { level: defaultLevel, displayLevel: defaultLevel, isLevelPromoted, isCharacterPromoted };

            setWidgetStateCaching({ ...widgetState, blossom: [...widgetState.blossom, blossomItem] });
        } else {
            setWidgetStateCaching({ ...widgetState, blossom: [...widgetState.blossom, { ...widgetState.blossom[widgetState.blossom.length - 1] }] });
        }

    }

    function removeBlossom(index: number) {
        const newBlossom = [...widgetState.blossom];
        newBlossom.splice(index, 1);

        setWidgetStateCaching({ ...widgetState, blossom: newBlossom })
    }

    function getBlossomLevelFloor(isPromoted: boolean) {
        return isPromoted ? Math.max(defaultLevels.promotedLevel, 1) : defaultLevels.unpromotedLevel;
    }

    function setBlossomLevel(index: number, event: any) {
        const value = parseInt(event.currentTarget.value);
        const isNaNValue = isNaN(value);
        const calcValue = isNaNValue ? -1 : value;
        const newBlossom = [...widgetState.blossom];
        const item = { ...newBlossom[index] };
        const minLevel = getBlossomLevelFloor(item.isLevelPromoted);
        const calculatedLevel = Math.min(item.isLevelPromoted ? PROMOTED_LEVEL_CAP : LEVEL_CAP, Math.max(calcValue, minLevel!));
        item.level = calculatedLevel;
        item.displayLevel = isNaNValue ? '' : value;
        newBlossom[index] = item;
        setWidgetStateCaching({ ...widgetState, blossom: newBlossom });
    }

    function toggleBlossomPromotion(index: number) {
        const newBlossom = [...widgetState.blossom];
        const item = { ...newBlossom[index] };
        item.isLevelPromoted = !item.isLevelPromoted;
        newBlossom[index] = item;

        setWidgetStateCaching({ ...widgetState, blossom: newBlossom });
    }


    function getBlossomWidget() {
        return <div className={`lb-averages-blossom ${styles.blossomWidget}`}>
            {
                <button className={`${styles.blossomButton} ${styles.iconButton} ${styles.buttonWrapper} lb-averages-blossom__add`} onClick={addBlossom} disabled={widgetState.blossom.length >= BLOSSOM_LIMIT}>
                    {config?.uiIcons?.addBlossom ? config.uiIcons.addBlossom(widgetState.blossom.length < BLOSSOM_LIMIT) : (widgetState.blossom.length < BLOSSOM_LIMIT) ? '+ Metis Tome' : ''}
                </button>
            }
            {
                widgetState.blossom.map(
                    (item: any, index: number) => <div key={index} className={`${styles.blossomItem} lb-averages-blossom__item`}>
                        Lv. <input type="number" value={widgetState.blossom[index].displayLevel} onChange={(value) => setBlossomLevel(index, value)} />
                        {
                            !item.isCharacterPromoted ? <button
                                className={
                                    `${styles.iconButton} ${
                                        !item.isCharacterPromoted ? styles[`iconButton--${item.isLevelPromoted ? 'actived' : 'inactive'} `] : ''
                                    } icon-master-seal lb-averages-blossom__${item.isLevelPromoted ? 'promoted' : 'unpromoted'} `
                                }
                                onClick={() => toggleBlossomPromotion(index)}
                            >
                            </button> : ''
                        }
                        <button className={`${styles.removeBlossom} ${styles.buttonWrapper} lb-averages-blossom__remove`} onClick={() => removeBlossom(index)}>
                            {config?.uiIcons?.addBlossom ? config.uiIcons.removeBlossom() : '-'}
                        </button>
                    </div>
                )
            }
        </div>
    }
    function getStatInputBar(characterDef: IPlayableUnitStats) {
        if (!characterDef.stats || !characterDef.growths) {
            return;
        }
        return <div className={`lb-averages-controls ${styles.levelControls}`}>
            {characterDef.stats && characterDef.growths ?
                <div className={`lb-averages-controls__levels ${styles.levelInputs}`}>
                    {
                        promoBonuses && levelData.unpromotedLevel ?
                            <div className={`lb-averages-controls__unpromoted-levels lb-averages-controls__level-input-group ${styles.levelInputGroup}`}>
                                <label>Unpromoted</label>
                                <input type="number" value={levelData.unpromotedDisplay} onChange={setUnpromotedLevel} />
                            </div>

                            : ''
                    }
                    {
                        !promoBonuses || (levelData.unpromotedLevel && levelData.unpromotedLevel >= PROMOTION_LEVEL_GATE) ?
                            <div className={`lb-averages-controls__promoted-levels lb-averages-controls__level-input-group ${styles.levelInputGroup}`}>
                                <label>Promoted</label>
                                <input type="number" value={levelData.promotedDisplay} onChange={setPromotedLevel} />
                            </div>
                            : ''
                    }
                </div>
                : ''
            }
            {
                enableBlossomDew ? getBlossomWidget() : ''
            }
        </div>
    }

    function getBlossomLevels() {
        const totalUnpromotedLevels = (levelData.unpromotedLevel ? levelData.unpromotedLevel - unpromotedLevelFloor : 0);
        const totalPromotedLevels = promotedLevelFloor ? Math.max(levelData.promotedLevel - promotedLevelFloor, 0) : Math.max(levelData.promotedLevel - 1 - promotedLevelFloor, 0);
        const unpromoted: number[] = [totalUnpromotedLevels];
        const promoted: number[] = [totalPromotedLevels];
        const sortedBlossom = [...widgetState.blossom].sort((a, b) => {
            if (a.isLevelPromoted !== b.isLevelPromoted) {
                return a.isLevelPromoted ? 1 : -1;
            } else {
                return a.level - b.level;
            }
        });
        let lastUnpromotedLevel = unpromotedLevelFloor;
        let lastPromotedLevel = promotedLevelFloor || 1;
        let currentLevelBlossomCount = 0;
        for (let i = 0; i < sortedBlossom.length; i++) {
            const item = sortedBlossom[i];
            if (item.isLevelPromoted) {
                // if u take blossom at lv 2 promo and then level 5 and you're currently at lv 8
                // expected behavior is  [7] => [1, 6] => [1, 3 ,3]
                const levelDiff = Math.min(item.level - lastPromotedLevel, levelData.promotedLevel - lastPromotedLevel);; // (1) 2 - 1 = 1, (2) 5 - 2 = 3
                const minLevels = Math.max(promoted[i] - levelDiff, 0); // negatives
                promoted.push(minLevels); // (1) index 1:  8 - 2 = 6, (2) index 2: 6 - 3 = 3
                promoted[i] = levelDiff; // (1) [1, 6], (2) [1, 3, 3]
                lastPromotedLevel = item.level; // (0->1) 1, (1->2) 2 , (2->e) 4

                if (levelData.promotedLevel >= item.level) {
                    currentLevelBlossomCount++;
                }
            } else {
                promoted[i] = 0;
                promoted.push(totalPromotedLevels);
                const levelDiff = Math.min(item.level - lastUnpromotedLevel, Math.max(levelData.unpromotedLevel! - lastUnpromotedLevel, 0));
                const minLevels = Math.max(unpromoted[i] - levelDiff, 0);
                unpromoted.push(minLevels);
                unpromoted[i] = levelDiff;
                lastUnpromotedLevel = item.level;
                if (levelData.unpromotedLevel! >= item.level) {
                    currentLevelBlossomCount++;
                }
            }

            // hybrid case: base lv 2, blossom 1 at 4, promotion at 19, blossom 2 at lv 2 promoted, lv 5 promoted currently
            // blossom config: {level: 4, promoted: false}, {level: 2, promoted: true}
            // expected behavior: unpromoted [2, 15] promoted: [0, 1, 3]
        }
        return { unpromoted, promoted, currentLevelBlossomCount };
    }

    function calcStat(base: number, growth: number, isPromoted?: boolean) {
        const levels = isPromoted ? blossomData.promoted : blossomData.unpromoted;
        return levels.reduce((total, numLvs, index) => total + (0.05 * index + growth) * numLvs, base);
    }

    function getStat(statKey: string) {
        if (!characterDef.stats) return <td></td>;
        let capped = false;
        const base = characterDef.stats[statKey];
        let value = base;
        let growth = characterDef.growths ? (characterDef.growths[statKey] ?? 0) / 100 : null;
        if (promoBonuses && growth != null) { // unpromoted unit
            value = calcStat(base, growth, false);
            const unpromotedCap = config?.disableCaps ? Number.MAX_SAFE_INTEGER : (unpromotedCaps[statKey] ?? Number.MAX_SAFE_INTEGER);
            capped = value >= unpromotedCap;
            if (capped) {
                value = unpromotedCap;
            }
            if (isPromoted()) {
                // for capbreak edition set value to unpromoted caps if capped here or it'll mess with the calcs
                const promo1Stat = value + (promoBonuses[statKey] ?? 0);
                value = value = calcStat(promo1Stat, growth, true);
                capped = value >= (promotedCaps[statKey] ?? Number.MAX_SAFE_INTEGER);
                if (capped) {
                    value = promotedCaps[statKey];
                }
            }
        } else if (growth != null) {
            value = calcStat(base, growth, true);
            capped = value >= promotedCaps[statKey];
            if (capped) { value = promotedCaps[statKey] }
        } else if (promoBonuses) {
            value = value + (isPromoted() ? (promoBonuses[statKey] ?? 0) : 0);
        }

        return <td key={statKey} className={`${capped ? styles.capped : ''} lb-averages__capped-stat`}>{value?.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
    }

    function renderStatChecker() {
        const statKeys = config?.displayFields ?? Object.keys(promotedCaps ?? characterDef.stats);
        const result = <>
            {getStatInputBar(characterDef)}
            <div className={`lb-averages ${styles.tableWrapper}`}>
                <table className={`lb-averages__table ${styles.statTable}`}>
                    <thead>
                        <tr>
                            <td className={styles.rowHeader}></td>
                            {statKeys.map(s => <td key={s} className={`${styles.colHeader} ${styles.capitalize}`}>{s}</td>)}
                        </tr>
                    </thead>
                    <tbody>
                        {characterDef.stats ?
                            <tr className='lb-averages__stats-row'>
                                <th className={`${styles.capitalize}`}>bases</th>
                                {statKeys.map(s => <td key={s}>{characterDef.stats ? characterDef.stats[s] : ''}</td>)}
                            </tr>
                            : ''
                        }
                        {characterDef.growths ?
                            <tr className='lb-averages__growths-row'>
                                <th className={`${styles.capitalize} ${styles[`growthsHeader${blossomData.currentLevelBlossomCount}`]}`}>growths</th>
                                {statKeys.map(s => <td key={s} >{characterDef.growths && characterDef.growths[s] != null ? `${characterDef.growths[s] + BLOSSOM_VALUE * blossomData.currentLevelBlossomCount}%` : '--'}</td>)}
                            </tr>
                            : ''
                        }
                        {promoBonuses != null ?
                            <tr className='lb-averages__promo-row'>
                                <th className={`${styles.capitalize}`}>Promo</th>
                                {statKeys.map(s => <td key={s} >{promoBonuses![s]}</td>)}
                            </tr>
                            : ''
                        }
                        {characterDef.stats && characterDef.growths ?
                            <tr className={`${styles.avgs} lb-averages__averages-row`}>

                                <th>Lv.{
                                    //@ts-ignore
                                    `${promoBonuses ? levelData.unpromotedLevel : ''}${promoBonuses && isPromoted() ? '/' : ''}${isPromoted() ? levelData.promotedLevel : ''}`
                                }
                                </th>
                                {
                                    statKeys.map(s => getStat(s))
                                }
                            </tr>
                            : ''
                        }
                        {!config?.disableCapRowDisplay ? <tr className={`lb-averages__caps-row ${styles.caps}`}>
                            <th className={`${styles.capitalize}`}>caps</th>
                            {statKeys.map(s => <td key={s} >{promotedCaps[s]}</td>)}
                        </tr> : ''}
                    </tbody>
                </table>
            </div>
            <WeaponRanksDisplay
                characterDef={characterDef}
                isMasterSealed={isPromoted() && characterDef.promotesTo != null}
                config={{
                    weaponTypes: config?.totalWeaponTypes,
                    promoted: config?.promotedClasses,
                    unpromoted: config?.unpromotedClasses,
                    hideUnusable: config?.totalWeaponTypes === null,
                    displayIcons: config?.displayWeaponIcons
                }}

            />
        </>
        return result;
    }

    return renderStatChecker();
}