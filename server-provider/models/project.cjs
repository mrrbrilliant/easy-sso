const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema({
	name: String,
	key: String,
	ownerId: String,
	origin: String,
	redirectUrl: String,
});

const PROJECT = mongoose.model("projects", ProjectSchema);

module.exports = {
	PROJECT,
};
