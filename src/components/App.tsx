import { useEffect, useState } from 'react';
import { WINNERS_PER_PAGE } from '../constances';
import { TWinner } from '../types/types';
import { fetchGetWinnersList } from '../services/services';
import { Winners } from './Winners/Winners';
import { Garage } from './Garage/Garage';
import styles from './App.module.scss';

function App() {
  const [totalCars, setTotalCars] = useState('0');
  const [currentPage, setCurrentPage] = useState(1);
  const [isRaceAvailable, setIsRaceAvailable] = useState(true);
  const [isResetAvailable, setIsResetAvailable] = useState(false);
  const [winnersList, setWinnersList] = useState<TWinner[]>([]);
  const [totalWinners, setTotalWinners] = useState('0');
  const [sortWinnersBy, setSortWinnersBy] = useState<'time' | 'wins' | 'id'>('time');
  const [sortWinnersDirection, setSortWinnersDirection] = useState<'ASC' | 'DESC'>('ASC');
  const [currentWinnersPage, setCurrentWinnersPage] = useState(1);
  const [isGarageShown, setIsGarageShown] = useState(true);

  async function getWinnersList() {
    const response = await fetchGetWinnersList(currentWinnersPage, sortWinnersBy, sortWinnersDirection);
    const totalWinnersInHeader = response.headers.get('X-Total-Count');
    if (totalWinnersInHeader) setTotalWinners(totalWinnersInHeader);
    const winnersData = await response.json();
    setWinnersList(winnersData);
  }

  function handleWinnersPagination(page: number) {
    let newPage = page;
    const availableMaxPages = Math.ceil(Number(totalWinners) / WINNERS_PER_PAGE);
    if (newPage > availableMaxPages) newPage = availableMaxPages;
    if (newPage < 1) newPage = 1;
    setCurrentWinnersPage(newPage);
  }

  useEffect(() => {
    handleWinnersPagination(currentWinnersPage);
    getWinnersList();
  }, [totalCars, totalWinners, currentWinnersPage, sortWinnersBy, sortWinnersDirection]);

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        Header
        <button type="button" onClick={() => setIsGarageShown(true)}>to garage</button>
        <button type="button" onClick={() => setIsGarageShown(false)}>to winners</button>
      </header>
      <Garage
        isGarageShown={isGarageShown}
        currentPage={currentPage}
        totalCars={totalCars}
        setTotalCars={setTotalCars}
        isRaceAvailable={isRaceAvailable}
        setIsRaceAvailable={setIsRaceAvailable}
        isResetAvailable={isResetAvailable}
        setIsResetAvailable={setIsResetAvailable}
        setTotalWinners={setTotalWinners}
        setCurrentPage={setCurrentPage}
      />
      <Winners
        isGarageShown={isGarageShown}
        setCurrentWinnersPage={setCurrentWinnersPage}
        totalWinners={totalWinners}
        currentWinnersPage={currentWinnersPage}
        isRaceAvailable={isRaceAvailable}
        isResetAvailable={isResetAvailable}
        winnersList={winnersList}
        sortWinnersBy={sortWinnersBy}
        setSortWinnersBy={setSortWinnersBy}
        sortWinnersDirection={sortWinnersDirection}
        setSortWinnersDirection={setSortWinnersDirection}
      />
    </div>
  );
}

export default App;
