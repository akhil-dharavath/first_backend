const router = require("express").Router();
const { register, login, getUserDetails, disableUser, enableUser, getAllUsers } = require("../controllers/userAuth");
const validateUser = require("../middlewares/validateUser");

router.post("/register", register);
router.post("/login", login);
router.get("/getuser", validateUser, getUserDetails);
router.get("/getall", validateUser, getAllUsers);
router.put("/disable",validateUser, disableUser);
router.put("/enable", validateUser, enableUser);

module.exports = router;
