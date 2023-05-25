var express = require('express');
var router = express.Router();

/* GET person data */
router.get('/search', function (req, res, next) {

    const title = req.query.title;
    const year = req.query.year;
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
                .paginate({ perPage: 100, currentPage: page })
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
                .select("tconst")
                .whereRaw("`year` = " + year)
                .paginate({ perPage: 100, currentPage: page })
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
                .paginate({ perPage: 100, currentPage: page })
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
        .paginate({ perPage: 100, currentPage: page })
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

});

router.get('/data/:imdbID', function (req, res, next) {
    const imdbID = req.params.imdbID;

    return req.db
        .from("basics")
        .select("*")
        .where("tconst", imdbID)
        .then(rows => {
            res.json({ Error: false, Message: "Success", Data: rows });
        })
        .catch((err) => {
            console.log(err);
            res.json({ Error: true, Message: "Error in MySQL query" });
        });
});

module.exports = router;