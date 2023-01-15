import React, { useEffect, useState } from 'react';
import styles from './App.module.scss';

const BASE_URL = 'http://127.0.0.1:3000';

type TCar = {
  name: string;
  color: string;
  id: number;
}

function App() {
  const [garage, setGarage] = useState<TCar[]>([]);
  const [totalCars, setTotalCars] = useState('0');
  const [newCarName, setNewCarName] = useState('');
  const [newCarColor, setNewCarColor] = useState('#000000');
  const [editCar, setEditCar] = useState<TCar>();
  const [editCarName, setEditCarName] = useState('');
  const [editCarColor, setEditCarColor] = useState('#000000');
  const [currentPage, setCurrentPage] = useState(1);

  async function getGarage() {
    const response = await fetch(`${BASE_URL}/garage?_page=${currentPage}&_limit=7`);
    const totalCarsInHeader = response.headers.get('X-Total-Count');
    if (totalCarsInHeader) setTotalCars(totalCarsInHeader);
    const data = await response.json();
    setGarage(data);
  }

  function handlePagination(page: number) {
    let newPage = page;
    if (newPage < 1) newPage = 1;
    if (newPage > Math.ceil(Number(totalCars)) / 7) newPage = Math.ceil(Number(totalCars) / 7);
    setCurrentPage(newPage);
  }

  useEffect(() => {
    handlePagination(currentPage);
    getGarage();
    setEditCarName('');
    setEditCar(undefined);
  }, [currentPage, totalCars]);

  function generateRandomColor() {
    return Math.floor(Math.random() * 16777215).toString(16);
  }

  async function createNewCar(carName: string, carColor: string) {
    await fetch(`${BASE_URL}/garage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: carName === '' ? 'Unnamed car' : carName,
        color: carColor,
      }),
    });
    setNewCarName('');
    setNewCarColor(`#${generateRandomColor()}`);
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
    getGarage();
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
        <button type="button">race</button>
        <button type="button">reset</button>
        <button type="button">generate cars</button>

        <div>Race track</div>
        <div>Total cars: {totalCars}</div>
        {garage.map((car) => (
          <>
            <div>{car.id} {car.name} </div>
            <div className={styles.car} style={{ backgroundColor: car.color }} />
            <button type="button" onClick={() => setEditCar(car)}>edit</button>
            <button type="button" onClick={() => handleDeleteCar(car.id)}>delete</button>
          </>
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
