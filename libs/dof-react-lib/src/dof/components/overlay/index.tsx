import styles from './index.module.scss';
export function Overlay({ onClick }: { onClick?: () => void }) {
    return <div className={styles.overlay} onClick={onClick}></div>
}