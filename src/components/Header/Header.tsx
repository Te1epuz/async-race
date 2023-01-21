import React from 'react';
import styles from './Header.module.scss';

export function Header({ setIsGarageShown } :
  { setIsGarageShown: React.Dispatch<React.SetStateAction<boolean>> }) {
  return (
    <header className={styles.header}>
      <h1>Async Race</h1>
      <button type="button" onClick={() => setIsGarageShown(true)}>to garage</button>
      <button type="button" onClick={() => setIsGarageShown(false)}>to winners</button>
    </header>
  );
}
