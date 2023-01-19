import { useEffect, useState } from 'react';
import { getCar } from '../services';
import { TCar, TWinner } from '../types';
import styles from './Winners.module.scss';

type Tprops = {
  winnersList: TWinner[];
  totalWinners: string;
}

type TWinnersData = {
  [index: number]: {
    name: string;
    color: string;
  }
};

export function Winners({ winnersList, totalWinners }: Tprops) {
  const [carsData, setCarsData] = useState<TWinnersData>({});

  async function fetchCarData(id: number) {
    const data: TCar = await getCar(id);
    setCarsData((prev) => ({ ...prev,
      [id]: {
        name: data.name,
        color: data.color,
      } }));
  }

  useEffect(() => {
    winnersList.forEach((winner) => {
      fetchCarData(winner.id);
    });
  }, [winnersList]);

  return (
    <div>
      <div>Total winners: {totalWinners}</div>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Car</th>
            <th>Name</th>
            <th>Wins</th>
            <th>Best time</th>
          </tr>
        </thead>
        <tbody>
          {winnersList.map((winner: TWinner) => (
            <tr key={winner.id}>
              <td>{winner.id} </td>
              <td className={styles.car__img} style={{ backgroundColor: carsData[winner.id]?.color }} />
              <td>{carsData[winner.id]?.name} </td>
              <td>{winner.wins} </td>
              <td>{winner.time} </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
