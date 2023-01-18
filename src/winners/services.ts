import { TWinner } from '../types';
import { BASE_URL } from '../constances';

export async function createWinner(id: number) {
  // get winner previous data
  console.log('winner with id ', id, ' should be added');
}

export async function getWinners() {
  const response = await fetch(`${BASE_URL}/winners?_page=1&_limit=10_sort=time_order=ASC`);
  const data: TWinner[] = await response.json();
  return data;
}
