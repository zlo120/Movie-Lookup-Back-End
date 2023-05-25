var express = require('express');
var router = express.Router();

/* GET person data */
router.get('/search', function (req, res, next) {

    const title = req.query.title;
    const year = req.query.year;

    if (year < 1000 || year > 9999) {
        res.json({ error: true, message: "Invalid year format. Format must be yyyy." });
    }

    let page = req.query.page;

    if (page < 1) {
        return res.json({ Error: true, Message: "Query parameter year is wrong" });
    }

    if (page === undefined) {
        page = 1;
    } else {
        page = Number(page);
    }

    if (title !== undefined || year !== undefined) {

        if (title !== undefined && year === undefined) {
            return req.db
                .from("basics")
                .select("*")
                .whereRaw("`originalTitle` like '%" + title + "%'")
                .paginate({ perPage: 100, currentPage: page, isLengthAware: true })
                .then(paginatedData => {

                    let movieData = paginatedData.data.map(row => {

                        let imdbRating = row.imdbRating;
                        let rottenTomatoesRating = row.rottentomatoesRating;
                        let metaCriticRating = row.metacriticRating;

                        if (imdbRating !== null) {
                            imdbRating = Number(imdbRating);
                        }

                        if (rottenTomatoesRating !== null) {
                            rottenTomatoesRating = Number(rottenTomatoesRating);
                        }

                        if (metaCriticRating !== null) {
                            metaCriticRating = Number(metaCriticRating);
                        }

                        return {
                            title: row.primaryTitle,
                            year: row.year,
                            imdbID: row.tconst,
                            imdbRating: imdbRating,
                            rottenTomatoesRating: rottenTomatoesRating,
                            metacriticRating: metaCriticRating,
                            classification: row.rated
                        }
                    })

                    res.json({
                        data: movieData, pagination: paginatedData.pagination
                    });
                })
                .catch((err) => {
                    console.log(err);
                    res.json({ Error: true, Message: "Error in MySQL query" });
                });
        }

        if (title === undefined && year !== undefined) {
            return req.db
                .from("basics")
                .select("*")
                .whereRaw("`year` = " + year)
                .paginate({ perPage: 100, currentPage: page, isLengthAware: true })
                .then(paginatedData => {

                    let movieData = paginatedData.data.map(row => {

                        let imdbRating = row.imdbRating;
                        let rottenTomatoesRating = row.rottentomatoesRating;
                        let metaCriticRating = row.metacriticRating;

                        if (imdbRating !== null) {
                            imdbRating = Number(imdbRating);
                        }

                        if (rottenTomatoesRating !== null) {
                            rottenTomatoesRating = Number(rottenTomatoesRating);
                        }

                        if (metaCriticRating !== null) {
                            metaCriticRating = Number(metaCriticRating);
                        }

                        return {
                            title: row.primaryTitle,
                            year: row.year,
                            imdbID: row.tconst,
                            imdbRating: imdbRating,
                            rottenTomatoesRating: rottenTomatoesRating,
                            metacriticRating: metaCriticRating,
                            classification: row.rated
                        }
                    })

                    res.json({
                        data: movieData, pagination: paginatedData.pagination
                    });
                })
                .catch((err) => {
                    console.log(err);
                    res.json({ Error: true, Message: "Error in MySQL query" });
                });
        }

        if (title !== undefined && year !== undefined) {
            return req.db
                .from("basics")
                .select("*")
                .whereRaw("`originalTitle` like '%" + title + "%' AND `year` = " + year)
                .paginate({ perPage: 100, currentPage: page, isLengthAware: true })
                .then(paginatedData => {

                    let movieData = paginatedData.data.map(row => {

                        let imdbRating = row.imdbRating;
                        let rottenTomatoesRating = row.rottentomatoesRating;
                        let metaCriticRating = row.metacriticRating;

                        if (imdbRating !== null) {
                            imdbRating = Number(imdbRating);
                        }

                        if (rottenTomatoesRating !== null) {
                            rottenTomatoesRating = Number(rottenTomatoesRating);
                        }

                        if (metaCriticRating !== null) {
                            metaCriticRating = Number(metaCriticRating);
                        }

                        return {
                            title: row.primaryTitle,
                            year: row.year,
                            imdbID: row.tconst,
                            imdbRating: imdbRating,
                            rottenTomatoesRating: rottenTomatoesRating,
                            metacriticRating: metaCriticRating,
                            classification: row.rated
                        }
                    })

                    res.json({
                        data: movieData, pagination: paginatedData.pagination
                    });
                })
                .catch((err) => {
                    console.log(err);
                    res.json({ Error: true, Message: "Error in MySQL query" });
                });
        }
    }

    return req.db
        .from("basics")
        .select("*")
        .paginate({ perPage: 100, currentPage: page, isLengthAware: true })
        .then(paginatedData => {

            let movieData = paginatedData.data.map(row => {

                let imdbRating = row.imdbRating;
                let rottenTomatoesRating = row.rottentomatoesRating;
                let metaCriticRating = row.metacriticRating;

                if (imdbRating !== null) {
                    imdbRating = Number(imdbRating);
                }

                if (rottenTomatoesRating !== null) {
                    rottenTomatoesRating = Number(rottenTomatoesRating);
                }

                if (metaCriticRating !== null) {
                    metaCriticRating = Number(metaCriticRating);
                }

                return {
                    title: row.primaryTitle,
                    year: row.year,
                    imdbID: row.tconst,
                    imdbRating: imdbRating,
                    rottenTomatoesRating: rottenTomatoesRating,
                    metacriticRating: metaCriticRating,
                    classification: row.rated
                }
            })

            res.json({
                data: movieData, pagination: paginatedData.pagination
            });
        })
        .catch((err) => {
            res.json({ error: true, message: err.Message });
        });

});

router.get('/data/:imdbID', function (req, res, next) {
    const imdbID = req.params.imdbID;

    if (imdbID === "" || imdbID === undefined) {
        return res.json({ error: true, message: "Invalid query parameters: year. Query parameters are not permitted." });
    }

    if (req.query.year !== undefined) {
        return res.json({ error: true, message: "You must supply an imdbID!" });
    }

    return req.db
        .from("basics")
        .select("*")
        .where("tconst", imdbID)
        .then(result => {
            if (result[0] === undefined) {
                throw new Error("No record exists of a movie with this ID");
            }

            result = result[0];
            let genres = result.genres;

            if (genres !== undefined) {
                genres = genres.split(",")
            } else {
                genres = [];
            }

            return {
                title: result.primaryTitle,
                year: result.year,
                runtime: result.runtimeMinutes,
                genres: genres,
                country: result.country,
                principals: "test",
                ratings: "test",
                boxoffice: result.boxoffice,
                poster: result.poster,
                plot: result.plot
            };
        })
        .then(movie => {
            return req.db
                .from("principals")
                .select("*")
                .where("tconst", imdbID)
                .then(results => {

                    let principals = results.map(principal => {

                        let characters = principal.characters;

                        if (characters !== undefined && characters === "") {
                            characters = [];
                        }
                        else if (characters !== undefined) {
                            characters = JSON.parse(characters);
                        }

                        return {
                            id: principal.nconst,
                            category: principal.category,
                            name: principal.name,
                            characters: characters
                        }
                    })

                    movie.principals = principals;

                    return movie;
                })
        })
        .then(movie => {
            req.db
                .from("ratings")
                .select("*")
                .where("tconst", imdbID)
                .then(results => {

                    let ratings = results.map(rating => {
                        if (rating.source === "Internet Movie Database") {
                            return {
                                source: rating.source,
                                value: parseFloat(rating.value)
                            }
                        }

                        if (rating.source === "Rotten Tomatoes") {
                            return {
                                source: rating.source,
                                value: parseInt(rating.value)
                            }
                        }

                        if (rating.source === "Metacritic") {
                            return {
                                source: rating.source,
                                value: parseInt(rating.value)
                            }
                        }

                    })

                    movie.ratings = ratings;

                    res.json(movie);
                })
        })
        .catch((err) => {
            return res.json({ error: true, message: err.message });
        });
});

module.exports = router;