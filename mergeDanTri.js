const fs = require("fs");
const path = require("path");
const folderPath = "../DanTri";
const outputFilePath = "./mergedDanTri.js";
let mergedData = [];

fs.readdir(folderPath, (err, files) => {
  if (err) {
    return console.error("Unable to scan directory: " + err);
  }
  files.forEach((file) => {
    if (path.extname(file) === ".json") {
      const filePath = path.join(folderPath, file);
      const data = fs.readFileSync(filePath, "utf8");

      try {
        const jsonData = JSON.parse(data);
        const baseName = path.basename(file, "_content.json");

        jsonData.images = jsonData.images.map((image, index) => ({
          src:
            index < 9
              ? `./DanTri/${baseName}_img_0${index + 1}.jpg`
              : `./DanTri/${baseName}_img_${index + 1}.jpg`,
          start: image.start || 0,
          captions: image.captions || "No caption available",
          img: `img_${index + 1}`,
        }));

        jsonData.name = file;
        jsonData.check = false;
        mergedData.push(jsonData);
      } catch (parseError) {
        console.error(`Error parsing JSON in file ${file}: ${parseError}`);
      }
    }
  });

  const outputData = `const mergedData = ${JSON.stringify(
    mergedData,
    null,
    2
  )};\nmodule.exports = mergedData;`;

  fs.writeFileSync(outputFilePath, outputData, "utf8");
  console.log("All files have been merged into mergedData.js");
});
