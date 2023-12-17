import styles from './index.module.scss';
import { IPlayableUnitStats, IStats } from '../../models/units.interfaces';


let lastCharacter: string;
let lastMSStatus: boolean;
let lastRanks: IStats;
let cachedRanks: { [key: string]: { base: any, promotion: any } } = {};
export function WeaponRanksDisplay({
    characterDef,
    ranks,
    isMasterSealed,
    config
}:
    {
        characterDef?: IPlayableUnitStats,
        ranks?: IStats,
        isMasterSealed?: boolean,
        config?: {
            weaponTypes?: any,
            promoted?: { [key: string]: { weapons: any } }
            unpromoted?: { [key: string]: { weapons: any } }
            hideUnusable?: boolean,
            displayIcons?: boolean,
        }
    }
) {
    console.log(isMasterSealed);
    const hideUnusable = config?.hideUnusable ?? false;
    const fixedRanks = (!characterDef ? ranks : characterDef.ranks) ?? {};
    let weapons: string[];
    if (config?.weaponTypes) {
        weapons = Array.isArray(config.weaponTypes) ? config.weaponTypes : Object.values(config.weaponTypes);
    } else {
        weapons = Object.keys(fixedRanks);
    }
    if (characterDef && config?.unpromoted && config?.promoted) {
        if (lastCharacter !== characterDef.name || lastMSStatus !== isMasterSealed) {
            lastCharacter = characterDef.name;
            lastMSStatus = isMasterSealed ?? false;

            const baseClassKey: string = characterDef.class!;
            const personalRanks = characterDef.ranks ?? {};
            const baseClass = characterDef.promotesTo ? config.unpromoted[baseClassKey].weapons : (config.promoted[baseClassKey]?.weapons ?? config.unpromoted[baseClassKey].weapons);
            const promotedClass = characterDef.promotesTo ? config.promoted[characterDef.promotesTo].weapons : null;
            cachedRanks = weapons.reduce((ranks, weapon) => {
                if (!personalRanks[weapon] && !baseClass[weapon] && (promotedClass && !promotedClass[weapon])) {
                    ranks[weapon] = null;
                    return ranks;
                }

                const baseRank = Math.max(personalRanks[weapon], baseClass[weapon]);
                let promotion;
                if (promotedClass) {
                    promotion = promotedClass[weapon] ? (baseRank || 0) + Math.max(promotedClass[weapon] - (baseClass[weapon] || 0), 0) : null;
                }
                ranks[weapon] = { base: getRankConfig(baseRank), promotion: promotion ? getRankConfig(promotion) : null };
                return ranks;
            }, {} as any);
        }
    }
    else if (fixedRanks && lastRanks != fixedRanks) {
        cachedRanks = weapons.reduce((parseRanks, weapon) => {
            parseRanks[weapon] = { base: getRankConfig(fixedRanks[weapon]), promotion: null };
            return parseRanks;
        }, {} as any);
    }

    function getRankConfig(value: number) { // TODO: make this configurable
        if (value >= 251) {
            return { value, letter: 'S', nextLevel: null };
        } else if (value >= 181) {
            return { value, letter: 'A', nextLevel: 251 - value };
        } else if (value >= 121) {
            return { value, letter: 'B', nextLevel: 181 - value };
        } else if (value >= 71) {
            return { value, letter: 'C', nextLevel: 121 - value };
        } else if (value >= 31) {
            return { value, letter: 'D', nextLevel: 71 - value };
        } else if (value >= 1) {
            return { value, letter: 'E', nextLevel: 31 - value };
        } else {
            return null;
        }
    }

    return <ul className={styles.weaponList}>
        {weapons
            .filter(wpn => !hideUnusable || cachedRanks[wpn]?.base || (isMasterSealed && cachedRanks[wpn]?.promotion))
            .map(wpn => <li key={wpn}
                className={`${styles.weaponItem} ${cachedRanks[wpn]?.base ? styles.baseWeaponActive : ''} ${isMasterSealed && cachedRanks[wpn]?.promotion ? styles.promotedWeaponActive : ''}`}>
                {config?.displayIcons ? <span className={`icon-wpn-${wpn} ${styles.weaponIcon}`}></span> : <span className={styles.weaponNameText}>{wpn}</span>}
                {cachedRanks[wpn]?.base || (isMasterSealed && cachedRanks[wpn]?.promotion) ? <span className={styles.weaponRank}>
                    {cachedRanks[wpn]?.base ? <span>{cachedRanks[wpn].base.letter}</span> : ''}
                    {isMasterSealed && !cachedRanks[wpn].base && cachedRanks[wpn]?.promotion ? <span>{cachedRanks[wpn].promotion.letter}</span> : ''}
                    {
                        isMasterSealed &&
                            cachedRanks[wpn]?.base &&
                            cachedRanks[wpn]?.promotion &&
                            cachedRanks[wpn]?.base.letter !== cachedRanks[wpn]?.promotion.letter ? <span>&rarr;{cachedRanks[wpn].promotion.letter}</span> : ''}

                </span> : ''}
            </li>)}
    </ul>
}