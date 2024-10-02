import { ReactNode, useState } from "react";
import styles from './index.module.scss';
import { Overlay } from "../overlay";
import { Toggle } from "../toggle";

let offset = { left: 0, top: 0 };
let isDragging = false;
let cachedState: any = {
    enableCompareMode: false,
    dragStateStyle: {},
    state: null,
    resetState: false
};

export function CharacterOverlay(
    {
        clear,
        allowComparisonmode,
        renderSideProfile,
        renderTabs,
        renderContent,
        initialState,
        validViews,
        uiIcons,
        extraStateData
    }: {
        clear: () => void,
        allowComparisonmode?: boolean,
        renderSideProfile: (extraData?: any) => ReactNode,
        renderTabs: (state: string, onClick: (s: string) => void, extraData?: any) => ReactNode,
        renderContent: (state: string, setExtraData: (extraData: any) => void) => ReactNode
        initialState: string,
        validViews?: Set<string>,
        uiIcons?: {
            dragDrop?: () => ReactNode,
            exit: () => ReactNode,
        },
        extraStateData?: any
    }) {

    cachedState.state = cachedState.state ?? initialState;
    cachedState.extraData = cachedState.extraData ?? extraStateData ?? {};

    if (cachedState.resetState) {
        cachedState.state = initialState;
        cachedState.resetState = false;
    } else if (validViews && !validViews.has(cachedState.state)) {
        cachedState.state = initialState;
    }

    const allowCompare = allowComparisonmode ?? true;

    const [widgetState, setWidgetState] = useState(cachedState);

    function setWidgetStateCaching(widgetStateData: any) {
        cachedState = widgetStateData;
        setWidgetState(cachedState);
    }

    function setComparisonMode(value: boolean) {
        offset = { left: 0, top: 0 };
        setWidgetStateCaching({ ...widgetState, enableCompareMode: value, dragStateStyle: {} });
    }

    function clearItem() {
        clear();
        offset = { left: 0, top: 0 };
        setWidgetStateCaching({ ...widgetState, enableCompareMode: false, dragStateStyle: {}, resetState: true });
    }

    function mouseDown() {
        isDragging = true;
        window.addEventListener('mousemove', dragging);
        window.addEventListener('mouseup', mouseUp);
    }

    function mouseUp() {
        isDragging = false;
        window.removeEventListener('mousemove', dragging);
        window.removeEventListener('mouseup', mouseUp);
    }

    function dragging(event: MouseEvent) {
        if (isDragging) {
            offset.left += event.movementX;
            offset.top += event.movementY;
            setWidgetStateCaching({ ...widgetState, enableCompareMode: true, dragStateStyle: { transform: `translateX(calc(${offset.left}px - 50%)) translateY(calc(${offset.top}px - 50%))` } })
        }
    }

    return <>
        {widgetState.enableCompareMode ? '' : <Overlay onClick={clearItem} />}
        <div className={styles.characterOverlay} style={widgetState.dragStateStyle}>
            <div className={styles.controls}>
                {widgetState.enableCompareMode ? <button className={`${styles.controlButton}`} onMouseDown={mouseDown}>
                    {uiIcons?.dragDrop ? uiIcons.dragDrop() : 'Drag'}
                </button> : ''}

                <button className={`${styles.controlButton}`} onClick={clearItem}>
                    {uiIcons?.exit ? uiIcons.exit() : 'X'}
                </button>
            </div>
            <div className={styles.content}>
                {renderSideProfile(widgetState.extraData)}
                <div className={styles.data}>
                    {renderTabs(widgetState.state, (selectedState: string) => { setWidgetStateCaching({ ...widgetState, state: selectedState }) })}
                    <div className={styles.dataContent}>
                        {
                            renderContent(widgetState.state, (extraData) => {
                                // defer 1 loop
                                setTimeout(()=>setWidgetStateCaching({ ...widgetState, extraData: { ...widgetState.extraData, ...extraData } }),0);
                            })
                        }
                    </div>
                </div>
            </div>
            {allowCompare ? <div className={styles.footer}>
                {
                    <div className={styles.footerItem}>
                        <label>Toggle Comparison Mode</label><Toggle active={widgetState.enableCompareMode} onStateChange={setComparisonMode} />
                    </div>
                }
            </div> : ''}
        </div>
    </>
}