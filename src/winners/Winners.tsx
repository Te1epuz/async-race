import { useEffect, useState } from 'react';
import { getCar } from '../services';
import { TCar, TWinner } from '../types';
import styles from './Winners.module.scss';

type Tprops = {
  winnersList: TWinner[]
}

type TWinnersData = {
  [index: number]: {
    name: string;
    color: string;
  }
};

export function Winners({ winnersList }: Tprops) {
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
      <div>winners table</div>
      {winnersList.map((winner: TWinner) => (
        <div key={winner.id}>
          <span>{winner.id} </span>
          <div className={styles.car__img} style={{ backgroundColor: carsData[winner.id]?.color }} />
          <span>{carsData[winner.id]?.name} </span>
          <span>{winner.wins}</span>
          <span>{winner.time} </span>
        </div>
      ))}
    </div>
  );
}
