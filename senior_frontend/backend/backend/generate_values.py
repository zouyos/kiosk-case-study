"""
Generate toy data for the frontend case study
"""

from dataclasses import dataclass
from datetime import date
from itertools import product
import random
import sqlite3

random.seed = 1789

indicators = {
    "co2_emissions",
    "female_headcount",
    "male_headcount",
    "revenue",
}

countries = {
    "France",
    "Germany",
    "Spain",
}

business_units = {
    "HR",
    "IT",
    "Manufacturing",
    "Operations",
}

country_emissions_factor = {
    "France": 1,
    "Spain": 3,
    "Germany": 5,
}
business_unit_emissions_factor = {
    "HR": 0.01,
    "IT": 0.3,
    "Manufacturing": 0.9,
    "Operations": 0.4,
}


@dataclass
class State:
    business_unit: str
    country: str
    male_headcount: int
    female_headcount: int
    revenue: int = 0
    co2_emissions: int = 0

    def __post_init__(self):
        total_headcount = self.female_headcount + self.male_headcount
        revenue = int(
            sum((random.expovariate(1 / 5_000) for _ in range(total_headcount)))
        )
        co2 = int(
            revenue
            * (
                country_emissions_factor[self.country]
                + business_unit_emissions_factor[self.business_unit]
            )
        )
        self.revenue = revenue
        self.co2_emissions = co2

    def next_state(self):
        self.male_headcount = int(
            self.male_headcount
            + (1 if random.randint(0, 100) > 0.7 else -1) * random.expovariate(1 / 5)
        )
        self.female_headcount = int(
            self.female_headcount
            + (1 if random.randint(0, 100) > 0.7 else -1) * random.expovariate(1 / 5)
        )
        self.__post_init__()


start_date = date(2020, 1, 1)
end_date = date(2025, 1, 1)


def add_date(d: date, years: int = 0, months: int = 0) -> date:
    dy = years + (d.month + months) // 12

    return date(
        d.year + dy,
        (d.month + months - 1) % 12 + 1,
        d.day,
    )


def cleanup(db: sqlite3.Connection):
    db.execute("begin;")
    db.execute("drop table if exists indicators;")
    db.execute("drop table if exists dimensions;")
    db.execute("commit;")


def setup(db: sqlite3.Connection):
    db.execute("begin;")
    db.execute("pragma foreign_keys = true;")
    db.execute(
        r"""
    create table dimensions (
      id            text not null primary key,
      country       text not null,
      business_unit text not null,
      unique (country, business_unit)
    );
    """
    )
    db.execute(
        r"""
        create table indicators (
          date        text not null,
          dimension   text not null references dimensions(id),
          key         text not null,
          value       int  not null,
          primary key (date, dimension, key)
        );
        """
    )
    db.execute("commit;")


def main():
    dimensions = {
        (country, business_unit): i
        for i, (country, business_unit) in enumerate(product(countries, business_units))
    }
    with sqlite3.connect("kiosk.db") as connection:
        cleanup(connection)
        setup(connection)
        connection.executemany(
            "insert into dimensions (id, country, business_unit) values (?, ?, ?);",
            [
                (i, country, business_unit)
                for (country, business_unit), i in dimensions.items()
            ],
        )

        states = [
            State(
                business_unit=business_unit,
                country=country,
                female_headcount=int(random.uniform(10, 100)),
                male_headcount=int(random.uniform(10, 100)),
            )
            for country in countries
            for business_unit in business_units
        ]
        for dy in range((end_date - start_date).days // 365):
            for dm in range(12):
                t = add_date(start_date, years=dy, months=dm)
                for s in states:
                    s.next_state()
                connection.executemany(
                    r"""
                    insert into indicators
                                (date, dimension, key, value)
                         values (?, ?, ?, ?);
                    """,
                    [
                        (t, dimensions[(s.country, s.business_unit)], indicator, value)
                        for s in states
                        for (indicator, value) in (
                            ("co2_emissions", s.co2_emissions),
                            ("female_headcount", s.female_headcount),
                            ("male_headcount", s.male_headcount),
                            ("total_revenue", s.revenue),
                        )
                    ],
                )


if __name__ == "__main__":
    main()
