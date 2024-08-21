const { Router } = require("express");
const { PROJECT } = require("../models/project.cjs");
const crypto = require("node:crypto");
const ProjectRouter = Router();

ProjectRouter.post("/create", async (req, res) => {
	const project = await PROJECT.create({
		...req.body,
		ownerId: req.headers.user.id,
		key: crypto.randomUUID(),
	});

	res.json(project);
});

ProjectRouter.get("/:id", async (req, res) => {
	const project = await PROJECT.findOne({ _id: req.params.id });
	res.json(project);
});

module.exports = {
	ProjectRouter,
};
