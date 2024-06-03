type CardProps = {
  date: string;
  dimension: string;
  indicator: string;
  value: number;
};

const Card = ({ date, dimension, indicator, value }: CardProps) => {
  return (
    <div className='card-body'>
      <h5 className='card-title'>{date}</h5>
      <p className='card-text'>{dimension}</p>
      <p className='card-text'>{indicator}</p>
      <p className='card-text'>{value}</p>
    </div>
  );
};

export default Card;
