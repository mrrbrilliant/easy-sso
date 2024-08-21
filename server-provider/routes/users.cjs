const { Router } = require("express");
const { USER } = require("../models/user.cjs");
const jwt = require("jsonwebtoken");

const UserRouter = Router();

UserRouter.post("/sign-up", async (req, res) => {
	const user = req.body;
	const created = await USER.create(user);
	const token = jwt.sign(
		{ id: created._id.toString() },
		process.env.PROVIDER_JWT
	);

	res.json({ token });
});

UserRouter.post("/login", async (req, res) => {
	const user = req.body;
	const exists = await USER.findOne({ email: user.email });

	if (!exists) {
		return res.status(400).json({
			status: "error",
			message: "Invalid email",
		});
	}

	if (exists && exists.password !== user.password) {
		return res.status(400).json({
			status: "error",
			message: "Invalid password",
		});
	}

	const token = jwt.sign(
		{ id: exists._id.toString() },
		process.env.PROVIDER_JWT
	);
	res.json({ token });
});

module.exports = { UserRouter };
