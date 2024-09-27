const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();
const port = 3000;

app.use(cors());
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());

const newFilePath = "./addedContent.js";

// API trả về dữ liệu từ file mergedData.js
app.get("/api/data", (req, res) => {
  const folder = req.query.folder;
  const mergedData = require("./merged" + `${folder}`);
  res.json(mergedData);
});

// API trả về số lượng có trong file data mới
app.get("/api/count", (req, res) => {
  let addedContent = [];

  if (fs.existsSync(newFilePath)) {
    try {
      addedContent = require(newFilePath);
    } catch (err) {
      console.error("Error reading addedContent.js:", err);
    }
  }
  const count = Array.isArray(addedContent) ? addedContent.length : 0;
  res.json({ count });
});

// API thêm ảnh vào file JS mới mà không ghi đè nội dung cũ và kiểm tra trùng lặp
app.post("/add-image", (req, res) => {
  const content = req.body;

  // Đảm bảo rằng file tồn tại và có cấu trúc đúng
  let addedContent = [];

  if (fs.existsSync(newFilePath)) {
    try {
      addedContent = require(newFilePath);
    } catch (err) {
      console.error("Error reading existing file:", err);
    }
  }

  if (!Array.isArray(addedContent)) {
    addedContent = [];
  }

  // Kiểm tra nếu `name` đã tồn tại
  const nameExists = addedContent.some((item) => item.name === content.name);

  if (nameExists) {
    return res
      .status(400)
      .json({ message: "Content with this name already exists." });
  }

  // Xử lý kiểm tra `check`
  if (!content.check) {
    // Nếu `check` là false, thay thế giá trị title bằng caption của ảnh đầu tiên
    if (content.images && content.images.length > 0) {
      content.title = content.images[0].captions;
    }
  }

  // Thêm nội dung mới vào mảng
  addedContent.push(content);

  // Ghi lại vào file với định dạng đúng
  const newContent = `const addedContent = ${JSON.stringify(
    addedContent,
    null,
    2
  )};\nmodule.exports = addedContent;`;
  fs.writeFileSync(newFilePath, newContent, "utf8");

  res.json({ message: "Content added successfully!" });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
