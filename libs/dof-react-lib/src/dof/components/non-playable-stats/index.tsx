import styles from './index.module.scss';
import { NonPlayerStatItem } from '../non-player-stat-item';
import { INonPlayableUnitStats } from '../../models';

export function NonPlayableStats({ stats, chapterLimit, getChapterLabel, config }: {
    stats: INonPlayableUnitStats[],
    chapterLimit: number,
    getChapterLabel?: (statConfig: INonPlayableUnitStats) => string,
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
                    <NonPlayerStatItem statConfig={item} getChapterLabel={getChapterLabel} config={{ displayWeaponIcons: config?.displayWeaponIcons }} />
                </li>)
        }
    </ul>
}