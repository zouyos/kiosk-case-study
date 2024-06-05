import { useState } from "react";
import { IndicatorsAPI } from "./api/indicators";
import { TimePeriodType, type ResultType } from "./lib/types";
import style from "./style.module.css";
import Card from "./components/Card/Card";

const indicators = [
  "total_revenue",
  "co2_emissions",
  "male_headcount",
  "female_headcount",
];

const App = () => {
  const [urlIndicators, setUrlIndicators] = useState<string[]>(indicators);
  const [timePeriod, setTimePeriod] = useState<TimePeriodType>({});
  const [results, setResults] = useState<ResultType[]>([]);

  const handleCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (urlIndicators.includes(value)) {
      setUrlIndicators(urlIndicators.filter((item) => item !== value));
    } else {
      setUrlIndicators([...urlIndicators, value]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTimePeriod((prev) => ({ ...prev, [name]: value }));
  };

  const generateInfo = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (
        timePeriod.startDate &&
        timePeriod.endDate &&
        timePeriod.startDate <= timePeriod.endDate &&
        urlIndicators?.length > 0
      ) {
        const results = await IndicatorsAPI.indicators(
          timePeriod.startDate,
          timePeriod.endDate,
          urlIndicators
        );
        setResults(results);
      } else {
        alert("Please provide correct informations");
      }
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
      }
    }
  };

  console.log(urlIndicators);

  return (
    <div
      className={`container-fluid bg-dark text-light ${style.mainContainer}`}
    >
      <h1 className='py-4 text-center'>Dashboard</h1>
      <hr className='pb-5' />
      <div className='d-flex justify-content-around row'>
        <div
          id='form'
          className={`border border-2 border-primary p-3 rounded rounded-4 col-4 ${style.form}`}
        >
          <h5 className='text-center my-3'>
            Select time period and indicators
          </h5>
          <form onSubmit={generateInfo}>
            <div className='d-flex justify-content-center'>
              <div className='mx-5'>
                <label className='pb-2'>Start Date</label>
                <input
                  type='date'
                  name='startDate'
                  className='form-control'
                  value={timePeriod?.startDate}
                  onChange={handleChange}
                />
              </div>
              <div className='mx-5'>
                <label className='pb-2'>End Date</label>
                <input
                  type='date'
                  name='endDate'
                  className='form-control'
                  value={timePeriod?.endDate}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className='d-flex justify-content-center my-3'>
              <div>
                {indicators.map((indicator, i) => {
                  return (
                    <div className='form-check my-2' key={i}>
                      <input
                        className='form-check-input me-2'
                        type='checkbox'
                        name={indicator}
                        value={indicator}
                        onChange={handleCheck}
                        checked={urlIndicators.includes(indicator)}
                      />
                      <label className='form-check-label'>{indicator}</label>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className='d-flex justify-content-center'>
              <button type='submit' className='btn btn-light mb-3'>
                Generate info
              </button>
            </div>
          </form>
        </div>
        <div
          id='results'
          className={`bg-secondary col-6 d-flex flex-column align-items-center ${style.results}`}
        >
          <h2 className='text-center'>Results:</h2>
          {results &&
            results.map((result) => {
              return (
                <Card
                  date={result.date}
                  dimension={result.dimension}
                  indicator={result.indicator}
                  value={result.value}
                />
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default App;
