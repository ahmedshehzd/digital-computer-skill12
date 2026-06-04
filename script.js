let students = JSON.parse(localStorage.getItem("students")) || [];
let lectures = JSON.parse(localStorage.getItem("lectures")) || [];
let feedback = JSON.parse(localStorage.getItem("feedback")) || [];
let currentUser = null;

let homeToggle = false;

/* ================= LOGIN ================= */
function showStudentLogin(){
    hideAll();
    document.getElementById("studentLogin").classList.remove("hidden");
}

function showTeacherLogin(){
    hideAll();
    document.getElementById("teacherLogin").classList.remove("hidden");
}

/* ================= 🔥 REGISTER FIX ADDED ================= */
function showStudentRegister(){
    hideAll();
    document.getElementById("studentRegister").classList.remove("hidden");
}

function registerStudent(){

    let name = document.getElementById("regName").value;
    let phone = document.getElementById("regPhone").value;
    let email = document.getElementById("regEmail").value;
    let password = document.getElementById("regPassword").value;

    if(!name || !email || !password){
        alert("Please fill all required fields");
        return;
    }

    let exists = students.find(s => s.email === email);

    if(exists){
        alert("Account already exists");
        return;
    }

    students.push({
        name,
        phone,
        email,
        password
    });

    localStorage.setItem("students", JSON.stringify(students));

    alert("Account Created Successfully");

    showStudentLogin();
}

/* ================= LOGIN ================= */
function loginStudent(){

    let email = document.getElementById("loginEmail").value;
    let pass = document.getElementById("password").value;

    currentUser = students.find(s => s.email === email && s.password === pass);

    if(!currentUser){
        alert("Invalid Student Login");
        return;
    }

    showStudent();
}

function loginTeacher(){

    let code = document.getElementById("teacherCode").value;

    if(code === "628705"){
        showTeacher();
        updateBell();
    } else {
        alert("Invalid Teacher Code");
    }
}

/* ================= DASHBOARD ================= */
function showStudent(){
    hideAll();
    document.getElementById("studentDash").classList.remove("hidden");

    document.getElementById("studentInfo").innerHTML = `
        <h3>${currentUser.name}</h3>
        <p>${currentUser.email}</p>
    `;
}

function showTeacher(){
    hideAll();
    document.getElementById("teacherDash").classList.remove("hidden");
    home();
}

/* ================= HOME ================= */
function home(){

    homeToggle = !homeToggle;

    let container = document.getElementById(
        document.getElementById("studentDash").classList.contains("hidden")
        ? "teacherContent"
        : "studentLectures"
    );

    if(!homeToggle){
        container.innerHTML = "";
        return;
    }

    let html = `<h2>📢 Latest Lectures</h2>`;

    lectures.forEach((l,i)=>{
        html += `
        <div style="
            background:rgba(255,255,255,0.08);
            border:1px solid rgba(255,255,255,0.2);
            padding:15px;
            margin:10px 0;
            border-radius:12px;
            backdrop-filter:blur(8px);
            color:white;
        ">

            <h3>${l.title}</h3>
            <p>${l.description}</p>

            ${
                document.getElementById("studentDash").classList.contains("hidden")
                ? ""
                : `
                <div style="display:flex;gap:10px;margin-top:10px;">
                    <button onclick="sendFeedback(${i}, true)">✔ Understood</button>
                    <button onclick="sendFeedback(${i}, false)">✘ Not Understood</button>
                </div>`
            }

        </div>`;
    });

    container.innerHTML = html;
}

/* ================= CREATE LECTURE ================= */
function createLecture(){

    document.getElementById("teacherContent").innerHTML = `
        <h2>Create Lecture</h2>

        <input id="title" placeholder="Title">
        <input id="desc" placeholder="Description">
        <input id="link" placeholder="Link">

        <button onclick="saveLecture()">Save</button>
    `;
}

function saveLecture(){

    lectures.push({
        title: document.getElementById("title").value,
        description: document.getElementById("desc").value,
        link: document.getElementById("link").value
    });

    localStorage.setItem("lectures", JSON.stringify(lectures));

    alert("Lecture Saved");
    home();
}

/* ================= FEEDBACK ================= */
function sendFeedback(index, status){

    let lectureTitle = lectures[index].title;

    feedback = feedback.filter(f =>
        !(f.student === currentUser.name && f.lecture === lectureTitle)
    );

    feedback.push({
        student: currentUser.name,
        lecture: lectureTitle,
        status: status ? "Understood" : "Not Understood",
        time: new Date().toLocaleString(),
        read: false
    });

    localStorage.setItem("feedback", JSON.stringify(feedback));

    updateBell();

    showFeedbackAnimation(status);

    let buttons = document.querySelectorAll(`[onclick*="sendFeedback(${index}"]`);

    buttons.forEach(b=>{
        b.disabled = true;
        b.style.opacity = "0.6";
        b.style.transform = "scale(0.95)";

        if(status){
            b.innerHTML = "✔ Understood";
            b.style.background = "#00c853";
        } else {
            b.innerHTML = "✘ Not Understood";
            b.style.background = "#ff3d00";
        }
    });
}

/* ================= ANIMATION ================= */
function showFeedbackAnimation(status){

    let box = document.createElement("div");

    box.innerHTML = status ? "✔ Understood Success" : "✘ Not Understood Sent";

    box.style.position = "fixed";
    box.style.top = "50%";
    box.style.left = "50%";
    box.style.transform = "translate(-50%,-50%) scale(0)";
    box.style.padding = "20px 30px";
    box.style.borderRadius = "12px";
    box.style.color = "white";
    box.style.fontSize = "18px";
    box.style.zIndex = "9999";
    box.style.transition = "0.3s ease";
    box.style.background = status ? "#00c853" : "#ff3d00";

    document.body.appendChild(box);

    setTimeout(()=> box.style.transform = "translate(-50%,-50%) scale(1)", 10);

    setTimeout(()=>{
        box.style.transform = "translate(-50%,-50%) scale(0)";
        box.style.opacity = "0";
    },1200);

    setTimeout(()=> box.remove(),1600);
}

/* ================= NOTIFICATIONS ================= */
function updateBell(){

    let bell = document.getElementById("bellCount");
    if(!bell) return;

    let unread = feedback.filter(f => !f.read).length;
    bell.innerText = unread;
}

function toggleNotifications(){

    let box = document.getElementById("notifBox");

    if(box.style.display === "block"){
        box.style.display = "none";
        return;
    }

    box.style.display = "block";

    let html = `<h3>Notifications</h3>
    <div style="max-height:200px;overflow-y:auto;">`;

    feedback.forEach((f,i)=>{
        html += `
        <div onclick="markRead(${i})"
            style="padding:8px;border-bottom:1px solid #ddd;
            background:${f.read ? '#eee' : '#fff'};cursor:pointer;">

            <b>${f.student}</b><br>
            ${f.lecture} → ${f.status}<br>
            <small>${f.time}</small>
        </div>`;
    });

    html += `</div>`;

    box.innerHTML = html;

    feedback.forEach(f => f.read = true);
    localStorage.setItem("feedback", JSON.stringify(feedback));
    updateBell();
}

function markRead(i){
    feedback[i].read = true;
    localStorage.setItem("feedback", JSON.stringify(feedback));
    updateBell();
}

/* ================= MY COURSES ================= */
let courseToggle = false;

function myCourses(){

    courseToggle = !courseToggle;

    if(!courseToggle){
        document.getElementById("studentLectures").innerHTML = "";
        return;
    }

    let courses = ["MS Excel","Basic Computer","Designing","Amazon"];

    let html = "<h2>My Courses</h2>";

    courses.forEach(c=>{
        html += `<p>✔ ${c}</p>`;
    });

    document.getElementById("studentLectures").innerHTML = html;
}

/* ================= STUDENTS ================= */
function studentsList(){

    let html = "<h2>Students</h2>";

    students.forEach((s,i)=>{
        html += `
        <div style="background:rgba(255,255,255,0.08);
                    padding:10px;margin:8px;border-radius:10px;">

            <div onclick="toggleStudent(${i})" style="cursor:pointer;display:flex;justify-content:space-between;">
                <b>${s.name}</b>
                <span>➡</span>
            </div>

            <div id="stu_${i}" style="display:none;margin-top:10px;">
                <p>${s.email}</p>
                <p>${s.phone}</p>
                <p><b>Courses:</b> MS Excel, Basic Computer</p>
            </div>

        </div>`;
    });

    document.getElementById("teacherContent").innerHTML = html;
}

function toggleStudent(i){

    let box = document.getElementById("stu_"+i);
    box.style.display = (box.style.display === "block") ? "none" : "block";
}

/* ================= LOGOUT ================= */
function logout(){

    currentUser = null;
    hideAll();
    document.getElementById("loginBox").classList.remove("hidden");
}

/* ================= HIDE ALL ================= */
function hideAll(){

    document.getElementById("loginBox").classList.add("hidden");
    document.getElementById("studentLogin").classList.add("hidden");
    document.getElementById("teacherLogin").classList.add("hidden");
    document.getElementById("studentRegister").classList.add("hidden");
    document.getElementById("studentDash").classList.add("hidden");
    document.getElementById("teacherDash").classList.add("hidden");
}

updateBell();
