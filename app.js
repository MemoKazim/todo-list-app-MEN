//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.set("strictQuery", true);
mongoose.connect(
  "mongodb+srv://memo:AA1253765@tododatabase.wl539w0.mongodb.net/todoDB"
);

// DATABASE STUFF START

const itemsSchema = new mongoose.Schema({
  name: String,
});
const specialSchema = mongoose.Schema({
  name: String,
  items: [itemsSchema],
});

const Item = mongoose.model("Item", itemsSchema);
const SpecialItem = mongoose.model("SpecialItem", specialSchema);

const default1 = new Item({
  name: "Welcome to to do list online.",
});

const default2 = new Item({
  name: "Press + to add new task.",
});

const default3 = new Item({
  name: "<-- if you done task. Enjoy :)",
});

// DATABASE STUFF ENDS

app.get("/", function (req, res) {
  Item.find({}, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      if (result.length === 0) {
        Item.insertMany([default1, default2, default3], (err) => {
          if (err) {
            console.log(err);
          } else {
            console.log(
              "Default items in default route successfully added to DB"
            );
          }
        });
      }
      res.render("list", { listTitle: "Today", newListItems: result });
    }
  });
});

app.post("/", function (req, res) {
  const itemName = req.body.newItem; // Istifadecinin daxil etdiyi item adi
  const listName = req.body.list; // Istifadecinin xususi listi URLden olan
  const newItem = new Item({ name: itemName }); // Yeni bir item yaratma cehdi
  if (listName === "Today") {
    newItem.save();
    res.redirect("/");
  } else {
    SpecialItem.findOne({ name: listName }, (err, result) => {
      if (err) {
        console.log(err);
      } else {
        result.items.push(newItem);
        result.save();
        res.redirect(`/${listName}`);
      }
    });
  }
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.get("/:specialRoute", (req, res) => {
  const specialRoute = req.params.specialRoute;

  SpecialItem.findOne({ name: specialRoute }, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      if (!result) {
        const specialItem = new SpecialItem({
          name: specialRoute,
          items: [default1, default2, default3],
        });
        specialItem.save();
        res.redirect(`/${specialRoute}`);
      } else {
        res.render("list", {
          listTitle: result.name,
          newListItems: result.items,
        });
      }
    }
  });
});

app.post("/delete", (req, res) => {
  const deleteItemId = req.body.checkbox;
  const listName = req.body.routeName;
  if (listName === "Today") {
    Item.findByIdAndRemove(deleteItemId, (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log("Item succesfully deleted!");
      }
    });
    res.redirect("/");
  } else {
    SpecialItem.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: deleteItemId } } },
      (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log("Special item deleted :)");
          res.redirect(`/${listName}`);
        }
      }
    );
  }
});

app.listen(port, function () {
  console.log(`Server started on port ${port}`);
});
