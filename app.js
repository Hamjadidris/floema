require("dotenv").config();

const logger = require("morgan");
const express = require("express");
const errorHandler = require("errorhandler");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
// const find = require("lodash/find");

const path = require("path");
const app = express();
const port = 3200;

app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(methodOverride());
app.use(errorHandler());
app.use(express.static(path.join(__dirname, "public")));

const Prismic = require("@prismicio/client");
const PrismicDom = require("prismic-dom");
const UAParser = require("ua-parser-js");

const initApp = (req) => {
  const client = Prismic.createClient(process.env.PRISMIC_ENDPOINT, {
    accessToken: process.env.PRISMIC_ACCESS_TOKEN,
  });

  client.enableAutoPreviewsFromReq(req);
  return client;
};

const handleLinkResolver = (doc) => {
  if (doc.type === "product") {
    return `/detail/${doc.uid}`;
  }

  if (doc.type === "collections") {
    return "/collections";
  }

  if (doc.type === "about") {
    return "/about";
  }

  return "/";
};

app.use(errorHandler());

app.use((req, res, next) => {
  res.locals.ctx = {
    endpoint: process.env.PRISMIC_ENDPOINT,
    linkResolver: handleLinkResolver,
  };

  res.locals.Link = handleLinkResolver;

  res.locals.PrismicDom = PrismicDom;

  res.locals.Numbers = (index) => {
    return index == 0
      ? "One"
      : index == 1
      ? "Two"
      : index == 2
      ? "Three"
      : index == 3
      ? "Four"
      : "";
  };

  next();
});

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

const handleRequest = async (client) => {
  const about = await client.getSingle("about");
  const home = await client.getSingle("home");
  const meta = await client.getSingle("metadata");
  const navigation = await client.getSingle("navigation");
  const preloader = await client.getSingle("preloader");

  const collections = await client.getAllByType("collection", {
    fetchLinks: ["product.image", "product.model"],
  });

  // const productsData = await client.getAllByType("product", {
  //   fetchLinks: "collection.title",
  //   pageSize: 100,
  // });

  // const {
  //   data: { list: collectionsOrder },
  // } = await client.getSingle("collections");

  // const collections = collectionsOrder.map(({ collection }) => {
  //   const { uid } = collection;
  //   const data = find(collectionsData, { uid });

  //   return data;
  // });

  // const products = [];

  // collections.forEach((collection) => {
  //   collection.data.products.forEach(({ products_product: { uid } }) => {
  //     products.push(find(productsData, { uid }));
  //   });
  // });

  // const assets = [];

  // home.data.gallery.forEach((item) => {
  //   assets.push(item.image.url);
  // });

  // about.data.gallery.forEach((item) => {
  //   assets.push(item.image.url);
  // });

  // about.data.body.forEach((section) => {
  //   if (section.slice_type === "gallery") {
  //     section.items.forEach((item) => {
  //       assets.push(item.image.url);
  //     });
  //   }
  // });

  // collections.forEach((collection) => {
  //   collection.data.products.forEach((item) => {
  //     assets.push(item.products_product.data.image.url);
  //     assets.push(item.products_product.data.model.url);
  //   });
  // });

  return {
    about,
    home,
    meta,
    navigation,
    preloader,
    collections,
    // assets,
    // collections,
    // products,
  };
};

app.get("/", async (req, res) => {
  const client = initApp(req);
  const defaults = await handleRequest(client);

  res.render("pages/home", {
    ...defaults,
  });
});

app.get("/about", async (req, res) => {
  const client = initApp(req);
  const defaults = await handleRequest(client);

  res.render("pages/about", { ...defaults });
});

app.get("/detail/:uid", async (req, res) => {
  const uid = req.params.uid;

  const client = initApp(req);
  const defaults = await handleRequest(client);
  const product = await client.getByUID("product", uid, {
    fetchLinks: "collection.title",
  });

  res.render("pages/detail", { ...defaults, product });
});

app.get("/collections", async (req, res) => {
  const client = initApp(req);
  const defaults = await handleRequest(client);

  res.render("pages/collections", { ...defaults });
});

app.listen(port, () => {
  console.log("server started on " + port);
});
