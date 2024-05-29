import sqlite3
from datetime import date

from pydantic import BaseModel
from fastapi import Depends, FastAPI, HTTPException, Query

app = FastAPI()


def get_db():
    db = sqlite3.connect("backend/kiosk.db")

    db.execute("pragma journal_mode = WAL;")
    db.execute("pragma busy_timeout = 5000;")
    db.execute("pragma synchronous = NORMAL;")
    db.execute("pragma cache_size = 1000000000;")
    db.execute("pragma foreign_keys = true;")
    db.execute("pragma temp_store = memory;")

    try:
        yield db
    finally:
        db.close()


class Dimension(BaseModel):
    id: int
    business_unit: str
    country: str


class Indicator(BaseModel):
    date: date
    dimension: int
    key: str
    value: int


@app.get("/dimensions")
def list_dimensions(db=Depends(get_db)):
    results = db.execute("select id, country, business_unit from dimensions;")
    return {
        "results": [
            dict(zip(["id", "country", "business_unit"], result)) for result in results
        ]
    }


@app.get("/dimensions/{dimension_id}")
def get_dimension(dimension_id: int, db: sqlite3.Connection = Depends(get_db)):
    result = db.execute(
        "select id, country, business_unit from dimensions where id = ?;",
        (dimension_id,),
    ).fetchone()

    if not result:
        raise HTTPException(status_code=404, detail="Dimension not found")

    return {
        "result": dict(
            zip(
                ["id", "country", "business_unit"],
                result,
            )
        )
    }


supported_indicators = [
    "co2_emissions",
    "total_revenue",
    "female_headcount",
    "male_headcount",
]


def fetch_all_dimension_ids(db: sqlite3.Connection):
    return [result[0] for result in db.execute("select id from dimensions;").fetchall()]


@app.get("/indicators")
def get_indicator(
    start: date,
    end: date,
    dimensions: list[int] = Query(None),
    indicators: list[str] = Query(supported_indicators),
    db: sqlite3.Connection = Depends(get_db),
):
    unsupported_indicators = set(indicators) - set(supported_indicators)
    if unsupported_indicators:
        raise HTTPException(
            status_code=400, detail=f"Invalid indicators {unsupported_indicators}"
        )

    _dimensions = dimensions or fetch_all_dimension_ids(db)

    dimension_placeholders = ", ".join("?" for _ in _dimensions)
    key_placeholders = ", ".join("?" for _ in indicators)

    results = db.execute(
        f"""
        select date
               , dimension
               , key
               , value
          from indicators
         where date between ? and ?
           and dimension in ({dimension_placeholders})
           and key in ({key_placeholders});
        """,
        (start, end, *_dimensions, *indicators),
    ).fetchall()
    return {
        "results": [
            dict(zip(["date", "dimension", "indicator", "value"], i)) for i in results
        ]
    }
