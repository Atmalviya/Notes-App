exports.homepage = async (req, res) => {
  const locals = {
    title: "Nodejs Notes App",
    description: "Free Nodejs Notes App",
  };
  res.render("index", { locals, layout: "../views/layouts/front-page.ejs" });
};

exports.about = async (req, res) => {
  const locals = {
    title: "About- Notes App",
    description: "Free Nodejs Notes App",
  };
  res.render("about", locals);
};
