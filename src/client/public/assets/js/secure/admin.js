/* <========EVENTS=========>*/
const pendingInquiries = document.getElementById('pending-inquiries');

//when the page loads, display the pending inquiries
document.addEventListener("DOMContentLoaded", async () => {
    //get the array of inquiry objects
    const inquiries = await fetchPendingInquiries();
    
    //checks for errors
    if(inquiries.length === 0) {
        //TODO: display a message that there are no pending inquiries
        const pendingInquiries = document.getElementById('pending-inquiries');
        pendingInquiries.textContent = "No pending inquiries";
    }
    else{
        inquiries.forEach(inquiry => {
            const tr = document.createElement('tr');

            //adds the inquiry ID to the table row
            tr.dataset.inquiryID = inquiry.inquiryID;

            ['name', 'company', 'createdAt'].forEach(key2 => {
                const td = document.createElement('td');
                td.textContent = inquiry[key2]; 
                tr.appendChild(td);
            });

            pendingInquiries.appendChild(tr);
        });
    }
});

/*<=======EXTRA FUNCTIONS=========>*/

//returns all the pending inquiries in a list of anonymous objects
async function fetchPendingInquiries() {
    let response;
    let array = [];
    try{
        response = await fetch('/api/inquiries/unapproved');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
    }
    catch{
        console.error('Error fetching pending inquiries:', error);
        return array;
    }

    const res = await response.json();
    for(let i = 0; i < res.length;i++){
        array.push({
            name: res[i].firstName + " " + res[i].lastName,
            company: res[i].companyName,
            createdAt: res[i].createdAt
        })
    }

    return array;
}