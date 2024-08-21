require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const { UserRouter } = require("./routes/users.cjs");
const { ProjectRouter } = require("./routes/projects.cjs");
const { AuthRouter } = require("./routes/auth.cjs");
const { USER } = require("./models/user.cjs");

const jwt = require("jsonwebtoken");
const { telegram } = require("./routes/telegram.cjs");

const io = new Server(server, {
	cors: {
		origin: "*",
	},
});

const mongoose = require("mongoose");
const { PROJECT } = require("./models/project.cjs");

function auth(req, res, next) {
	let token = req.headers.authorization;
	if (!token) {
		res.status(401).end();
	}

	try {
		const decoded = jwt.verify(token, "123");
		if (!decoded) {
			res.status(401).end();
		}
		req.headers["user"] = decoded;
		next();
	} catch (error) {
		res.status(401).end();
	}
}

async function main() {
	app.use(cors({ origin: "*" }));
	app.use(express.json());
	app.use(express.urlencoded({ extended: true }));
	app.use("/users", UserRouter);
	app.use("/me", auth, async (req, res) => {
		const user = await USER.findOne({ _id: req.headers.user.id });
		delete user["password"];

		res.json(user);
	});
	app.use("/projects", auth, ProjectRouter);
	app.use("/authorize", AuthRouter);
	app.get("/telegram/:projectId", telegram);
	app.get("/auto", async (req, res) => {
		const token = req.query.token;
		const projectId = req.query.projectId;
		const projectToken = req.query.projectToken;

		const valid_user = jwt.verify(token, process.env.PROVIDER_JWT);
		const project = await PROJECT.findOne({ _id: projectId });
		const valid_project = jwt.verify(projectToken, project.key);

		if (!valid_user || !valid_project) {
			res.status(422).end();
		}

		const user = await USER.findOne({ _id: valid_user.id });

		const newToken = jwt.sign(
			{
				sso_id: user._id,
				first_name: user.tg_first_name,
				photo: user.tg_photo_url,
			},
			project.key
		);
		res.redirect(`${project.redirectUrl}/?token=${newToken}`);
	});

	io.on("connection", (socket) => {
		console.log("a user connected");
	});

	https: await mongoose.connect(process.env.PROVIDER_DB);
	server.listen(process.env.PROVIDER_PORT, "0.0.0.0", () => {
		console.log("listening on *:3000");
	});
}

main().then(() => {});
process.on("uncaughtException", (e) => {
	console.log(e);
});
process.on("unhandledRejection", (e) => {
	console.log(e);
});
