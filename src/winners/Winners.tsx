import React, { useEffect, useState } from 'react';
import { getCar } from '../services';
import { TCar, TWinner } from '../types';
import styles from './Winners.module.scss';

type Tprops = {
  winnersList: TWinner[];
  totalWinners: string;
  sortWinnersBy: 'time' | 'wins' | 'id';
  setSortWinnersBy: React.Dispatch<React.SetStateAction<'time' | 'wins' | 'id'>>;
  sortWinnersDirection: 'ASC' | 'DESC';
  setSortWinnersDirection: React.Dispatch<React.SetStateAction<'ASC' | 'DESC'>>;
}

type TWinnersData = {
  [index: number]: {
    name: string;
    color: string;
  }
};

export function Winners({ winnersList, totalWinners, sortWinnersBy, setSortWinnersBy,
  sortWinnersDirection, setSortWinnersDirection }: Tprops) {
  const [carsData, setCarsData] = useState<TWinnersData>({});

  async function getCarData(id: number) {
    const data: TCar = await getCar(id);
    setCarsData((prev) => ({ ...prev,
      [id]: {
        name: data.name,
        color: data.color,
      } }));
  }

  function handleChangeSortBy(sortBy: 'time' | 'wins' | 'id') {
    if (sortWinnersBy !== sortBy) {
      setSortWinnersBy(sortBy);
      setSortWinnersDirection('ASC');
    } else if (sortBy === sortWinnersBy) {
      if (sortWinnersDirection === 'ASC') setSortWinnersDirection('DESC');
      else setSortWinnersDirection('ASC');
    }
  }

  useEffect(() => {
    winnersList.forEach((winner) => {
      getCarData(winner.id);
    });
  }, [winnersList]);

  return (
    <div>
      <div>Total winners: {totalWinners}</div>
      <table>
        <thead>
          <tr>
            <th
              onClick={() => handleChangeSortBy('id')}
            >#{sortWinnersBy === 'id' ? sortWinnersDirection === 'ASC' ? '▾' : '▴' : ''}
            </th>
            <th>Car</th>
            <th>Name</th>
            <th
              onClick={() => handleChangeSortBy('wins')}
            >Wins{sortWinnersBy === 'wins' ? sortWinnersDirection === 'ASC' ? '▾' : '▴' : ''}
            </th>
            <th
              onClick={() => handleChangeSortBy('time')}
            >Best time{sortWinnersBy === 'time' ? sortWinnersDirection === 'ASC' ? '▾' : '▴' : ''}
            </th>
          </tr>
        </thead>
        <tbody>
          {winnersList.length === 0 ? <tr><td colSpan={5}>No winners to display :(</td></tr> : ''}
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
