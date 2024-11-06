function checkEnter(event) {
    if (event.key === 'Enter') {
        searchProtein();
    }
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function capitalizeAllWords(string) {
    return string.split(" ").map(word => capitalizeFirstLetter(word)).join(" ");
}

function parseTitle(title) {
    const result = {};

    title.split(";").forEach(part => {
        part = part.trim();
        if (part.startsWith("RecName: Full=")) {
            result.recName = part.replace("RecName: Full=", "").trim();
        } else if (part.startsWith("AltName: Full=")) {
            result.altName = part.replace("AltName: Full=", "").trim();
        }
    });

    return result;
}

async function searchProtein() {
    const proteinID = document.getElementById("proteinSearch").value.trim();
    const infoContainer = document.getElementById("proteinInfo");
    
    if (!proteinID) {
        alert("Please enter a protein ID.");
        return;
    }

    // Show loading spinner or message while fetching data
    infoContainer.innerHTML = `<p>Loading...</p>`;
    infoContainer.classList.add('show');

    const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=protein&term=${proteinID}&retmode=json`;

    try {
        const searchResponse = await fetch(searchUrl);
        if (!searchResponse.ok) throw new Error("Protein ID not found in NCBI");

        const searchData = await searchResponse.json();
        const idList = searchData.esearchresult.idlist;

        if (idList.length === 0) throw new Error("No matching protein ID found.");

        const ncbiProteinID = idList[0];

        // Fetch protein details
        const summaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=protein&id=${ncbiProteinID}&retmode=json`;
        const summaryResponse = await fetch(summaryUrl);
        if (!summaryResponse.ok) throw new Error("Unable to fetch protein details.");

        const summaryData = await summaryResponse.json();
        const proteinData = summaryData.result[ncbiProteinID];

        const parsedNames = parseTitle(proteinData.title);
        const proteinName = parsedNames.recName || proteinData.title || "N/A";
        const altName = parsedNames.altName || "N/A";
        const completeness = proteinData.completeness || "N/A";
        const creationDate = proteinData.createdate || "N/A";
        const moltype = proteinData.moltype || "N/A";
        const organism = proteinData.organism || "N/A";
        const topology = proteinData.topology || "N/A";
        const updationDate = proteinData.updatedate || "N/A";

        // Display the data
        infoContainer.innerHTML = `
            <p class="protein-title"><strong>Protein ID:</strong> ${proteinID}</p>
            <p class="protein-info"><strong>Protein Name:</strong> ${proteinName}</p>
            <p class="protein-info"><strong>Alternative Name:</strong> ${altName}</p>
            <p class="protein-info"><strong>Completeness:</strong> ${completeness}</p>
            <p class="protein-info"><strong>Mol Type:</strong> ${moltype}</p>
            <p class="protein-info"><strong>Organism:</strong> ${organism}</p>
            <p class="protein-info"><strong>Topology:</strong> ${topology}</p>
            <p class="protein-info"><strong>Creation Date:</strong> ${creationDate}</p>
            <p class="protein-info"><strong>Last Updated on:</strong> ${updationDate}</p>
        `;

    } catch (error) {
        infoContainer.innerHTML = `<p class="protein-info">An error occurred while fetching data. Please try again later.</p>`;
    }
}
