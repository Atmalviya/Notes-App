const Note = require("../models/Notes");
const mongoose = require("mongoose");

exports.dashboard = async (req, res) => {
  let perPage = 12;
  let page = req.query.page || 1;

  const locals = {
    title: "Dashboard",
    description: "Free Nodejs Notes App",
  };

  try {
    const notes = await Note.aggregate([
      {
        $sort: {
          updatedAt: -1,
        },
      },
      {
        $match: { user: new mongoose.Types.ObjectId(req.user.id) },
      },
      {
        $project: {
          title: { $substr: ["$title", 0, 30] },
          description: { $substr: ["$description", 0, 200] },
        },
      },
    ])
      .skip(perPage * page - perPage)
      .limit(perPage)
      .exec();

    const count = await Note.countDocuments();

    res.render("dashboard/index", {
      userName: req.user.firstName,
      locals,
      notes,
      layout: "../views/layouts/dashboard.ejs",
      current: page,
      pages: Math.ceil(count / perPage),
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Server Error");
  }
};

exports.dashboardViewNote = async (req, res) => {
  const notes = await Note.findById({ _id: req.params.id })
    .where({ user: req.user.id })
    .lean();
  console.log(notes);
  if (notes) {
    res.render("dashboard/view-notes", {
      noteID: req.params.id,
      notes,
      layout: "../views/layouts/dashboard.ejs",
    });
  } else {
    res.send("something went wrong");
  }
};

/**
 * PUT
 * Update Note
 */

exports.dashboardUpdateNote = async (req, res) => {
  try {
    await Note.findByIdAndUpdate(
      { _id: req.params.id },
      {
        title: req.body.title,
        description: req.body.description,
        updatedAt: Date.now(),
      }
    ).where({ user: req.user.id });
    res.redirect("/dashboard");
  } catch (error) {
    console.log(error);
  }
};

/**
 * DELETE
 * Delete Note
 */
exports.dashboardDeleteNote = async (req, res) => {
  try {
    await Note.deleteOne({ _id: req.params.id }).where({ user: req.user.id });
    res.redirect("/dashboard");
  } catch (error) {
    console.log(error);
  }
};

/**
 * GET /
 * Add Note
 */
exports.dashboardAddNote = async (req, res) => {
  res.render("dashboard/add", {
    layout: "../views/layouts/dashboard.ejs",
  });
};

exports.dashboardAddNoteSubmit = async (req, res) => {
  try {
    // req.body.user = req.user.id;
    await Note.create({
      title: req.body.title,
      description: req.body.description,
      user: req.user.id,
    });
    res.redirect("/dashboard");
  } catch (err) {
    console.log(err);
  }
};

/**
 * GET /
 * search
 */

exports.dashboardSearch = async (req, res) => {
  try {
    res.render("dashboard/search", {
      searchResults,
      layout: "../views/layouts/dashboard.ejs",
    });
  } catch (error) {
    console.log(error);
  }
};

/**
 * POST /
 * search
 */

exports.dashboardSearchSubmit = async (req, res) => {
  try {
    let searchTerm = req.body.searchTerm;
    const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9 ]/g, "");
    const searchResults = await Note.find({
      $or: [
        { title: { $regex: new RegExp(searchNoSpecialChar, "i") } },
        { description: { $regex: new RegExp(searchNoSpecialChar, "i") } },
      ],
    }).where({ user: req.user.id });
    res.render("dashboard/search", {
      searchResults,
      layout: "../views/layouts/dashboard.ejs",
    });
  } catch (error) {
    console.log(error);
  }
};
