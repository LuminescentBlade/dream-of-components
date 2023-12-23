import styles from './index.module.scss';
import { NonPlayerStatItem } from '../non-player-stat-item';
import { INonPlayableUnitStats } from '../../models';
import { ReactNode } from 'react';

export function NonPlayableStats({ stats, chapterLimit, customTags, getChapterLabel, config }: {
    stats: INonPlayableUnitStats[],
    chapterLimit: number,
    getChapterLabel?: (statConfig: INonPlayableUnitStats) => string,
    customTags?: (statConfig: INonPlayableUnitStats) => ReactNode,
    config?: {
        displayWeaponIcons: boolean
    }
}
) {
    return <ul className={styles.bossList}>
        {
            stats
                .filter(item => item.chapter <= chapterLimit)
                .map(item => <li key={item.chapter}>
                    <NonPlayerStatItem statConfig={item} getChapterLabel={getChapterLabel} customTags={customTags} config={{ displayWeaponIcons: config?.displayWeaponIcons }} />
                </li>)
        }
    </ul>
}