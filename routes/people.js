var express = require('express');
var router = express.Router();
const jwt = require("jsonwebtoken");
const JWT_SECRET = "SJHSfsious8df7ShdsdhjasjkldSSAFuehtjknsdfm";

/* GET person data */
router.get('/:id', function (req, res, next) {

    const id = req.params.id;

    // check if user is authorized
    if (!("authorization" in req.headers)
        || !req.headers.authorization.match(/^Bearer /)
    ) {
        return res.status(401).json({ error: true, message: "Authorization header ('Bearer token') not found" });
    }

    const token = req.headers.authorization.replace(/^Bearer /, "");

    return jwt.verify(token, JWT_SECRET, function (err, decoded) {
        if (err) {
            req.db
                .from('tokens')
                .where('bearerToken', token)
                .then(response => {

                    // token doesn't exist in db
                    if (response[0] === undefined) {
                        return res.status(401).json({ error: true, message: "Invalid JWT token" });
                    }

                    // token has expired
                    return res.status(401).json({ error: true, message: "JWT token has expired" });
                });
        } else {
            // if user is authorized
            return req.db
                .from("names")
                .select("*")
                .where("nconst", "=", req.params.id)
                .then(rows => {

                    if (rows[0] === undefined) {
                        return res.status(404).json({
                            "error": true,
                            "message": "No record exists of a person with this ID"
                        });
                    }
                    const person = rows[0];

                    let response = {
                        name: person.primaryName,
                        birthYear: person.birthYear,
                        deathYear: person.deathYear
                    }

                    // res.json(response);
                    return response;
                })
                .then(response => {

                    let movies_list = [];
                    let movies_response_list = [];

                    req.db
                        .from('principals')
                        .select('*')
                        .where('nconst', id)
                        .then(movies => {
                            movies.forEach(movie => {
                                movies_list.push(movie);
                            })
                        })
                        .then(x => {

                            let where_clause = "";

                            let isFirst = true;

                            movies_list.forEach(movie => {
                                if (isFirst) {
                                    where_clause += 'tconst="' + movie.tconst + '"';
                                    isFirst = false;
                                } else {
                                    where_clause += 'OR tconst="' + movie.tconst + '"';
                                }

                                movies_response_list.push({
                                    movieId: movie.tconst,
                                    category: movie.category,
                                    characters: movie.characters
                                })
                            });


                            req.db
                                .from('basics')
                                .select("*")
                                .whereRaw(where_clause)
                                .then(movies_results => {

                                    let final_movies_list = [];

                                    movies_results.forEach(movie => {
                                        movies_response_list.forEach(movie_response => {
                                            if (movie.tconst === movie_response.movieId) {

                                                let characters = movie_response.characters;
                                                let characters_list = [];

                                                if (characters !== undefined && characters === "") {
                                                    characters_list = [];
                                                }
                                                else if (characters !== undefined) {

                                                    try {

                                                        characters_list = JSON.parse(characters);

                                                    }
                                                    catch (e) {
                                                        characters = characters.split(",")
                                                        characters.forEach(character => {
                                                            character = character.replace('["', '');
                                                            character = character.replace('"]', '');
                                                            character = character.replaceAll('"', '\"');
                                                            characters_list.push(character);
                                                        })
                                                    }
                                                }

                                                let imdbRating = movie.imdbRating;

                                                if (imdbRating !== null) {
                                                    imdbRating = parseFloat(imdbRating)
                                                }

                                                final_movies_list.push({
                                                    movieName: movie.primaryTitle,
                                                    movieId: movie_response.movieId,
                                                    category: movie_response.category,
                                                    characters: characters_list,
                                                    imdbRating: imdbRating
                                                });
                                            }
                                        });
                                    });

                                    return final_movies_list;
                                })
                                .then(final_movies_list => {
                                    response.roles = final_movies_list;

                                    return res.status(200).json(response);
                                })
                        })
                })
                .catch((err) => {
                    console.log(err);
                    res.json({ Error: true, Message: "Error in MySQL query" });
                });
        }
    });


});

module.exports = router;