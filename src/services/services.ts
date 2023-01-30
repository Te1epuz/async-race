import { BASE_URL, CARS_PER_PAGE, WINNERS_PER_PAGE } from '../constances';
import { TWinner, TCar } from '../types/types';

export async function getWinner(id: number) {
  const response = await fetch(`${BASE_URL}/winners/${id}`);
  if (response.status === 200) {
    const data = (await response.json()) as TWinner;
    return data;
  }
  if (response.status === 404) {
    console.log('error 404 - no previous records in winners table on winning car');
  }
  return undefined;
}

async function fetchGetAllWinnersList() {
  const response = await fetch(`${BASE_URL}/winners?_page=1&_limit=999&_sort=id&_order=ASC`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const allWinnersData = (await response.json()) as TWinner[];
  return allWinnersData;
}

export async function createWinner(id: number, newTime: number) {
  const response: TWinner[] = await fetchGetAllWinnersList();
  const filteredResponse = response.filter((entry) => entry.id === id);
  if (filteredResponse.length === 0) {
    await fetch(`${BASE_URL}/winners`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id,
        wins: 1,
        time: newTime,
      }),
    });
  } else {
    const winnerData = await getWinner(id);
    if (winnerData) {
      await fetch(`${BASE_URL}/winners/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wins: winnerData.wins + 1,
          time: newTime < winnerData.time ? newTime : winnerData.time,
        }),
      });
    }
  }
}

export async function deleteWinner(id: number) {
  const response: TWinner[] = await fetchGetAllWinnersList();
  const filteredResponse = response.filter((entry) => entry.id === id);
  if (filteredResponse.length > 0) {
    await fetch(`${BASE_URL}/winners/${id}`, {
      method: 'DELETE',
    });
  }
}

export async function getCar(id: number) {
  const response = await fetch(`${BASE_URL}/garage/${id}`);
  const data = (await response.json()) as TCar;
  return data;
}

export async function fetchGetGarage(currentPage: number) {
  const response = await fetch(`${BASE_URL}/garage?_page=${currentPage}&_limit=${CARS_PER_PAGE}`);
  return response;
}

export async function fetchGetWinnersList(
  currentWinnersPage: number,
  sortWinnersBy: 'time' | 'wins' | 'id',
  sortWinnersDirection: 'ASC' | 'DESC',
) {
  const response = await fetch(
    // eslint-disable-next-line max-len
    `${BASE_URL}/winners?_page=${currentWinnersPage}&_limit=${WINNERS_PER_PAGE}&_sort=${sortWinnersBy}&_order=${sortWinnersDirection}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
  return response;
}

export async function fetchCreateNewCar(carName: string, carColor: string) {
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
  return response;
}

export async function fetchUpdateCar(id: number, editCarName: string, editCarColor: string) {
  await fetch(`${BASE_URL}/garage/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: editCarName === '' ? 'Unnamed car' : editCarName,
      color: editCarColor,
    }),
  });
}

export async function fetchSwitchToDrive(id: number) {
  const response = await fetch(`${BASE_URL}/engine?id=${id}&status=drive`, {
    method: 'PATCH',
  });
  return response;
}

export async function fetchHandleDeleteCar(id: number) {
  await fetch(`${BASE_URL}/garage/${id}`, {
    method: 'DELETE',
  });
}

export async function fetchHandleStartCar(id: number) {
  const response = await fetch(`${BASE_URL}/engine?id=${id}&status=started`, {
    method: 'PATCH',
  });
  return response;
}

export async function fetchHandleStopCar(id: number) {
  const response = await fetch(`${BASE_URL}/engine?id=${id}&status=stopped`, {
    method: 'PATCH',
  });
  return response;
}
