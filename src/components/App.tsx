import { useState } from 'react';
import { Winners } from './Winners/Winners';
import { Garage } from './Garage/Garage';
import styles from './App.module.scss';

function App() {
  const [totalCars, setTotalCars] = useState('0');
  const [isRaceAvailable, setIsRaceAvailable] = useState(true);
  const [isResetAvailable, setIsResetAvailable] = useState(false);
  const [totalWinners, setTotalWinners] = useState('0');
  const [isGarageShown, setIsGarageShown] = useState(true);

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        Header
        <button type="button" onClick={() => setIsGarageShown(true)}>to garage</button>
        <button type="button" onClick={() => setIsGarageShown(false)}>to winners</button>
      </header>
      <Garage
        isGarageShown={isGarageShown}
        totalCars={totalCars}
        setTotalCars={setTotalCars}
        setTotalWinners={setTotalWinners}
        isRaceAvailable={isRaceAvailable}
        setIsRaceAvailable={setIsRaceAvailable}
        isResetAvailable={isResetAvailable}
        setIsResetAvailable={setIsResetAvailable}
      />
      <Winners
        isGarageShown={isGarageShown}
        totalCars={totalCars}
        totalWinners={totalWinners}
        setTotalWinners={setTotalWinners}
        isRaceAvailable={isRaceAvailable}
        isResetAvailable={isResetAvailable}
      />
    </div>
  );
}

export default App;
