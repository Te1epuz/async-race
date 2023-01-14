import React, { useEffect, useState } from 'react';
import styles from './App.module.scss';

const BASE_URL = 'http://127.0.0.1:3000';

type TCars = {
  name: string;
  color: string;
  id: number;
}

function App() {
  const [garage, setGarage] = useState<TCars[]>([]);
  const [totalCars, setTotalCars] = useState('0');
  const [newCarName, setNewCarName] = useState('');
  const [newCarColor, setNewCarColor] = useState('#000000');
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
  }, [currentPage, totalCars]);

  async function createNewCar(carName = '', carColor = '') {
    await fetch(`${BASE_URL}/garage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: carName,
        color: carColor,
      }),
    });
  }

  function onSubmitCreateHandler(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    createNewCar(newCarName, newCarColor);
    getGarage();
  }

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
        <form>
          <input type="text" name="" id="" />
          <input type="color" name="" id="" />
          <button type="button">update</button>
        </form>
        <button type="button">race</button>
        <button type="button">reset</button>
        <button type="button">generate cars</button>

        <div>Race track</div>
        <div>Total cars from length: {garage.length}</div>
        <div>Total cars from header: {totalCars}</div>
        {garage.map((car) => (
          <>
            <div style={{ color: car.color }}>{car.id} {car.name} {car.color}</div>
            <button type="button">edit</button>
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
