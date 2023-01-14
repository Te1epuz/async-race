import React from 'react';
import styles from './App.module.scss';

function App() {
  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        Header
        <button type="button">to garage</button>
        <button type="button">to winners</button>
      </header>
      <div>
        Garage
      </div>
    </div>
  );
}

export default App;
