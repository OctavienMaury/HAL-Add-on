// Get references to the checkbox elements by their IDs
const allDocumentsCheckbox = document.getElementById('allDocuments');
const articleCheckbox = document.getElementById('article');
const thesisCheckbox = document.getElementById('thesis');

// Function to disable 'allDocuments' checkbox if either 'article' or 'thesis' is checked
function disableAllDocuments() {
  if (articleCheckbox.checked || thesisCheckbox.checked) {
    allDocumentsCheckbox.checked = false; // Uncheck 'allDocuments'
  }
}

// Function to disable 'article' and 'thesis' checkboxes if 'allDocuments' is checked
function disableArticleAndThesis() {
  if (allDocumentsCheckbox.checked) {
    articleCheckbox.checked = false; // Uncheck 'article'
    thesisCheckbox.checked = false; // Uncheck 'thesis'
  }
}

// Add event listeners to checkboxes to trigger the corresponding functions on change
allDocumentsCheckbox.addEventListener('change', disableArticleAndThesis);
articleCheckbox.addEventListener('change', disableAllDocuments);
thesisCheckbox.addEventListener('change', disableAllDocuments);

// Add an event listener to the 'randomButton' to fetch random documents when clicked
document.getElementById('randomButton').addEventListener('click', function() {
  let selectedTypes = []; // Array to hold selected document types

  // Check which checkboxes are selected and add corresponding types to the array
  if (allDocumentsCheckbox.checked) {
    selectedTypes.push("*"); // Select all documents if 'allDocuments' is checked
  } else {
    if (articleCheckbox.checked) selectedTypes.push("ART"); // Add "ART" if article is checked
    if (thesisCheckbox.checked) selectedTypes.push("THESE"); // Add "THESE" if thesis is checked
  }

  // Construct the filter query based on selected document types
  let filterQuery = selectedTypes.length > 0 ? "fq=docType_s:(" + selectedTypes.join(" OR ") + ")" : "";
  
  // Create the API URL with the constructed filter query
  let apiUrl = `https://api.archives-ouvertes.fr/search/?q=text:*&${filterQuery}&rows=10&wt=xml`;
  console.log("Request URL: ", apiUrl); // Log the API URL for debugging

  // Fetch data from the API
  fetch(apiUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network error: ' + response.statusText); // Handle network errors
      }
      return response.text(); // Return the response as text
    })
    .then(data => {
      // Parse the returned XML data
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(data, "text/xml");
      
      // Get all <doc> elements from the XML
      const docs = xmlDoc.getElementsByTagName("doc");
      console.log("Retrieved documents:", docs); // Log the retrieved documents
      
      // Check if there are any documents
      if (docs.length > 0) {
        // Select a random document from the retrieved documents
        const randomIndex = Math.floor(Math.random() * docs.length);
        const document = docs[randomIndex];
        console.log("Selected document:", document); // Log the selected document
        
        // Get the URI and label from the selected document
        const uriElements = document.getElementsByTagName("str");
        const labelElements = document.getElementsByTagName("str");
        
        let uri = null;
        let label = null;

        // Loop through the elements to find the URI and label
        for (let i = 0; i < uriElements.length; i++) {
          if (uriElements[i].getAttribute("name") === "uri_s") {
            uri = uriElements[i].textContent.trim(); // Extract the URI
          }
          if (labelElements[i].getAttribute("name") === "label_s") {
            label = labelElements[i].textContent.trim(); // Extract the label
          }
        }
        
        // Check if a URI was found
        if (uri) {
          console.log("Retrieved URL: ", uri); // Log the retrieved URL
          console.log("Retrieved title: ", label || 'Title not available'); // Log the title or a default message
          
          window.open(uri, '_blank'); // Open the URI in a new tab
        } else {
          alert("No link available for the selected document."); // Alert if no URI was found
          console.error("URI element not found in the selected document."); // Log the error
        }
      } else {
        alert("No documents found for the selected criteria."); // Alert if no documents were found
      }
    })
    .catch(error => {
      console.error('Error:', error); // Log any errors encountered during the fetch
      alert("An error occurred while retrieving documents. Please try again."); // Alert the user about the error
    });
});
