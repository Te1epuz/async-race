import { BASE_URL } from './constances';
import { TWinner, TCar } from './types';

export async function createWinner(id: number, winnersList: TWinner[]) {
  console.log('winner with id ', id, ' should be added');
  const winnerInList = winnersList.find((winner) => winner.id === id);
  if (!winnerInList) {
    await fetch(`${BASE_URL}/winners`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id,
        wins: 1,
        time: 10,
      }),
    });
  } else {
    await fetch(`${BASE_URL}/winners/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        wins: winnerInList.wins + 1,
        time: 10,
      }),
    });
  }
}

export async function getCar(id: number) {
  const response = await fetch(`${BASE_URL}/garage/${id}`);
  const data: TCar = await response.json();
  return data;
}

// export async function getWinnersList() {
//   const response = await fetch(`${BASE_URL}/winners?_page=1&_limit=10&_sort=time&_order='ASC`, {
//     method: 'GET',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//   });
//   const totalWinnersInHeader = response.headers.get('X-Total-Count') as string;
//   const winnersData = await response.json() as TWinner[];
//   return [winnersData, totalWinnersInHeader];
// }
