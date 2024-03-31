const Blog = require("../models/blogsModel");
const User = require("../models/userModel");
const mongoose = require("mongoose");
const openai = require("../config/openai");
const axios = require("axios");

const getAllBlogs = async (req, res) => {
  // get all blogs
  const blogs = await Blog.find({});
  res.json(blogs);
};

const getOneBlog = async (req, res) => {
  if (!req.params.id) {
    res.status(400).json({ message: "Troble finding blog" });
  }
  // get one blog from id
  const blog = await Blog.findById(req.params.id);
  res.json(blog);
};

const createBlog = async (req, res) => {
  const {
    title,
    description,
    cover,
    authorName,
    createdAt,
    category,
    authorAvatar,
  } = req.body;
  if ((!title, !description, !cover, !authorName, !createdAt, !category)) {
    res.status(404).json({ message: "Please enter required fields" });
  }
  const blog = await Blog.create({
    title,
    description,
    cover,
    authorName,
    createdAt,
    category,
  });
  res.status(201).json(blog);
};

const deleteBlog = async (req, res) => {
  if (!req.params.id) {
    res.status(400).json({ message: "Troble finding blog" });
  }
  // check whether the user is logged in
  if (!req.user.id || req.user.role !== "Moderator") {
    res.status(401).json({ message: "You are not authorized" });
  }
  // delete blog
  const blog = await Blog.findByIdAndDelete(req.params.id);
  res.json(blog);
};

const addComment = async (req, res) => {
  if (!req.params.id) {
    res.status(400).json({ message: "Troble finding blog" });
  }
  // check whether the user is logged in
  if (!req.user.id) {
    res.status(401).json({ message: "You are not authorized" });
  }
  if (!req.body.comment) {
    res.status(404).json({ message: "Comment cannot be empyty" });
  }
  // find blog
  const getBlog = await Blog.findById(req.params.id);
  if (!getBlog) {
    res.status(400).json({ message: "Troble finding blog" });
  }

  // Add Comment
  const blog = await Blog.findByIdAndUpdate(
    req.params.id,
    {
      comments: [
        ...getBlog.comments,
        { user: req.user.id, comment: req.body.comment },
      ],
    },
    { new: true }
  );
  res.json(blog);
};

const unSubscribe = async (req, res) => {
  if (!req.params.id) {
    res.status(400).json({ message: "Troble finding blog" });
  }
  // check whether the user is logged in
  if (!req.user.id) {
    res.status(401).json({ message: "You are not authorized" });
  }
  const user = await User.findById(req.user.id);
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      unSubscribed: [...user.unSubscribed, req.params.id],
    },
    { new: true }
  );
  res.status(201).json(updatedUser);
};

const subscribe = async (req, res) => {
  if (!req.params.id) {
    res.status(400).json({ message: "Troble finding blog" });
  }
  // check whether the user is logged in
  if (!req.user.id) {
    res.status(401).json({ message: "You are not authorized" });
  }
  // Convert req.params.id to ObjectId
  const blogId = new mongoose.Types.ObjectId(req.params.id);

  const user = await User.findById(req.user.id);
  const newUnsubcribed = user.unSubscribed.filter((id) => !id.equals(blogId));

  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    { unSubscribed: newUnsubcribed },
    { new: true }
  );
  res.status(201).json(updatedUser);
};

const openaiComment = async (req, res) => {
  // console.log(req.body);
  if (!req.body.title || !req.body.description) {
    res.status(400).json({ message: "Please enter the requried fields" });
    return;
  }
  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "user",
        content: `give comment on this blog in 10-15 words where the title : ${req.body.title} and the description : ${req.body.description}`,
      },
    ],
    model: "gpt-3.5-turbo",
    max_tokens: 10,
  });

  // console.log(completion.choices[0].message.content);
  res.status(200).json(completion.choices[0].message.content);
};

const getTopStories = async (req, res) => {
  if (!req.params.city) {
    res.status(400).json({ message: "Trouble finding city" });
    return;
  }
  try {
    const api_key =
      "bbd2ba13cb8a607530863bdf8016122e112fc6c7176510844902884a0e15ea84";
    const response = await axios.get(
      `https://serpapi.com/search.json?q=${req.params.city}&api_key=${api_key}`
      // `https://serpapi.com/search.json?q=delhi&api_key=${api_key}`
    );
    // console.log(response);
    res.status(200).json(response.data["top_stories"]);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const suggestEvent = async (req, res) => {
  // console.log(req.body);
  if (!req.body.city || !req.body.question) {
    res.status(400).json({ message: "Please enter the requried fields" });
    return;
  }
  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "user",
        content: `${
          req.body.weather
            ? `my location is ${req.body.city}, temparature is ${req.body.tempearature} and weather out now is ${req.body.weather}. ${req.body.question} related to my current location and time in just 60-70 words`
            : `. ${req.body.question} in 60-70 words`
        }`,
      },
    ],
    model: "gpt-3.5-turbo",
    max_tokens: 100,
  });

  // console.log(completion.choices[0].message.content);
  res.status(200).json(completion.choices[0].message.content);
};

const getEvent = async (req, res) => {
  if (!req.body.question) {
    res.status(400).json({ message: "Trouble finding city" });
    return;
  }
  try {
    const api_key =
      "bbd2ba13cb8a607530863bdf8016122e112fc6c7176510844902884a0e15ea84";
    const response = await axios.get(
      `https://serpapi.com/search.json?q=${req.body.question}&api_key=${api_key}`
      // `https://serpapi.com/search.json?q=delhi&api_key=${api_key}`
    );
    // console.log(response);
    if (response.data["events_results"]) {
      res.status(200).json(response.data["events_results"]);
      return;
    } else if (response.data["organic_results"]) {
      res.status(200).json(response.data["organic_results"]);
      return;
    } else {
      res.status(200).json({ data: req.body.question });
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  getAllBlogs,
  getOneBlog,
  createBlog,
  deleteBlog,
  addComment,
  unSubscribe,
  subscribe,
  openaiComment,
  getTopStories,
  suggestEvent,
  getEvent,
};
