const url = "https://www.googleapis.com/storage/v1/b";
const cache = new Map();

const results = document.querySelector("#pictures");

function clearChildren(parent) {
    while (parent.childNodes.length > 0) {
        parent.removeChild(parent.childNodes[parent.childNodes.length - 1]);
    }
}

async function getFiles(bucketName) {
    const existing = cache.get(bucketName);

    if (existing) {
        return existing;
    }

    const response = await fetch(`${url}/${bucketName}/o`);
    if (response.ok) {
        const json = await response.json();
        cache.set(bucketName, json);
        return json;
    }

    throw new Error(`Failed to fetch resources: ${fetched.messageText}`);
}

function getLabels(picture) {
    return JSON.parse(((picture.metadata || {}) || []).labels || "[]");
}

function countLabels(pictures) {
    return pictures.reduce((memo, current) => {
        const labels = getLabels(current);
        labels.forEach(label => {
            memo.set(label, (memo.get(label) || 0) + 1);
        });
        return memo;
    }, new Map());
}

function wordCloud(target, bucketName) {
    const fill = d3.scaleOrdinal(d3.schemeCategory20);

    return function render(pictures) {
        const labels = countLabels(pictures);
        const layout = d3.layout.cloud()
            .size([500, 500])
            .words(Array.from(labels).map(([key, value]) => { return {text: key, size: 10 + value }; }))
            .padding(5)
            .rotate(function() { return ~~(Math.random() * 2) * 90; })
            .font("Impact")
            .fontSize(function(d) { return d.size; })
            .on("end", draw);

        layout.start();

        function draw(words) {
            d3.select(target).append("svg")
                .attr("width", layout.size()[0])
                .attr("height", layout.size()[1])
                .append("g")
                .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
                .selectAll("text")
                .data(words)
                .enter().append("text")
                .on("click", async function (word) {
                    const label = word.text;
                    const response = await getFiles(bucketName);
                    update(response, label);
                })
                .style("font-size", function (d) {
                    return d.size + "px";
                })
                .style("font-family", "Impact")
                .style("fill", function (d, i) {
                    return fill(i);
                })
                .attr("text-anchor", "middle")
                .attr("transform", function (d) {
                    return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                })
                .text(function (d) {
                    return d.text;
                });
        }
    }
}

function filter(pictures, label) {
    if (!label) {
        return pictures;
    }

    return pictures.filter(picture => getLabels(picture).indexOf(label) !== -1);
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

    const text = document.createElement("div");
    text.setAttribute("class", "card-text");

    // <span class="badge badge-pill badge-primary">Primary</span>
    const parsedLabels = getLabels(picture);
    const labels = parsedLabels.forEach(label => {
        const span = document.createElement("span");
        span.setAttribute("class", "badge badge-pill badge-primary");
        span.textContent = label;
        text.appendChild(span);
    });

    body.appendChild(title);
    body.appendChild(text);

    return card;
}

let chart;

async function update(response, label) {
    clearChildren(results);

    const filtered = filter(response.items, label);

    for (const picture of filtered) {
        const card = createCard(picture);
        results.appendChild(card);
    }
}

document.querySelector("#show").addEventListener("click", async function(event) {
    event.preventDefault();

    clearChildren(document.querySelector("#word-cloud"));

    const bucketName = document.querySelector("#bucketName").value;
    const response = await getFiles(bucketName);
    chart = wordCloud(document.querySelector("#word-cloud"), bucketName);
    chart(response.items);

    update(response);
});
