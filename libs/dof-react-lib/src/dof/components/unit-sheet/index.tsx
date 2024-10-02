'use client';

import { UnitSheetSprite } from '../../components/unit-sheet-sprite';
import styles from './index.module.scss'
import { IRenderItem, IRenderItemConfig } from './../../models/spritesheet.interfaces';
import { ReactNode, useState } from 'react';
import { getArtistCreditStyles } from '../../tools';

export function UnitSheet({ data, artistConfig, expansionState, toggleCharacter, getOnClick, customCredits, appendCredits, appendTooltip }: {
    data: { [key: string]: IRenderItemConfig[] },
    artistConfig?: any,
    expansionState?: Map<string, boolean>,
    toggleCharacter?: (name: string) => () => void,
    getOnClick?: (character: any, state: any) => (() => void) | undefined
    customCredits?: () => ReactNode,
    appendCredits?: () => ReactNode,
    appendTooltip?: (item: IRenderItem, labelClass: string) => ReactNode
}) {
    const sections = Object.keys(data) as string[];
    const artists = Object.entries(artistConfig ?? {});

    const [unitSheetState, setUnitSheetState] = useState({ expansion: new Map<string, boolean>() });

    function getToggleFunction(name: string) {
        if (toggleCharacter && expansionState) {
            return toggleCharacter(name);
        } else {
            return () => {
                unitSheetState.expansion.set(name, !unitSheetState.expansion.get(name));
                setUnitSheetState({ ...unitSheetState, expansion: unitSheetState.expansion });
            }
        }
    }

    function getSpriteSection(section: string) {
        const expansion = (toggleCharacter && expansionState) ? expansionState : unitSheetState.expansion;
        return data[section]?.map((character: IRenderItemConfig) => {
            const onClickFcn = getOnClick ? getOnClick(character, section) : undefined;
            if (!character.alts?.length) {
                return <UnitSheetSprite key={character.default.name} type={section} characterDef={character.default} artistConfig={artistConfig} onCharacterClick={onClickFcn} appendTooltip={appendTooltip} />
            } else {
                const toggleFcn = getToggleFunction(character.name);
                const baseItem = <UnitSheetSprite key={`${character.name}_${character.default.name}`} type={section} characterDef={character.default} artistConfig={artistConfig} expanded={expansion.get(character.name)} onExpand={toggleFcn} onCharacterClick={onClickFcn} appendTooltip={appendTooltip} />;
                if (expansion.get(character.name)) {
                    return <>
                        {baseItem}
                        {character.alts.map((alt) => {
                            const name = `${character.name}_${alt.name}`;
                            return <UnitSheetSprite key={`${character.name}_${alt.name}`} type={section} characterDef={alt} artistConfig={artistConfig} appendTooltip={appendTooltip} />
                        })}
                    </>
                } else {
                    return baseItem;
                }
            }
        })
    }

    return (<div id='unit-sheet' className={`${styles.base} lb-sprite-sheet`} style={getArtistCreditStyles(artistConfig ?? {})}>
        {
            // @ts-ignore
            sections
                .filter((section: string) => data[section]?.length)
                .map((section: string) => (
                    <section key={section} className={`${styles.container} ${styles.spritesheet} lb-sprite-sheet__section`}>
                        <h2 className={`lb-sprite-sheet__section-header lb-sprite-sheet__sprite-section-header lb-sprite-sheet__${section}-section-header`}>{section}</h2>
                        {getSpriteSection(section)}
                    </section>
                ))}
        <section className={`${styles.container} lb-sprite-sheet__credits-container`}>
            {artists.length ? <h2 className='lb-sprite-sheet__section-header lb-sprite-sheet__artist-section-header' id={'sprite-sheet-credits'}>Artist Credits</h2> : ''}
            {customCredits ? customCredits() : <ul className={`${styles.credits} lb-sprite-sheet__credits`}>
                {
                    artists.map(([name, artist]: [string, any]) => (
                        <li className='lb-sprite-sheet__artist-credit' key={name}>
                            <div className={`${styles.artist} lb-sprite-sheet__artist-color`} style={{ backgroundColor: `var(--lb-artist-${name})` }}>
                            </div>
                            {artist.name}
                        </li>
                    ))
                }
            </ul>}
            {appendCredits ? appendCredits() : ''}
        </section>
    </div>);
}