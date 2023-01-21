import React, { useEffect, useState } from 'react';
import { CARS_PER_PAGE, CAR_MODELS } from '../../constances';
import { createWinner, deleteWinner, fetchCreateNewCar, fetchGetGarage, fetchHandleDeleteCar, fetchHandleStartCar,
  fetchHandleStopCar, fetchSwitchToDrive, fetchUpdateCar } from '../../services/services';
import { TCar, TCarsStatus } from '../../types/types';
import { generateRandomColor, generateRandomInt, getAvailableMaxPages } from '../../utilites/utilites';
import styles from './Garage.module.scss';

const winnerCarData = {
  id: 0,
  name: '',
  color: '',
  time: 0,
};

let isRaceActive = false;

type TProps = {
  isGarageShown: boolean;
  totalCars: string;
  setTotalCars: React.Dispatch<React.SetStateAction<string>>;
  isRaceAvailable: boolean;
  setIsRaceAvailable: React.Dispatch<React.SetStateAction<boolean>>;
  isResetAvailable: boolean;
  setIsResetAvailable: React.Dispatch<React.SetStateAction<boolean>>;
  setTotalWinners: React.Dispatch<React.SetStateAction<string>>;
}

export function Garage({ isGarageShown, totalCars, setTotalCars, isRaceAvailable, setIsRaceAvailable,
  isResetAvailable, setIsResetAvailable, setTotalWinners }: TProps) {
  const [garage, setGarage] = useState<TCar[]>([]);
  const [carsStatus, setCarsStatus] = useState<TCarsStatus>({});
  const [newCarName, setNewCarName] = useState('');
  const [newCarColor, setNewCarColor] = useState('#000000');
  const [editCar, setEditCar] = useState<TCar>();
  const [editCarName, setEditCarName] = useState('');
  const [editCarColor, setEditCarColor] = useState('#000000');
  const [currentPage, setCurrentPage] = useState(1);
  const [isWinnerPopUpActive, setIsWinnerPopUpActive] = useState(false);

  async function getGarage() {
    const response = await fetchGetGarage(currentPage);
    const totalCarsInHeader = response.headers.get('X-Total-Count');
    if (totalCarsInHeader) setTotalCars(totalCarsInHeader);
    const data = await response.json();
    setGarage(data);
  }

  function handlePagination(page: number) {
    let newPage = page;
    const availableMaxPages = getAvailableMaxPages(totalCars, CARS_PER_PAGE);
    if (newPage > availableMaxPages) newPage = availableMaxPages;
    if (newPage < 1) newPage = 1;
    setCurrentPage(newPage);
  }

  useEffect(() => {
    handlePagination(currentPage);
    getGarage();
  }, [currentPage, totalCars]);

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
          setTotalWinners((prev) => `${Number(prev) + 1}`);
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
    <div className={`${styles.wrapper} ${!isGarageShown ? styles.hidden : ''}`}>
      <h2 className={styles.title}>Garage <span className={styles.title__span}>(total cars: {totalCars})</span></h2>
      <div className={styles.control_panel}>
        <div>
          <form className={styles.form} onSubmit={onSubmitCreateHandler}>
            <input
              className={styles.input__text}
              placeholder="Enter new car name"
              value={newCarName}
              onChange={(event) => setNewCarName(event.target.value)}
            />
            <input
              className={styles.input__color}
              type="color"
              value={newCarColor}
              onChange={(event) => setNewCarColor(event.target.value)}
            />
            <button type="submit" className={styles.input__button}>Create car</button>
          </form>
          <form className={styles.form} onSubmit={onSubmitUpdateHandler}>
            <input
              className={styles.input__text}
              id="editname__input"
              placeholder=""
              value={editCarName}
              onChange={(event) => setEditCarName(event.target.value)}
              disabled={!editCar}
            />
            <input
              className={styles.input__color}
              type="color"
              value={editCarColor}
              onChange={(event) => setEditCarColor(event.target.value)}
              disabled={!editCar}
            />
            <button type="submit" className={styles.input__button} disabled={!editCar}>Update car</button>
          </form>
          <button type="button" onClick={() => handleGenerateCars(10)} className={styles.generate__btnLeft}>
            generate 10 cars
          </button>
          <button type="button" onClick={() => handleGenerateCars(100)} className={styles.generate__btnRight}>
            generate 100 cars
          </button>
        </div>
        <div className={styles.control_race}>
          <button
            className={styles.race__button}
            type="button"
            onClick={() => handleStartAllCars()}
            disabled={!isRaceAvailable}
          >race
          </button>
          <button
            className={styles.reset__button}
            type="button"
            onClick={() => handleStopAllCars()}
            disabled={!isResetAvailable}
          >reset
          </button>
        </div>
      </div>

      {garage.map((car) => (
        <div id={`car_id_${car.id}`} key={car.id} className={styles.car__block}>
          <div className={styles.car__title}>
            <div>{car.id} {car.name}</div>
            <button type="button" onClick={() => setEditCar(car)} className={styles.btn__edit}>✎</button>
            <button type="button" onClick={() => handleDeleteCar(car.id)} className={styles.btn__delete}>✘</button>
          </div>
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
          {/* <span id={`car_id_${car.id}_info`}>{
            carsStatus[car.id] ? carsStatus[car.id].status : 'status: parked '
          }
          </span> */}
        </div>
      ))}
      <div className={styles.pagination}>
        <button
          className={`${styles.pagination__button} ${styles.pagination__left}`}
          type="button"
          onClick={() => {
            handlePagination(currentPage - 1);
            handleStopAllCars();
          }}
          disabled={(!isRaceAvailable && !isResetAvailable) || currentPage === 1}
        >-
        </button>
        <div className={styles.pagination__number}>{currentPage}</div>
        <button
          className={`${styles.pagination__button} ${styles.pagination__right}`}
          type="button"
          onClick={() => {
            handlePagination(currentPage + 1);
            handleStopAllCars();
          }}
          disabled={(!isRaceAvailable && !isResetAvailable) ||
            currentPage === getAvailableMaxPages(totalCars, CARS_PER_PAGE)}
        >+
        </button>
      </div>
      <div className={styles.popup} hidden={!isWinnerPopUpActive}>
        <div className={styles.popup__text}>
          {winnerCarData.name} finished 1st in {winnerCarData.time}s !!!
        </div>
        <div className={styles.popup__img} style={{ backgroundColor: winnerCarData.color }} />
        <button
          className={styles.popup__button}
          type="button"
          onClick={() => handleStopAllCars()}
          disabled={!isResetAvailable}
        >reset
        </button>
      </div>
    </div>
  );
}
