//PSURF 2025 / MedLearn LMS / src / client / public / js
//<=========EVENTS==========>
const getStartedBtn = document.getElementById("get-started-btn");
getStartedBtn.addEventListener('click', async (e) => {
    if(await authFetch()){
        window.location.href = "/secure/dashboard.html" //fix, there's error with parcel rn
    }
    else{
        window.location.href = "/inquiries.html";
    }
});

//<==========EXTRA FUNCTIONS=========>
