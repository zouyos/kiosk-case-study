import { useState } from "react";
import { IndicatorsAPI } from "./api/indicators";
import { type ResultType } from "./lib/types";
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
  const [timePeriod, setTimePeriod] = useState({ startDate: "", endDate: "" });
  const [results, setResults] = useState<ResultType[] | null>([]);

  const handleCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (urlIndicators.includes(value)) {
      setUrlIndicators(urlIndicators.filter((item) => item !== value));
    } else {
      setUrlIndicators([...urlIndicators, value]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === "startDate") {
      setTimePeriod({ ...timePeriod, startDate: e.target.value });
    }
    if (e.target.name === "endDate") {
      setTimePeriod({ ...timePeriod, endDate: e.target.value });
    }
  };

  const generateInfo = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (
        timePeriod &&
        urlIndicators.length > 0 &&
        timePeriod.startDate <= timePeriod.endDate
      ) {
        const results = await IndicatorsAPI.indicators(
          timePeriod.startDate,
          timePeriod.endDate,
          urlIndicators
        );
        setResults(results);
      } else {
        alert("Please provide correct information");
      }
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
      }
    }
  };

  return (
    <div
      className={`container-fluid bg-dark text-light ${style.mainContainer}`}
    >
      <h1 className='py-4 text-center'>Dashboard</h1>
      <hr className='pb-5' />
      <div className='d-flex justify-content-around row'>
        <div
          id='form'
          className='border border-2 border-primary p-3 rounded rounded-4 col-4'
          style={{ width: "fit-content" }}
        >
          <h5 className='text-center my-3'>
            Select time period and indicators
          </h5>
          <form onSubmit={(e) => generateInfo(e)}>
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
                        onChange={(e) => handleCheck(e)}
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
          className='bg-secondary col-6'
          style={{ height: "100%" }}
        >
          <h2 className='text-center'>Results:</h2>
          {results &&
            results.map((result) => {
              return (
                <Card
                  date={result.date}
                  dimension={result.dimension}
                  indicator={result.dimension}
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
