'use client';

import { UnitSheetSprite } from '../../components/unit-sheet-sprite';
import styles from './index.module.scss'
import { IRenderItemConfig } from './../../models/spritesheet.interfaces';
import { ReactNode } from 'react';

export function UnitSheet({ data, artistConfig, expansionState, toggleCharacter, getOnClick, customCredits }: {
    data: { [key: string]: IRenderItemConfig[] },
    artistConfig: any, expansionState: Map<string, boolean>,
    toggleCharacter: (name: string) => () => void,
    getOnClick?: (character: any, state: any) => (() => void) | undefined
    customCredits?: () => ReactNode
}) {
    const sections = Object.keys(data) as string[];
    const artists = Object.entries(artistConfig);


    return (<div id='unit-sheet' className={`${styles.base} lb-sprite-sheet`}>
        {
            // @ts-ignore
            sections
                .filter((section: string) => data[section]?.length)
                .map((section: string) => (
                    <section key={section} className={`${styles.container} ${styles.spritesheet} lb-sprite-sheet__section`}>
                        <h2>{section}</h2>
                        {
                            data[section]?.map((character: IRenderItemConfig) => {
                                const onClickFcn = getOnClick ? getOnClick(character, section) : undefined;
                                if (!character.alts?.length) {
                                    return <UnitSheetSprite key={character.default.name} type={section} characterDef={character.default} artistConfig={artistConfig} onCharacterClick={onClickFcn} />
                                } else {
                                    const toggleFcn = toggleCharacter(character.name);
                                    const baseItem = <UnitSheetSprite key={character.default.name} type={section} characterDef={character.default} artistConfig={artistConfig} expanded={expansionState.get(character.name)} onExpand={toggleFcn} onCharacterClick={onClickFcn} />;
                                    if (expansionState.get(character.name)) {
                                        return <>
                                            {baseItem}
                                            {character.alts.map((alt) => {
                                                const name = `${character.name}_${alt.name}`;
                                                return <UnitSheetSprite key={`${character.name}_${alt.name}`} type={section} characterDef={alt} artistConfig={artistConfig} />
                                            })}
                                        </>
                                    } else {
                                        return baseItem;
                                    }
                                }
                            })
                        }
                    </section>
                ))}
        <section className={`${styles.container} lb-sprite-sheet__credits-container`}>
            <h2>Artist Credits</h2>
            {customCredits ? customCredits() : <ul className={`${styles.credits} lb-sprite-sheet__credits`} id={'sprite-sheet-credits'}>
                {
                    artists.map(([name, artist]: [string, any]) => (
                        <li key={name}>
                            <div className={styles.artist} style={{ backgroundColor: `var(--lb-artist-${name})` }}>
                            </div>
                            {artist.name}
                        </li>
                    ))
                }
            </ul>}
        </section>
    </div>);
}