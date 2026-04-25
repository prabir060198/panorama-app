const express = require("express");
const multer = require("multer");
const { exec } = require("child_process");
const path = require("path");

const app = express();

const upload = multer({ dest: "uploads/" });

app.post("/upload", upload.array("images"), (req, res)=>{

  exec("python stitch.py", (err, stdout)=>{
    if(err){
      console.error(err);
      return res.status(500).send("Stitch failed");
    }

    res.json({ output: "output.jpg" });
  });
});

app.use(express.static("../client"));
app.use("/result", express.static(__dirname));

app.listen(3000, ()=>console.log("Server running"));