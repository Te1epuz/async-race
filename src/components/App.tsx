import React, { useEffect, useState } from 'react';
import styles from './App.module.scss';
import { CARS_PER_PAGE, CAR_MODELS, WINNERS_PER_PAGE } from '../constances';
import { TCar, TCarsStatus, TWinner } from '../types/types';
import { createWinner, deleteWinner, fetchCreateNewCar, fetchGetGarage, fetchGetWinnersList, fetchHandleDeleteCar,
  fetchHandleStartCar, fetchHandleStopCar, fetchSwitchToDrive, fetchUpdateCar } from '../services/services';
import { generateRandomColor, generateRandomInt } from '../utilites/utilites';
import { Winners } from './Winners/Winners';

const winnerCarData = {
  id: 0,
  name: '',
  color: '',
  time: 0,
};

let isRaceActive = false;

function App() {
  const [garage, setGarage] = useState<TCar[]>([]);
  const [totalCars, setTotalCars] = useState('0');
  const [newCarName, setNewCarName] = useState('');
  const [newCarColor, setNewCarColor] = useState('#000000');
  const [editCar, setEditCar] = useState<TCar>();
  const [editCarName, setEditCarName] = useState('');
  const [editCarColor, setEditCarColor] = useState('#000000');
  const [currentPage, setCurrentPage] = useState(1);
  const [carsStatus, setCarsStatus] = useState<TCarsStatus>({});
  const [isRaceAvailable, setIsRaceAvailable] = useState(true);
  const [isResetAvailable, setIsResetAvailable] = useState(false);
  const [winnersList, setWinnersList] = useState<TWinner[]>([]);
  const [totalWinners, setTotalWinners] = useState('0');
  const [sortWinnersBy, setSortWinnersBy] = useState<'time' | 'wins' | 'id'>('time');
  const [sortWinnersDirection, setSortWinnersDirection] = useState<'ASC' | 'DESC'>('ASC');
  const [isWinnerPopUpActive, setIsWinnerPopUpActive] = useState(false);
  const [currentWinnersPage, setCurrentWinnersPage] = useState(1);
  const [isGarageShown, setIsGarageShown] = useState(true);

  async function getGarage() {
    const response = await fetchGetGarage(currentPage);
    const totalCarsInHeader = response.headers.get('X-Total-Count');
    if (totalCarsInHeader) setTotalCars(totalCarsInHeader);
    const data = await response.json();
    setGarage(data);
  }

  async function getWinnersList() {
    const response = await fetchGetWinnersList(currentWinnersPage, sortWinnersBy, sortWinnersDirection);
    const totalWinnersInHeader = response.headers.get('X-Total-Count');
    if (totalWinnersInHeader) setTotalWinners(totalWinnersInHeader);
    const winnersData = await response.json();
    setWinnersList(winnersData);
  }

  function handlePagination(page: number) {
    let newPage = page;
    const availableMaxPages = Math.ceil(Number(totalCars) / CARS_PER_PAGE);
    if (newPage > availableMaxPages) newPage = availableMaxPages;
    if (newPage < 1) newPage = 1;
    setCurrentPage(newPage);
  }

  function handleWinnersPagination(page: number) {
    let newPage = page;
    const availableMaxPages = Math.ceil(Number(totalWinners) / WINNERS_PER_PAGE);
    if (newPage > availableMaxPages) newPage = availableMaxPages;
    if (newPage < 1) newPage = 1;
    setCurrentWinnersPage(newPage);
  }

  useEffect(() => {
    handlePagination(currentPage);
    handleWinnersPagination(currentWinnersPage);
    getGarage();
    getWinnersList();
    setEditCarName('');
    setEditCar(undefined);
  }, [currentPage, totalCars, totalWinners, currentWinnersPage, sortWinnersBy, sortWinnersDirection]);

  async function createNewCar(carName: string, carColor: string) {
    setNewCarName('');
    setNewCarColor(generateRandomColor());
    const response = await fetchCreateNewCar(carName, carColor);
    const carData = await response.json();
    setCarsStatus((prev) => ({ ...prev,
      [carData.id]: {
        status: `${carData.id} status: stopped!?`,
        velocity: 0,
      } }));
  }

  async function onSubmitCreateHandler(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await createNewCar(newCarName, newCarColor);
    getGarage();
  }

  async function updateCar(car: TCar) {
    await fetchUpdateCar(car.id, editCarName, editCarColor);
    setEditCarName('');
    document.getElementById('editname__input')?.blur();
    setEditCar(undefined);
  }

  function onSubmitUpdateHandler(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (editCar) {
      updateCar(editCar);
    }
    getGarage();
  }

  useEffect(() => {
    if (editCar) {
      setEditCarName(editCar.name);
      setEditCarColor(editCar.color);
      document.getElementById('editname__input')?.focus();
    }
  }, [editCar]);

  async function handleGenerateCars(quantity: number) {
    for (let i = 1; i <= quantity; i += 1) {
      createNewCar(`${CAR_MODELS[0][generateRandomInt(0, 14)]} ${CAR_MODELS[1][generateRandomInt(0, 14)]}`,
        generateRandomColor());
    }
    await getGarage();
  }

  async function handleDeleteCar(id: number) {
    await fetchHandleDeleteCar(id);
    await deleteWinner(id);
    await getGarage();
    await getWinnersList();
  }

  async function switchToDrive(id: number, velocity: number, carName: string, carColor: string) {
    setCarsStatus((prev) => ({ ...prev,
      [id]: {
        status: `${prev[id].status} driving...`,
        velocity: prev[id].velocity,
      } }));
    const response = await fetchSwitchToDrive(id);
    switch (response.status) {
      case 200:
        setCarsStatus((prev) => ({ ...prev,
          [id]: {
            status: `${prev[id].status} finished!`,
            velocity: prev[id].velocity,
          } }));
        if (winnerCarData.id === 0 && isRaceActive === true) {
          isRaceActive = false;
          winnerCarData.id = id;
          winnerCarData.name = carName;
          winnerCarData.color = carColor;
          winnerCarData.time = Math.round((500 / velocity) * 100) / 100;
          setIsWinnerPopUpActive(true);
          await createWinner(id, winnerCarData.time);
          getWinnersList();
          setIsResetAvailable(true);
        }
        break;
      case 500:
        setCarsStatus((prev) => ({ ...prev,
          [id]: {
            status: `${prev[id].status}, car broken :(`,
            velocity: prev[id].velocity,
          } }));
        break;
      default:
        console.log(response.statusText);
        break;
    }
  }

  async function handleStartCar(id: number, carName: string, carColor: string) {
    const response = await fetchHandleStartCar(id);
    const carData = await response.json();
    setCarsStatus((prev) => ({ ...prev,
      [id]: {
        status: `status: engine on, velocity: ${carData.velocity}`,
        velocity: carData.velocity,
      } }));
    await switchToDrive(id, carData.velocity, carName, carColor);
  }

  async function handleStopCar(id: number) {
    const response = await fetchHandleStopCar(id);
    const carData = await response.json();
    setCarsStatus((prev) => ({ ...prev,
      [id]: {
        status: prev[id] ? `status: engine off, velocity: ${carData.velocity}, stopped!` : 'stopped!!',
        velocity: 0,
      } }));
  }

  async function handleStartAllCars() {
    setIsRaceAvailable(false);
    isRaceActive = true;
    await Promise.all(garage.map((car) =>
      !carsStatus[car.id]?.status.includes('driving') ? handleStartCar(car.id, car.name, car.color) : ''));
    setIsRaceAvailable((prev) => {
      if (prev === false) setIsResetAvailable(true);
      return prev;
    });
  }

  async function handleStopAllCars() {
    setIsResetAvailable(false);
    setIsWinnerPopUpActive(false);
    await Promise.all(garage.map((car) => handleStopCar(car.id)));
    setIsRaceAvailable(true);
    winnerCarData.id = 0;
    winnerCarData.name = '';
    winnerCarData.color = '';
    isRaceActive = false;
  }

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        Header
        <button type="button" onClick={() => setIsGarageShown(true)}>to garage</button>
        <button type="button" onClick={() => setIsGarageShown(false)}>to winners</button>
      </header>
      <div className={!isGarageShown ? styles.hidden : ''}>
        Garage
        <form onSubmit={onSubmitCreateHandler}>
          <input
            placeholder="enter new car name"
            value={newCarName}
            onChange={(event) => setNewCarName(event.target.value)}
          />
          <input
            type="color"
            value={newCarColor}
            onChange={(event) => setNewCarColor(event.target.value)}
          />
          <button type="submit">create</button>
        </form>
        <form onSubmit={onSubmitUpdateHandler}>
          <input
            id="editname__input"
            placeholder=""
            value={editCarName}
            onChange={(event) => setEditCarName(event.target.value)}
          />
          <input
            type="color"
            value={editCarColor}
            onChange={(event) => setEditCarColor(event.target.value)}
          />
          <button type="submit">update</button>
        </form>
        <button type="button" onClick={() => handleStartAllCars()} disabled={!isRaceAvailable}>race</button>
        <button type="button" onClick={() => handleStopAllCars()} disabled={!isResetAvailable}>reset</button>
        <button type="button" onClick={() => handleGenerateCars(10)}>generate cars 10</button>
        <button type="button" onClick={() => handleGenerateCars(100)}>generate cars 100</button>

        <div>Race track</div>
        <div>Total cars: {totalCars}</div>
        <div>pagination
          <button
            type="button"
            onClick={() => {
              handlePagination(currentPage - 1);
              handleStopAllCars();
            }}
            disabled={!isRaceAvailable && !isResetAvailable}
          >-
          </button>
          <span>{currentPage}</span>
          <button
            type="button"
            onClick={() => {
              handlePagination(currentPage + 1);
              handleStopAllCars();
            }}
            disabled={!isRaceAvailable && !isResetAvailable}
          >+
          </button>
        </div>
        {garage.map((car) => (
          <div id={`car_id_${car.id}`} key={car.id}>
            <div>{car.id} {car.name} {car.color}</div>
            <div
              className={`${styles.car__img} ${carsStatus[car.id] && carsStatus[car.id].status.includes('driving') ?
                carsStatus[car.id].status.includes('broken') ? styles.car__img_broken : styles.car__img_drive
                : ''
              }`}
              style={carsStatus[car.id] ?
                {
                  backgroundColor: car.color,
                  animationDuration: `${(carsStatus[car.id].velocity > 0 ?
                    (500 / carsStatus[car.id].velocity) : 0)}s`,
                }
                : {
                  backgroundColor: car.color,
                }}
            />
            <button type="button" onClick={() => setEditCar(car)}>edit</button>
            <button type="button" onClick={() => handleDeleteCar(car.id)}>delete</button>
            <button
              type="button"
              onClick={() => {
                setIsResetAvailable(true);
                setIsRaceAvailable(false);
                handleStartCar(car.id, car.name, car.color);
              }}
              disabled={(!!carsStatus[car.id] && carsStatus[car.id].status.includes('driving'))}
            >start
            </button>
            <button
              type="button"
              onClick={() => handleStopCar(car.id)}
              disabled={(!carsStatus[car.id] || carsStatus[car.id].status.includes('stopped'))}
            >stop
            </button>
            <span id={`car_id_${car.id}_info`}>{
              carsStatus[car.id] ? carsStatus[car.id].status : 'status: parked '
            }
            </span>
          </div>
        ))}
        <div hidden={!isWinnerPopUpActive}>Winner Pop Up
          <div>{winnerCarData.id} {winnerCarData.name} {winnerCarData.color}</div>
          <button type="button" onClick={() => handleStopAllCars()} disabled={!isResetAvailable}>reset</button>
        </div>
      </div>
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
