// const router = require("express").Router();

// module.exports = router;

const router = require("express").Router();
const {
  getAllBlogs,
  getOneBlog,
  deleteBlog,
  createBlog,
  addComment,
  unSubscribe,
  subscribe,
  openaiComment,
  getTopStories
} = require("../controllers/blogsController");
const validateUser = require("../middlewares/validateUser");

router.get("/", getAllBlogs);
router.post("/", createBlog);
router.get("/:id", getOneBlog);
router.delete("/:id", validateUser, deleteBlog);
router.post("/:id", validateUser, addComment);
router.put("/unsubscribe/:id", validateUser, unSubscribe);
router.put("/subscribe/:id", validateUser, subscribe);
router.post("/comment/openai-comment", openaiComment);
router.get("/stories/:city", getTopStories);

module.exports = router;
