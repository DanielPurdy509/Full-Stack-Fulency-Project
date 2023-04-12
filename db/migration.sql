DROP TABLE IF EXISTS todo;

CREATE TABLE todo (
    id serial PRIMARY KEY,
    task varchar(25),
    start_date date,
    deadline date
);