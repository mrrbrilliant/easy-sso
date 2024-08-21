const { Router } = require("express");
const { PROJECT } = require("../models/project.cjs");
const jwt = require("jsonwebtoken");

const AuthRouter = Router();

AuthRouter.post("/verify", async (req, res) => {
	let o = req.get("origin");
	console.log("origin", o);

	if (o !== process.env.PROVIDER_CLIENT_DOMAIN) {
		return res.status(403).end();
	}

	const { origin, verifyToken } = req.body;
	const project = await PROJECT.findOne({ origin });

	if (!project) {
		return res.status(403).json({ message: "unknow origin" });
	}

	try {
		const valid = jwt.verify(verifyToken, project.key);

		if (!valid) {
			return res.status(403).json({ message: "invalid verify token" });
		}

		res.json({ status: "Ok", projectId: project._id });
	} catch (error) {
		return res.status(403).json({ message: "invalid verify token" });
	}
});

module.exports = {
	AuthRouter,
};
