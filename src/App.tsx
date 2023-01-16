import React, { useEffect, useState } from 'react';
import styles from './App.module.scss';

const BASE_URL = 'http://127.0.0.1:3000';

type TCar = {
  name: string;
  color: string;
  id: number;
}

type TCarsStatus = {
  [index: number]: string;
};

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

  async function getGarage() {
    const response = await fetch(`${BASE_URL}/garage?_page=${currentPage}&_limit=7`);
    const totalCarsInHeader = response.headers.get('X-Total-Count');
    if (totalCarsInHeader) setTotalCars(totalCarsInHeader);
    const data = await response.json();
    setGarage(data);
  }

  function handlePagination(page: number) {
    let newPage = page;
    if (newPage > Math.ceil(Number(totalCars)) / 7) newPage = Math.ceil(Number(totalCars) / 7);
    if (newPage < 1) newPage = 1;
    setCurrentPage(newPage);
  }

  // function handleClick(event: MouseEvent) {
  //   console.log(event.target);
  // }

  useEffect(() => {
    console.log('useEffect proc');
    // window.addEventListener('click', handleClick);
    handlePagination(currentPage);
    getGarage();
    setEditCarName('');
    setEditCar(undefined);
    // return () => {
    //   window.removeEventListener('click', handleClick);
    // };
  }, [currentPage, totalCars]);

  function generateRandomColor() {
    return Math.random().toString(16).slice(2, 8).toUpperCase();
  }

  async function createNewCar(carName: string, carColor: string) {
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
    setNewCarName('');
    setNewCarColor(`#${generateRandomColor()}`);
    setCarsStatus((prev) => ({ ...prev, [carData.id]: `${carData.id} status: engine off` }));
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

  async function handleDeleteCar(id: number) {
    await fetch(`${BASE_URL}/garage/${id}`, {
      method: 'DELETE',
    });
    await getGarage();
  }

  async function switchToDrive(id: number) {
    setCarsStatus((prev) => ({ ...prev, [id]: `${prev[id]} driving...` }));
    const response = await fetch(`${BASE_URL}/engine?id=${id}&status=drive`, {
      method: 'PATCH',
    });
    switch (response.status) {
      case 200:
        setCarsStatus((prev) => ({ ...prev, [id]: `${prev[id]} finished!` }));
        break;
      case 500:
        setCarsStatus((prev) => ({ ...prev, [id]: 'status: engine off!, car broken :(' }));
        break;
      default:
        console.log(response.statusText);
        break;
    }
  }

  async function handleStartCar(id: number) {
    const response = await fetch(`${BASE_URL}/engine?id=${id}&status=started`, {
      method: 'PATCH',
    });
    const carData = await response.json();
    setCarsStatus((prev) => ({ ...prev, [id]: `status: engine on, velocity: ${carData.velocity}` }));
    switchToDrive(id);
  }

  async function handleStartAllCars() {
    for (let id = 1; id <= Number(totalCars); id += 1) {
      handleStartCar(id);
    }
  }

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        Header
        <button type="button">to garage</button>
        <button type="button">to winners</button>
      </header>
      <div>
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
        <button type="button" onClick={() => handleStartAllCars()}>race</button>
        <button type="button">reset</button>
        <button type="button">generate cars</button>

        <div>Race track</div>
        <div>Total cars: {totalCars}</div>
        {garage.map((car) => (
          <div id={`car_id_${car.id}`}>
            <div>{car.id} {car.name} {car.color}</div>
            <div className={styles.car__img} style={{ backgroundColor: car.color }} />
            <button type="button" onClick={() => setEditCar(car)}>edit</button>
            <button type="button" onClick={() => handleDeleteCar(car.id)}>delete</button>
            <button type="button" onClick={() => handleStartCar(car.id)}>start</button>
            <button type="button">stop</button>
            <span id={`car_id_${car.id}_info`}>{
              carsStatus[car.id] ? carsStatus[car.id] : 'status: engine off'
            }
            </span>
          </div>
        ))}
        <div>pagination
          <button type="button" onClick={() => handlePagination(currentPage - 1)}> - </button>
          <span>{currentPage}</span>
          <button type="button" onClick={() => handlePagination(currentPage + 1)}> + </button>
        </div>
      </div>

      <div>Score tab</div>
    </div>
  );
}

export default App;
