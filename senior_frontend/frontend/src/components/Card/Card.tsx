type CardProps = {
  date: string;
  dimension: string;
  indicator: string;
  value: number;
};

const Card = ({ date, dimension, indicator, value }: CardProps) => {
  return (
    <div className='card my-3 border border-dark' style={{ width: "18rem" }}>
      <div className='card-body'>
        <h5 className='card-title'>{date}</h5>
        <p className='card-text'>{dimension}</p>
        <p className='card-text'>{indicator}</p>
        <p className='card-text'>{value}</p>
      </div>
    </div>
  );
};

export default Card;
