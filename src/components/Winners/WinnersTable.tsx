import React, { useEffect, useState } from 'react';
import { getCar } from '../../services/services';
import { TCar, TWinner, TWinnersData } from '../../types/types';
import styles from './WinnersTable.module.scss';

type TProps = {
  winnersList: TWinner[];
  sortWinnersBy: 'time' | 'wins' | 'id';
  setSortWinnersBy: React.Dispatch<React.SetStateAction<'time' | 'wins' | 'id'>>;
  sortWinnersDirection: 'ASC' | 'DESC';
  setSortWinnersDirection: React.Dispatch<React.SetStateAction<'ASC' | 'DESC'>>;
}

export function WinnersTable({ winnersList, sortWinnersBy, setSortWinnersBy,
  sortWinnersDirection, setSortWinnersDirection }: TProps) {
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
  );
}
