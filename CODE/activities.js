const activities = document.querySelectorAll('div.x-activity');
const results = [];

activities.forEach(activity => {
    const activityid = activity.getAttribute('activityid'); // gets activity IDs
    const nameDiv = activity.querySelector('div.name'); // gets the divs that have the name of the activity
    const text = nameDiv ? nameDiv.querySelector('span')?.textContent : null; // gets the text

    const ringDiv = activity.querySelector('div.ring'); // gets the divs that contain a class with the focus area of the activity
    const type = ringDiv ? ringDiv.className.split(" ")[2] : null; // gets the focus area 

    results.push({ activityid, text, type });
});

console.log(results);
