/* <========EVENTS=========>*/
let currentInquiryID;

//when the page loads, display the pending inquiries
const pendingInquiries = document.getElementById('pending-inquiries');
document.addEventListener("DOMContentLoaded", async () => {
    //get the array of inquiry objects
    const inquiries = await fetchPendingInquiries();
    
    //checks for errors
    if(inquiries.length === 0) {
        //TODO: display a message that there are no pending inquiries
        pendingInquiries.textContent = "No pending inquiries";
    }
    else{
        inquiries.forEach(inquiry => {
            const tr = document.createElement('tr');

            //adds the inquiry ID to the table row
            tr.dataset.inquiryId = inquiry.inquiryID;

            ['name', 'company', 'createdAt'].forEach(key2 => {
                const td = document.createElement('td');
                if(key2 === 'createdAt') {
                    //format the createdAt date
                    td.textContent = parseTimeStamp(inquiry[key2]);
                }
                else {
                    td.textContent = inquiry[key2];
                }
                tr.appendChild(td);
            });

            pendingInquiries.appendChild(tr);
        });
    }
});


const detailsBody = document.getElementById('inquiry-details');
//pendingInquiries element defined near the top of this file
pendingInquiries.addEventListener('click', async (e) => {
    const id = e.target.closest('tr').dataset.inquiryId;
    //safeguard to ensure id is not null
    if (id) {
        //get the inquiry details
        const inquiryDetails = await fetchInquiryDetails(id);

        //used later by the approve and deny btns
        currentInquiryID = id;

        //build the details text
        detailsBody.innerHTML = "<b>Name:</b> " + inquiryDetails.name + "<br><b>Email:</b> " + inquiryDetails.email + "<br><b>Company:</b> " + inquiryDetails.company + "<br><b>Inquiry Type:</b> " + inquiryDetails.inquiryType + "<br><b>NPI:</b> " + inquiryDetails.npi + "<br><b>Number of Users:</b> " + inquiryDetails.numOfUsers + "<br><b>Message:</b> " + inquiryDetails.msg + "<br><b>Phone Number:</b> " + inquiryDetails.phoneNumber + "<br><b>Created At:</b> " + inquiryDetails.createdAt;
    }
});

const approveBtn = document.getElementById('approve-btn');
approveBtn.addEventListener('click', async function() {
    
    //if no inquiry is selected, just return
    if (!currentInquiryID){
        return;
    }

    //update inquiry status to approved
    //TODO: add a success/error msg based on the fetch called below
    await fetchUpdateInquiryStatus(currentInquiryID, 1);

    //get the row that has the same inquiry ID
    var row = pendingInquiries.querySelector('tr[data-inquiry-id="' + currentInquiryID + '"]');
    //if the row exists, remove it
    if (row){ 
        row.remove();
    }
    //also resert the details box
    detailsBody.textContent = '';
    currentInquiryID = null;
});

const denyBtn = document.getElementById('deny-btn');
denyBtn.addEventListener('click', async function() {
    if (!currentInquiryID){
        return; //no inquiry selected
    }

    //update inquiry status to denied, hence the -1
    await fetchUpdateInquiryStatus(currentInquiryID, -1);
    
    //get the row that has the same inquiry id
    var row = pendingInquiries.querySelector('tr[data-inquiry-id="' + currentInquiryID + '"]');
    
    //if the row exists, delete it (resetting the table)
    if (row){ 
        row.remove();
    }

    //reset the details box too
    detailsBody.textContent = '';
    currentInquiryID = null;
});








/*<=======EXTRA FUNCTIONS=========>*/

//returns all the pending inquiries in a list of anonymous objects
async function fetchPendingInquiries() {
    let response;
    let array = [];
    try{
        response = await fetch('/api/inquiries/pending');
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
            createdAt: res[i].createdAt,
            inquiryID: res[i].inquiryID
        })
    }

    return array;
}

//returns the inquiry details given an inquiry ID
async function fetchInquiryDetails(inquiryID){
    let response;
    try{
        response = await fetch("/api/inquiries/" + inquiryID);
        if (!response.ok) {
            throw new Error('Server error');
        }
    }
    catch(error){
        console.error('Error fetching inquiry details:', error);
        return array;
    }

    const res = await response.json();

    //returns an anomymous object with the inquiry details
    return {
        email: res.email,
        name: res.firstName + " " + res.lastName,
        company: res.companyName,
        inquiryType: res.inquiryType,
        npi: res.npi,
        numOfUsers: res.numOfUsers,
        msg: res.msg,
        phoneNumber: res.phoneNumber,
        createdAt: parseTimeStamp(res.createdAt)
    };
}

//just parses the timestamp to a more readable format
function parseTimeStamp(timeStamp){
    const parsedTimeStamp = timeStamp.substring(0, timeStamp.indexOf('T')) + " " + (parseInt(timeStamp.substring(timeStamp.indexOf("T")+1, timeStamp.indexOf(":")))-6) + timeStamp.substring(timeStamp.indexOf(":"), timeStamp.lastIndexOf(":")) + " (MT)";
    return parsedTimeStamp;
}

//calls the correct endpoint to update the inquiry status AND create the invite
//status = 1 => approved, status = 0 => pending, status = -1 => denied
async function fetchUpdateInquiryStatus(inquiryID,status){
    let response;
    try{
        response = await fetch("/api/inquiries/" + inquiryID + "/updatestatus",{
            method: 'PATCH',
            headers: {"Content-Type": "application/json"},
            credentials: "include",
            body: JSON.stringify({status})
        });
        if(!response.ok){
            throw new Error('Server error');
        }
    }
    catch(error){
        console.error("Error updating inquiry status and creating invite: ", error);
        return;
    }
};