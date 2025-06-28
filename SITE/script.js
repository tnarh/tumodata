const activitiesUrl = 'https://raw.githubusercontent.com/tnarh/tumodata/refs/heads/main/activities.txt';

// Function to fetch activities from the URL
async function fetchActivities() {
    try {
        const response = await fetch(activitiesUrl);

        // Check if the response is valid
        if (!response.ok) {
            throw new Error('Failed to fetch activities, status: ' + response.status);
        }

        const text = await response.text();

        // Check if text is non-empty before parsing
        if (!text.trim()) {
            throw new Error('The response is empty or invalid.');
        }

        return parseActivities(text);
    } catch (error) {
        console.error('Error fetching activities:', error);
        return [];
    }
}

function parseActivities(text) {
    const activities = [];
    const lines = text.trim().split('\n');

    lines.forEach(line => {
        const trimmedLine = line.trim();
        if (trimmedLine.length === 0) return; // Skip empty lines

        // Remove numeric prefixes like 0:, 1:, 2:, etc.
        const cleanedLine = trimmedLine.replace(/^\d+: /, '').trim();

        // Now parse the line (it should have curly braces now)
        const parts = cleanedLine.slice(1, -1); // Remove the curly braces
        const keyValuePairs = splitKeyValue(parts); // Split key-value pairs robustly

        const activity = {};
        keyValuePairs.forEach(pair => {
            const [key, value] = pair;
            if (key && value) {
                const cleanedKey = key.trim();
                let cleanedValue = value.trim().replace(/['"]/g, ''); // Remove quotes around values

                // Check if the value has a <b> tag in it (for the name)
                if (cleanedKey === "text") {
                    const regex = /<b>(.*?)<\/b>/g;
                    const matches = [...cleanedValue.matchAll(regex)];

                    // Combine the text in <b> and the rest
                    if (matches.length > 0) {
                        cleanedValue = matches.map(match => match[1]).join(' ') + cleanedValue.replace(regex, '').trim();
                    }
                }

                activity[cleanedKey.split(" ")[0].replace(":", "")] = cleanedValue;
            }
        });

        activities.push(activity);
    });

    return activities;
}

// Helper function to split key-value pairs more robustly
function splitKeyValue(str) {
    const regex = /([^,]+):\s*("[^"]*"|[^,]*)/g; // Matches key-value pairs
    const pairs = [];
    let match;

    while ((match = regex.exec(str)) !== null) {
        const key = match[1].trim();
        const value = match[2].replace(/['"]/g, '').trim(); // Remove quotes around the value
        pairs.push([key, value]);
    }

    return pairs;
}

// Function to search and filter the activities based on input
async function refresh() {
    const query = document.getElementById('pmt').value.toLowerCase();
    const activities = await fetchActivities();

    // Filter the activities by name, description, or category (or any other fields)
    const filteredActivities = activities.filter(activity => {
        return Object.values(activity).some(value => 
            value.toLowerCase().includes(query)
        );
    });

    // Display the filtered results
    displayResults(filteredActivities);
}

function displayResults(activities) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = ''; // Clear any previous results

    if (activities.length === 0) {
        resultsDiv.innerHTML = 'No activities found.';
        return;
    }

    const list = document.createElement('ul');
    activities.forEach(activity => {
        const listItem = document.createElement('li'); // Create a list item for each activity
        const link = document.createElement('a'); // Create a link for each activity
        link.textContent = `${activity.text || 'No name'} - (${activity.type || 'No focus area'})`;
        link.href = `https://activities.am.tumo.world/viewer/${activity.activityid}?lang=en`;
        listItem.appendChild(link); // Append the link to the list item
        list.appendChild(listItem); // Append the list item to the list
    });

    resultsDiv.appendChild(list); // Append the entire list to the results div
}
// Function to display the filtered activities
