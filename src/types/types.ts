export type TWinner = {
  id: number;
  wins: number;
  time: number;
}

export type TCar = {
  name: string;
  color: string;
  id: number;
}

export type TCarsStatus = {
  [index: number]: {
    status: string;
    velocity: number;
  }
};

export type TWinnersData = {
  [index: number]: {
    name: string;
    color: string;
  }
};
