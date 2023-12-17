import styles from './index.module.scss'
export function OptionSelector({ options, selection, onSelect }: {
    options: string[] | { value: string, label: string }[],
    selection: string,
    onSelect: (value: any) => void
}) {
    return <div className={`lb-option-selector ${styles.base}`}>
        {
            options.map(option => {
                let value: string;
                let label: string;
                if (typeof option === 'string') {
                    value = option;
                    label = option;
                } else {
                    value = option.value;
                    label = option.label;
                }
                return <button
                    className={`lb-option-selector__option ${styles.option} ${selection === value ? `${styles.selected} lb-option-selector__option--selected` : ''}`}
                    key={value}
                    onClick={() => { onSelect(option) }}
                >
                    {label}
                </button>
            })
        }
    </div>
}