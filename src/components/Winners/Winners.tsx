import React from 'react';
import { WINNERS_PER_PAGE } from '../../constances';
import { TWinner } from '../../types/types';
import { WinnersTable } from './WinnersTable';

type Tprops = {
  isGarageShown: boolean;
  setCurrentWinnersPage: React .Dispatch<React.SetStateAction<number>>;
  totalWinners: string;
  currentWinnersPage: number;
  isRaceAvailable: boolean;
  isResetAvailable: boolean;
  winnersList: TWinner [];
  sortWinnersBy: 'time' | 'wins' | 'id';
  setSortWinnersBy: React.Dispatch<React.SetStateAction<'time' | 'wins' | 'id'>>;
  sortWinnersDirection: 'ASC' | 'DESC';
  setSortWinnersDirection: React.Dispatch<React.SetStateAction<'ASC' | 'DESC'>>;
}

export function Winners({ isGarageShown, setCurrentWinnersPage, totalWinners, currentWinnersPage, isRaceAvailable,
  isResetAvailable, winnersList, sortWinnersBy, setSortWinnersBy, sortWinnersDirection, setSortWinnersDirection,
}: Tprops) {
  function handleWinnersPagination(page: number) {
    let newPage = page;
    const availableMaxPages = Math.ceil(Number(totalWinners) / WINNERS_PER_PAGE);
    if (newPage > availableMaxPages) newPage = availableMaxPages;
    if (newPage < 1) newPage = 1;
    setCurrentWinnersPage(newPage);
  }

  return (
    <div hidden={isGarageShown}>Winners
      <div>pagination
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
      <div>Total winners: {totalWinners}</div>
      <WinnersTable
        winnersList={winnersList}
        sortWinnersBy={sortWinnersBy}
        setSortWinnersBy={setSortWinnersBy}
        sortWinnersDirection={sortWinnersDirection}
        setSortWinnersDirection={setSortWinnersDirection}
      />
    </div>
  );
}
