import styles from './index.module.scss';
import { WeaponRanksDisplay } from '../weapon-ranks';
import { INonPlayableUnitStats } from '../../models';

export function NonPlayerStatItem({ 
    statConfig,
    getChapterLabel,
    config
}: {
        statConfig: INonPlayableUnitStats,
        getChapterLabel?: (statConfig: INonPlayableUnitStats)=>string
        config?: {
            displayWeaponIcons?: boolean
        }
    }) {
    const { level, class: className, stats, route, optional, gameOver, talk, ranks: weaponRanks, weapons } = statConfig;
    const statKeys = Object.keys(stats ?? {}).filter(stat => stat != 'lv');
    const chapterLabel = getChapterLabel ? getChapterLabel(statConfig) : `Chapter ${statConfig.chapter}`;
    return <div className={styles.bossBox}>
        <div className={styles.headerRow}>
            <div>
                <h3>{chapterLabel}</h3>
                {<div className={styles.subTitle}>
                    {route ? <span className={`capitalize ${styles.route}`}>{route}</span> : ''}
                    {level ? <span>Lv. {level} {className ? <span className={styles.class}>{className}</span> : ''}</span> : ''}
                    {optional ? <span className={`${styles.tag} ${styles.optional}`}>Optional</span> : ''}
                    {talk ? <span className={`${styles.tag} ${styles.talk}`}>Talk</span> : ''}
                    {gameOver && talk ? <span className={`${styles.tag} ${styles.gameOver}`}>Do Not Kill</span> : ''}
                </div>}
            </div>
            {weaponRanks ? <WeaponRanksDisplay ranks={weaponRanks} isMasterSealed={false} config={{
                hideUnusable: true,
                displayIcons: config?.displayWeaponIcons
            }} /> : ''}
        </div>
        {stats ?
            <>
                <ul className={styles.stats}>
                    {statKeys.map(stat => <li key={stat}>
                        <div className={styles.statLabel}>{stat}</div>
                        {stats[stat]}
                    </li>)}
                </ul>
                {weapons?.length ? <div>
                    <ul className={styles.weapons}>
                        {weapons.map(wpn => <li className={`capitalize`}>{wpn.replace('_', ' ')}</li>)}
                    </ul>
                </div> : ''}
            </>
            : ''}
        {
            !stats && gameOver ?
                <div className='red-text'>Game Over</div> : ''
        }
    </div>
}