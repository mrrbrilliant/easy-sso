const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
	email: String,
	password: String,
	tg_id: String,
	tg_first_name: String,
	tg_username: String,
	tg_photo_url: String,
	tg_auth_date: String,
});

const USER = mongoose.model("users", UserSchema);

module.exports = {
	USER,
};
