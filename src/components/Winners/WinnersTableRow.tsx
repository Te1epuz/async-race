import { TWinner, TWinnersData } from '../../types/types';
import styles from './WinnersTableRow.module.scss';

type TProps = {
  winner: TWinner;
  carsData: TWinnersData;
}

export function WinnersTableRow({ winner, carsData }: TProps) {
  return (
    <tr key={winner.id}>
      <td>{winner.id} </td>
      <td className={styles.car__img} style={{ backgroundColor: carsData[winner.id]?.color }} />
      <td>{carsData[winner.id]?.name} </td>
      <td>{winner.wins} </td>
      <td>{winner.time} </td>
    </tr>
  );
}
