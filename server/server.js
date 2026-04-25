const express = require("express");
const multer = require("multer");
const { exec } = require("child_process");

const app = express();

const upload = multer({ dest: "uploads/" });

app.post("/upload", upload.array("images"), (req, res) => {

  exec("python stitch.py", (err) => {
    if (err) return res.status(500).send("Error");

    res.json({ output: "output.jpg" });
  });
});

app.use(express.static("../client"));
app.use("/result", express.static(__dirname));

app.listen(3000, () => console.log("Server running"));