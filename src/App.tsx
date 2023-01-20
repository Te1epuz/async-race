import React, { useEffect, useState } from 'react';
import styles from './App.module.scss';
import { BASE_URL, CARS_PER_PAGE, WINNERS_PER_PAGE } from './constances';
import { TWinner } from './types';
import { createWinner, deleteWinner } from './services';
import { Winners } from './winners/Winners';

type TCar = {
  name: string;
  color: string;
  id: number;
}

type TCarsStatus = {
  [index: number]: {
    status: string;
    velocity: number;
  }
};

const carModels = [
  ['Tesla', 'BMW', 'Mercedes', 'Opel', 'Skoda', 'Audi', 'Crysler', 'Dodge', 'Ford', 'Ferrari',
    'Lamborghini', 'Peugeout', 'Fisker', 'Aston Martin', 'Lada'],
  ['Model S', 'Model E', 'Model X', 'Model Y', '230i', '540d', 'Corsa', 'Octavia', 'Fabia', 'Rapid',
    '300c', 'Viper', 'Mustang', 'Karma', 'Aventador']];

function generateRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

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
    const response = await fetch(`${BASE_URL}/garage?_page=${currentPage}&_limit=${CARS_PER_PAGE}`);
    const totalCarsInHeader = response.headers.get('X-Total-Count');
    if (totalCarsInHeader) setTotalCars(totalCarsInHeader);
    const data = await response.json();
    setGarage(data);
  }

  async function getWinnersList() {
    const response = await fetch(
      `${BASE_URL}/winners?_page=${currentWinnersPage}
        &_limit=${WINNERS_PER_PAGE} &_sort=${sortWinnersBy}&_order=${sortWinnersDirection}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    const totalWinnersInHeader = response.headers.get('X-Total-Count');
    if (totalWinnersInHeader) setTotalWinners(totalWinnersInHeader);
    const winnersData = await response.json();
    setWinnersList(winnersData);
  }

  function handlePagination(page: number) {
    let newPage = page;
    if (newPage > Math.ceil(Number(totalCars)) / CARS_PER_PAGE) newPage = Math.ceil(Number(totalCars) / CARS_PER_PAGE);
    if (newPage < 1) newPage = 1;
    setCurrentPage(newPage);
  }

  function handleWinnersPagination(page: number) {
    let newPage = page;
    if (newPage > Math.ceil(Number(totalWinners)) / WINNERS_PER_PAGE) {
      newPage = Math.ceil(Number(totalWinners) / WINNERS_PER_PAGE);
    }
    if (newPage < 1) newPage = 1;
    setCurrentWinnersPage(newPage);
  }

  useEffect(() => {
    handlePagination(currentPage);
    getGarage();
    getWinnersList();
    setEditCarName('');
    setEditCar(undefined);
  }, [currentPage, totalCars, currentWinnersPage, sortWinnersBy, sortWinnersDirection]);

  function generateRandomColor() {
    return Math.random().toString(16).slice(2, 8).toUpperCase();
  }

  async function createNewCar(carName: string, carColor: string) {
    setNewCarName('');
    setNewCarColor(`#${generateRandomColor()}`);
    const response = await fetch(`${BASE_URL}/garage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: carName === '' ? 'Unnamed car' : carName,
        color: carColor,
      }),
    });
    const carData = await response.json();
    setCarsStatus((prev) => ({ ...prev,
      [carData.id]: {
        status: `${carData.id} status: stopped!?`,
        velocity: 0,
      } }));
  }

  function onSubmitCreateHandler(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    createNewCar(newCarName, newCarColor);
    getGarage();
  }

  async function updateCar(car: TCar) {
    await fetch(`${BASE_URL}/garage/${car.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: editCarName === '' ? 'Unnamed car' : editCarName,
        color: editCarColor,
      }),
    });
    setEditCarName('');
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
    }
  }, [editCar]);

  async function handleGenerateCars(quantity: number) {
    for (let i = 1; i <= quantity; i += 1) {
      createNewCar(`${carModels[0][generateRandomInt(0, 14)]} ${carModels[1][generateRandomInt(0, 14)]}`,
        `#${generateRandomColor()}`);
    }
    await getGarage();
  }

  async function handleDeleteCar(id: number) {
    await fetch(`${BASE_URL}/garage/${id}`, {
      method: 'DELETE',
    });
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
    const response = await fetch(`${BASE_URL}/engine?id=${id}&status=drive`, {
      method: 'PATCH',
    });
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
    const response = await fetch(`${BASE_URL}/engine?id=${id}&status=started`, {
      method: 'PATCH',
    });
    const carData = await response.json();
    setCarsStatus((prev) => ({ ...prev,
      [id]: {
        status: `status: engine on, velocity: ${carData.velocity}`,
        velocity: carData.velocity,
      } }));
    await switchToDrive(id, carData.velocity, carName, carColor);
  }

  async function handleStopCar(id: number) {
    const response = await fetch(`${BASE_URL}/engine?id=${id}&status=stopped`, {
      method: 'PATCH',
    });
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
      <div hidden={isGarageShown}>Score tab
        <div>Winners pagination
          <button
            type="button"
            onClick={() => handleWinnersPagination(currentWinnersPage - 1)}
            disabled={!isRaceAvailable && !isResetAvailable}
          >-
          </button>
          <span>{currentWinnersPage}</span>
          <button
            type="button"
            onClick={() => handleWinnersPagination(currentWinnersPage + 1)}
            disabled={!isRaceAvailable && !isResetAvailable}
          >+
          </button>
        </div>
        <Winners
          winnersList={winnersList}
          totalWinners={totalWinners}
          sortWinnersBy={sortWinnersBy}
          setSortWinnersBy={setSortWinnersBy}
          sortWinnersDirection={sortWinnersDirection}
          setSortWinnersDirection={setSortWinnersDirection}
        />
      </div>
    </div>
  );
}

export default App;
