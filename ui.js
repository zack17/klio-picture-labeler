const url = "https://www.googleapis.com/storage/v1/b";

const results = document.querySelector("#pictures");

function clearChildren(parent) {
    while (parent.childNodes.length > 0) {
        parent.removeChild(parent.childNodes[parent.childNodes.length - 1]);
    }
}

async function getFiles(bucketName) {
    const response = await fetch(`${url}/${bucketName}/o`);
    if (response.ok) {
        return response.json();
    }

    throw new Error(`Failed to fetch resources: ${fetched.messageText}`);
}

function getLabels(picture) {
    return JSON.parse(((picture.metadata || {}) || []).labels || "[]");
}

function getUniqueLabels(pictures) {
    return pictures.reduce((memo, current) => {
        const labels = getLabels(current);
        labels.forEach(label => memo.add(label));
        return memo;
    }, new Set());
}

function renderLabels(pictures) {
    const uniqueLabels = getUniqueLabels(pictures);
    console.log(uniqueLabels);
}

// <div class="card">
//     <img class="card-img-top" src="..." alt="Card image cap">
//     <div class="card-block">
//     <h4 class="card-title">Card title</h4>
// <p class="card-text">This is a longer card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.</p>
// <p class="card-text"><small class="text-muted">Last updated 3 mins ago</small></p>
// </div>
// </div>
function createCard(picture) {
    const card = document.createElement("div");
    card.setAttribute("class", "card");

    const img = document.createElement("img");
    img.setAttribute("class", "card-img-top img-thumbnail");
    img.setAttribute("src", picture.mediaLink);
    card.appendChild(img);

    const body = document.createElement("div");
    body.setAttribute("class", "card-block");
    card.appendChild(body);

    const title = document.createElement("h4");
    title.textContent = picture.name;
    title.setAttribute("class", "card-title");

    const text = document.createElement("p");
    text.setAttribute("class", "card-text");

    // <span class="badge badge-pill badge-primary">Primary</span>
    const parsedLabels = getLabels(picture);
    const labels = parsedLabels.forEach(label => {
        const span = document.createElement("span");
        span.setAttribute("class", "badge, badge-pill badge-primary");
        span.textContent = label;
        text.appendChild(span);
    });

    body.appendChild(title);
    body.appendChild(text);

    return card;
}


async function update(bucketName) {
    const response = await getFiles(bucketName);

    clearChildren(results);
    renderLabels(response.items);

    for (const picture of response.items) {
        const card = createCard(picture);
        results.appendChild(card);
    }
}

document.querySelector("#show").addEventListener("click", function (event) {
    event.preventDefault();

    const bucketName = document.querySelector("#bucketName").value;
    update(bucketName);
});
