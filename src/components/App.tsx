import { useState } from 'react';
import { Header } from './Header/Header';
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
      <Header
        isGarageShown={isGarageShown}
        setIsGarageShown={setIsGarageShown}
      />
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
