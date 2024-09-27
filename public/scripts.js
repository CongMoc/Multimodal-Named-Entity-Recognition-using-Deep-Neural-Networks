let currentIndex = 0;
let data = [];
let newData = [];
let selectedImage = null;
let selectedFolder = "DanTri";

// Fetch dữ liệu từ server dựa trên thư mục đã chọn
async function fetchData(resetIndex = true) {
  try {
    const response = await fetch(
      `http://localhost:3000/api/data?folder=${selectedFolder}`
    );
    data = await response.json();
    if (resetIndex) {
      currentIndex = 0;
    }
    displayData(currentIndex);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

function fetchContentCount() {
  fetch("http://localhost:3000/api/count")
    .then((response) => response.json())
    .then((data) => {
      const countElement = document.getElementById("total-new");
      countElement.textContent = `Total New Data: ${data.count}`;
    })
    .catch((error) => {
      console.error("Error fetching content count:", error);
    });
}

// Lắng nghe sự kiện thay đổi của select box
document
  .getElementById("folder-select")
  .addEventListener("change", function (e) {
    selectedFolder = e.target.value; // Lấy giá trị của thư mục đã chọn
    fetchData(true); // Gọi lại hàm fetchData để lấy dữ liệu từ thư mục mới
  });

function displayData(index) {
  const container = document.getElementById("data-container");
  container.innerHTML = "";

  const total = document.getElementById("total");
  total.innerText = "Total data: " + (index + 1) + "/" + data.length;

  const item = data[index];

  if (item) {
    const contentDiv = document.createElement("div");
    contentDiv.classList.add("content");

    const imageDiv = document.createElement("div");
    imageDiv.classList.add("image-container");

    const title = document.createElement("h2");
    title.textContent = "Title: " + item.title;
    contentDiv.appendChild(title);

    const link = document.createElement("a");
    link.href = item.url;
    link.textContent = "URL: " + item.url;
    link.target = "_blank";
    contentDiv.appendChild(link);

    const abstract = document.createElement("p");
    abstract.textContent = "Abstract: " + item.abstract;
    contentDiv.appendChild(abstract);
    const keep_title = document.getElementById("check-box");
    keep_title.checked = item.check || false;

    item.images.forEach((image, index) => {
      const image_detail = document.createElement("div");
      image_detail.classList.add("image-detail");
      const imgElement = document.createElement("img");
      imgElement.src = image.src;
      image_detail.appendChild(imgElement);

      const content_image = document.createElement("div");
      content_image.classList.add("content-image");
      const divImage = document.createElement("div");
      divImage.classList.add("checkbox-image");
      const checkboxImage = document.createElement("h4");
      checkboxImage.textContent = "Select Image: ";
      divImage.appendChild(checkboxImage);

      const caption = document.createElement("h4");
      caption.textContent = `${image.captions}`;
      content_image.appendChild(caption);

      const checkbox = document.createElement("input");
      checkbox.classList.add("check-box-image");
      checkbox.type = "checkbox";
      checkbox.name = `image_${index + 1}`;
      checkbox.value = image.src;
      checkbox.addEventListener("change", (e) =>
        handleCheckboxChange(e, image, item)
      );
      divImage.appendChild(checkbox);
      content_image.appendChild(divImage);

      image_detail.appendChild(content_image);
      imageDiv.appendChild(image_detail);
    });

    container.appendChild(contentDiv);
    container.appendChild(imageDiv);
    fetchContentCount();
  }
}

function handleCheckboxChange(event, image, item) {
  const checkboxes = document.querySelectorAll(".check-box-image");
  if (event.target.checked) {
    selectedImage = { ...item, images: [image] };

    checkboxes.forEach((checkbox) => {
      if (!checkbox.checked) {
        checkbox.disabled = true;
      }
    });
  } else {
    selectedImage = null;
    checkboxes.forEach((checkbox) => {
      checkbox.disabled = false;
    });
  }
}

document.getElementById("next-btn").addEventListener("click", () => {
  if (currentIndex < data.length - 1) {
    currentIndex++;
    displayData(currentIndex);
  }
});

document.getElementById("prev-btn").addEventListener("click", () => {
  if (currentIndex > 0) {
    currentIndex--;
    displayData(currentIndex);
  }
});

// Gọi lại hàm fetchContentCount sau khi thêm item thành công
document.getElementById("add-btn").addEventListener("click", () => {
  if (selectedImage) {
    const checkBox = document.getElementById("check-box");
    const checkValue = checkBox.checked;

    const contentAdd = {
      name: selectedImage.name,
      title: checkValue
        ? selectedImage.title
        : selectedImage.images[0].captions,
      url: selectedImage.url,
      abstract: selectedImage.abstract,
      content: selectedImage.content,
      src: selectedImage.images[0].src,
      img: selectedImage.images[0].img,
      check: checkValue,
    };

    addSelectedImage(contentAdd);
  } else {
    alert("Please select an image before adding.");
  }
});

function addSelectedImage(image) {
  fetch("http://localhost:3000/add-image", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(image),
  })
    .then((response) => response.json())
    .then((data) => {
      alert(data.message);
      fetchContentCount();
      fetchData(false).then(() => {
        currentIndex++;
        displayData(currentIndex);
      });
    })
    .catch((error) => {
      console.error("Error adding image:", error);
    });
}

document.getElementById("go-to-btn").addEventListener("click", () => {
  const inputElement = document.getElementById("index-input");
  const index = parseInt(inputElement.value);

  // Kiểm tra xem index có hợp lệ hay không
  if (!isNaN(index) && index > 0 && index <= data.length) {
    currentIndex = index - 1;
    displayData(currentIndex);
  } else {
    alert(`Invalid index! Please enter a value between 1 and ${data.length}`);
  }
});

document.addEventListener("keydown", function (event) {
  if (event.key === "ArrowRight") {
    if (currentIndex < data.length - 1) {
      currentIndex++;
      displayData(currentIndex);
    }
  } else if (event.key === "ArrowLeft") {
    if (currentIndex > 0) {
      currentIndex--;
      displayData(currentIndex);
    }
  }
});

window.onload = fetchData;
