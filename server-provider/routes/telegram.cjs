const { PROJECT } = require("../models/project.cjs");
const { USER } = require("../models/user.cjs");
const jwt = require("jsonwebtoken");
const crypto = require("node:crypto");

const BOT_TOKEN = process.env.PROVIDER_BOT;

async function telegram(req, res) {
	const projectId = req.params.projectId;
	const id = req.query.id;
	const first_name = req.query.first_name;
	const username = req.query.username;
	const photo_url = req.query.photo_url;
	const auth_date = req.query.auth_date;
	const hash = req.query.hash;

	const auth_data = {
		id,
		first_name,
		username,
		photo_url,
		auth_date,
	};

	const dataCheckArr = Object.keys(auth_data)
		.map((key) => `${key}=${auth_data[key]}`)
		.sort();

	const dataCheckString = dataCheckArr.join("\n");

	const secretKey = crypto.createHash("sha256").update(BOT_TOKEN).digest();
	const checkHash = crypto
		.createHmac("sha256", secretKey)
		.update(dataCheckString)
		.digest("hex");

	if (hash !== checkHash) {
		return res.status(403).json({
			message: "Data is NOT from Telegram",
		});
	}

	if (Date.now() / 1000 - auth_data.auth_date > 86400) {
		return res.status(403).json({
			message: "Data is outdated",
		});
	}

	const user = await USER.findOne({ tg_id: id });

	if (!user) {
		await USER.create({
			email: "",
			password: "",
			tg_id: id,
			tg_first_name: first_name,
			tg_username: username,
			tg_photo_url: photo_url,
			tg_auth_date: auth_date,
		});
	}

	const validated = await USER.findOne({ tg_id: id });

	const project = await PROJECT.findOne({ _id: projectId });

	const projectToken = jwt.sign(
		{
			sso_id: validated._id,
			first_name: validated.tg_first_name,
			photo: validated.tg_photo_url,
		},
		project.key
	);

	const token = jwt.sign({ id: validated._id.toString() }, "123");

	res.redirect(
		`${process.env.PROVIDER_CLIENT_DOMAIN_MAGIC}?token=${token}&projectToken=${projectToken}&redirectUrl=${project.redirectUrl}`
	);
}

module.exports = {
	telegram,
};
