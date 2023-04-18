const express = require("express")
const path = require("path")
const hbs = require('express-handlebars');
const app = express()
const PORT = 3000;
const bodyParser = require("body-parser")
app.use(bodyParser.urlencoded({ extended: true })); 

const Datastore = require('nedb')

const coll = new Datastore({
    filename: 'database.db',
    autoload: true
});


app.use(express.static('static'))
app.set('views', path.join(__dirname, 'views'));         // ustalamy katalog views
app.engine('hbs', hbs({ defaultLayout: 'main.hbs' }));   // domyślny layout, potem można go zmienić
app.set('view engine', 'hbs');      
app.listen(PORT, function () {
    console.log("start serwera na porcie " + PORT )
})


 app.get("/", function (req, res) {
    res.render('cars.hbs');   // nie podajemy ścieżki tylko nazwę pliku
})
app.get("/add", function (req, res) {
  
        const id = req.query.id
        const context = id? {id: id} : {}
        console.log(context.id)
        res.render('add.hbs', context)
})

app.get("/edit", function (req, res) {
    coll.find({ },  (err, docs) => {
       let context = {cars:docs}
       if(req.query.id) {
            for (let doc of context['cars']) {
                if ( doc._id == req.query.id) {
                    doc.selected = true
                    break;
                }
            }
        }
    res.render('edit.hbs', context);
    });
})



app.post("/update", function (req, res) {
    res.header("content-type","application/json")
   console.log("id")
    coll.update({ _id: req.body.id}, { $set: req.body }, {}, function (err, numUpdated) {
        console.log("zaktualizowano " + numUpdated)
     })
     res.redirect("/list") 

})

app.get("/handleAdd", function (req, res) {
    const q = req.query

    const doc = {
        demaged:q.demaged ? "TAK" : "NIE",
        gasoline:q.gasoline ? "TAK" : "NIE",
        drive4x4:q.drive4x4 ? "TAK" : "NIE",
        polisy:q.poli ? "TAK" : "NIE",


    }

    coll.insert(doc, function (err, newDoc) {

        res.redirect("/add/?id=" + newDoc._id) 

    });
    // nie podajemy ścieżki tylko nazwę pliku
})
app.get("/list", function (req, res) {
     coll.find({ },  (err, docs) => {
    
        let context = {cars:Object.assign({}, docs)}
        if(req.query.id) {
            for (let doc of context['cars']) {
                if (doc.id == req.query.id) {
                    doc.selected = true
                    break;
                }
            }
        }
    res.render('list.hbs', context);
    });
    app.get("/delete/:id", function (req, res) {
        coll.remove({ _id:req.params.id }, { multi: false }, function (err, numRemoved) {
            console.log("usunięto dokumentów: ",numRemoved)
        });
        res.redirect("/list")   // nie podajemy ścieżki tylko nazwę pliku
    })

})