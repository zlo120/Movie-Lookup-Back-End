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
        page = 0;
    } else {
        page = (page - 1) * 100;
    }

    if (title !== undefined || year !== undefined) {

        if (title !== undefined && year === undefined) {
            console.log("title not undefined and year undefined")
            return req.db
                .from("basics")
                .select("*")
                .whereRaw("`originalTitle` like '%" + title + "%'")
                .limit(100)
                .offset(page)
                .then(rows => {
                    res.json({ Error: false, Message: "Success", Data: rows });
                })
                .catch((err) => {
                    console.log(err);
                    res.json({ Error: true, Message: "Error in MySQL query" });
                });
        }

        if (title === undefined && year !== undefined) {
            console.log("title undefined and year not undefined")
            return req.db
                .from("basics")
                .select("*")
                .whereRaw("`year` = " + year)
                .limit(100)
                .offset(page)
                .then(rows => {
                    res.json({ Error: false, Message: "Success", Data: rows });
                })
                .catch((err) => {
                    console.log(err);
                    res.json({ Error: true, Message: "Error in MySQL query" });
                });
        }

        if (title !== undefined && year !== undefined) {
            console.log("title not undefined and year not undefined")
            return req.db
                .from("basics")
                .select("*")
                .whereRaw("`originalTitle` like '%" + title + "%' AND `year` = " + year)
                .limit(100)
                .offset(page)
                .then(rows => {
                    res.json({ Error: false, Message: "Success", Data: rows });
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
        .limit(100)
        .offset(page)
        .then(rows => {
            res.json({ Error: false, Message: "Success", Data: rows });
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