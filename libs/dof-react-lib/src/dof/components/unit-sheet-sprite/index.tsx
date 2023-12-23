import { ReactNode } from "react";
import { IRenderItem } from "./../../models/spritesheet.interfaces";
import styles from './index.module.scss';

export function UnitSheetSprite({ type, characterDef, expanded, artistConfig, onExpand, onCharacterClick, appendTooltip }: {
    type: string, characterDef: IRenderItem, artistConfig: any, expanded?: boolean, onExpand?: () => void,
    onCharacterClick?: () => void,
    appendTooltip?: (item: IRenderItem, labelClass: string) => ReactNode
}) {
    const artistConfiguration = artistConfig ?? {};
    return (<div className={`${styles.wrapper} lb-unit-sheet-sprite`}>
        <div className={`
            ${styles.name} 
            ${characterDef.displayName ? '' : styles.default}
            ${styles[type]}
            lb-unit-sheet-sprite__name-field
            `}>
            <button className={`${styles.tooltip} lb-unit-sheet-sprite__show-credit-tooltip`}>
                <div className={`${styles.data} lb-unit-sheet-sprite__credit-tooltip`}>
                    <div className={`${styles.label} lb-unit-sheet-sprite__tooltip-label`}>Artists:</div>
                    <ul className='lb-unit-sheet-sprite__sprite-artist-list'>
                        {characterDef.artists.map(artist => (
                            // @ts-ignore
                            <li className='lb-unit-sheet-sprite__sprite-artist' key={artist}>{artistConfiguration[artist]?.name ?? artist}</li>
                        ))}
                    </ul>
                    {appendTooltip ? appendTooltip(characterDef, `${styles.label} lb-unit-sheet-sprite__tooltip-label`) : ''}
                </div>
                {
                    artistConfig ? characterDef.artists.map(artist => (
                        <div key={artist} className={`${styles.artist} lb-unit-sheet-sprite__credit`} style={{ backgroundColor: `var(--lb-artist-${artist})` }}></div>
                    )) : <div className={`${styles.artist} lb-unit-sheet-sprite__credit`} style={{ backgroundColor: `#fff` }}></div>
                }
            </button>
            { // @ts-ignore
                (characterDef.conditional && characterDef.conditional[type]?.displayName) ? characterDef.conditional[type].displayName : (characterDef.displayName || characterDef.name)
            }
            {
                (onExpand ? <button className={`${styles.alts} lb-unit-sheet-sprite__toggle-alts`} onClick={onExpand}>{
                    expanded ? '-' : '+'
                }</button> : '')
            }
        </div>
        <div className={styles.sprite}>
            {
                (() => {
                    const sprite = <img className="pixel-art lb-unit-sheet-sprite__image" id={`${characterDef.name}_${type}`} src={characterDef.path} />


                    if (onCharacterClick) {
                        return <button className={`${styles.characterButton} lb-unit-sheet-sprite__character-button`} onClick={onCharacterClick}>{sprite}</button>
                    } else {
                        return sprite;
                    }
                })()
            }
        </div>
    </div>);
}
