import { TWinner } from '../types';

type Tprops = {
  winnersList: TWinner[]
}

export function Winners({ winnersList }: Tprops) {
  return (
    <div>
      <div>winners table</div>
      {winnersList.map((winner: TWinner) => (
        <div key={winner.id}>{winner.id} {winner.time} {winner.wins}</div>
      ))}
    </div>
  );
}
