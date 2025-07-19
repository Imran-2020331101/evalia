const express = require("express");
const fileUpload = require("express-fileupload");
const pdfParse = require("pdf-parse");

const app = express();
const port = 5000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use(fileUpload());

app.post("/upload/resume", (req, res) => {
  if (!req.files || !req.files.pdfFile) {
    res.status(400).json({
      msg: "error no pdf file recieved",
    });
    return;
  }

  pdfParse(req.files.pdfFile)
    .then((result) => {
      console.log(result.text);
      res.status(200).json({
        text: result.text,
      });
    })
    .catch((err) => {
      console.error("Error parsing PDF:", err);
      res.status(500).json({
        msg: "Error parsing PDF file",
        error: err.message,
      });
    });
});

app.listen(port, () => {
  console.log(`Soul of Evalia listening on port ${port}`);
});
