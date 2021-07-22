const config = require("../config");
const { Database } = require("quickmongo");
const db = new Database(config.Mongodb);
const DatabaseConnection = require("./utils/DatabaseConnection");
const express = require("express");
const app = express();
const url = require("url");
const path = require("path");
const passport = require("passport");
const session = require("express-session");
const Strategy = require("passport-discord").Strategy;
const ejs = require("ejs");
const bodyParser = require("body-parser");
const Discord = require("discord.js");
const client = new Discord.Client();
const MemoryStore = require("memorystore")(session);
const helmet = require("helmet");
const Ddos = require("ddos");
const randomString = require("randomstring");
const moment = require("moment");
moment.locale("tr");
const ddos = new Ddos({
  burst: 20,
  limit: 25,
  whitelist: ["46.221.150.65", "31.223.49.232"]
});
app.use(ddos.express);
app.use(express.static("public"));
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));
// 46.221.150.65
passport.use(
  new Strategy(
    {
      clientID: config.clientID,
      clientSecret: config.clientSecret,
      callbackURL: config.callbackUrl,
      scope: ["identify"]
    },
    (accessToken, refreshToken, profile, done) => {
      process.nextTick(() => done(null, profile));
    }
  )
);

app.use(
  session({
    store: new MemoryStore({ checkPeriod: 86400000 }),
    secret:
      "#@%#&^$^$%@$^$&%#$%@#$%$^%&$%^#$%@#$%#E%#%@$FEErfgr3g#%GT%536c53cc6%5%tv%4y4hrgrggrgrgf4n",
    cookie: {
      maxAge: 60000 * 60 * 24
    },
    saveUninitialized: false,
    resave: false,
    name: "discord.oauth2"
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.locals.domain = config.domain.split("//")[1];

app.engine("html", ejs.renderFile);
app.set("view engine", "html");
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
    limit: "50mb"
  })
);

const checkAuth = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  req.session.backURL = req.url;
  res.redirect("/auth/discord/login.aspx");
};

app.get(
  "/auth/discord/login.aspx",
  (req, res, next) => {
    if (req.session.backURL) {
      req.session.backURL = req.session.backURL;
    } else if (req.headers.referer) {
      const parsed = url.parse(req.headers.referer);
      if (parsed.hostname === app.locals.domain) {
        req.session.backURL = parsed.path;
      }
    } else {
      req.session.backURL = "/";
    }
    next();
  },
  passport.authenticate("discord")
);

app.get(
  "/auth/discord/callback.aspx",
  passport.authenticate("discord", { failureRedirect: "/" }),
  (req, res) => {
    if (req.session.backURL) {
      const url = req.session.backURL;
      req.session.backURL = null;
      res.redirect(url);
    } else {
      res.redirect("/");
    }
  }
);

//app.use(helmet());

app.get("/auth/discord/logout.aspx", function(req, res) {
  req.session.destroy(() => {
    req.logout();
    res.redirect("/");
  });
});

app.get("/", (req, res) => {
  res.status(200).render("index.ejs", {
    user: req.isAuthenticated() ? req.user : null,
    client,
    config
  });
});

app.get("/s.s.s", (req, res) => {
  res.status(200).render("s.s.s.ejs", {
    user: req.isAuthenticated() ? req.user : null,
    client,
    config
  });
});

app.get("/duyurular", async (req, res) => {
  res.status(200).render("duyurular.ejs", {
    user: req.isAuthenticated() ? req.user : null,
    client,
    config,
    data: (await db.get("duyurular")) || [],
    moment
  });
});

app.get("/kodlar", async (req, res) => {
  res.status(200).render("kodlar.ejs", {
    user: req.isAuthenticated() ? req.user : null,
    client,
    config
  });
});

app.get("/javascript", async (req, res) => {
  const all = (await db.all())
    .filter(x => x.ID.startsWith("JavaScriptCodes_"))
    .sort((x, y) => y.data.zaman - x.data.zaman);

  let array = [];

  for (var i in all) {
    const ıd = all[i].ID.split("_")[1];
    let getir = await db.get(`JavaScriptCodes_${ıd}`);
    let ab = await db.get(`JavaScriptCodesGörüntülenme_${ıd}`);
    let kalp = await db.get(`JavaScriptCodesKalp_${ıd}`);
    array.push({ codeData: getir, ID: ıd, görüntü: ab, kalp });
  }
  console.log(array);
  res.status(200).render("js.ejs", {
    user: req.isAuthenticated() ? req.user : null,
    client,
    config,
    array
  });
});

app.get("/codeCreate", checkAuth, async (req, res) => {
  if (!req.user) return res.redirect("/");
  if (!client.guilds.cache.get(config.guildID).members.cache.get(req.user.id))
    return res.redirect("/");
  if (
    !client.guilds.cache
      .get(config.guildID)
      .members.cache.get(req.user.id)
      .roles.cache.has(config.kodPaylasim)
  )
    return res.redirect("/");

  res.status(200).render("kodekle.ejs", {
    user: req.isAuthenticated() ? req.user : null,
    client,
    config
  });
  
});

app.post("/codeCreate", checkAuth, async (req, res) => {
  if (!req.user) return res.redirect("/");
  if (!client.guilds.cache.get(config.guildID).members.cache.get(req.user.id))
    return res.redirect("/");
  if (
    !client.guilds.cache
      .get(config.guildID)
      .members.cache.get(req.user.id)
      .roles.cache.has(config.kodPaylasim)
  )
    return res.redirect("/");
let random = randomString(40);
  let javascript = req.body.js;
  let python = req.body.py;
  let html = req.body.html;
  let altyapi = req.body.altyapi;
  let jsp = req.body.jsp;
  let booster = req.body.booster;
  let ekler = req.body.ekler;
  let commandsname = req.body.commandsname;
    let commands = req.body.commandsname;
  if(javascript) {
   await db.push(`JavaScriptCodes_${random}`, {}); 
    return res.send(`
    
    
    `);
  };



  
});

app.get("/sunucu", async (req, res) =>
  res.redirect("https://discord.gg/BDMkGUBJaz")
);

app.get("/youtube", async (req, res) =>
  res.redirect("https://www.youtube.com/channel/UC2O2gg__lm4H0mVV9MPWwhA")
);

app.listen(config.Port || process.env.PORT, async () => {
  await client.login(config.Token);
  DatabaseConnection.init(db);
});

/*BOT KISIM*/

client.on("message", async message => {
  if (!message.guild) return;
  if (message.author.bot) return;
  if (message.channel.id != "862826542387822643") return;
  let data = (await db.get("duyurular")) || [];
  db.push(`duyurular`, {
    zaman: Date.now(),
    message: message.content,
    author: message.author.id
  });
});

client.on("messageDelete", async message => {
  if (!message.guild) return;
  if (message.channel.id != "862826542387822643") return;
  let data = (await db.get("duyurular")) || [];
  let currentRank = data.find(r => r.message === message.content) || {};
  if (!currentRank) return;
  let porno = data.filter(r => r.message !== currentRank.message) || {};
  db.set(`duyurular`, porno);
});
