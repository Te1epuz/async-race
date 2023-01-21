import React from 'react';
import styles from './Header.module.scss';

type TProps = {
  isGarageShown: boolean;
  setIsGarageShown: React.Dispatch<React.SetStateAction<boolean>>;
}

export function Header({ isGarageShown, setIsGarageShown } : TProps) {
  return (
    <header>
      <h1 className={styles.title}>Async Race</h1>
      <div className={styles.buttons}>
        <button
          className={`${styles.button} ${styles.button__left}`}
          type="button"
          onClick={() => setIsGarageShown(true)}
          disabled={isGarageShown}
        >Garage
        </button>
        <button
          className={`${styles.button} ${styles.button__right}`}
          type="button"
          onClick={() => setIsGarageShown(false)}
          disabled={!isGarageShown}
        >Winners
        </button>
      </div>
    </header>
  );
}
