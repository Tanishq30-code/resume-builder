// Data Models structure
const defaultData = {
    students: [], // { id, name, contact, roomId, feeDue, feePaid }
    rooms: [],    // { id, number, capacity, occupants: [studentId] }
    issues: []    // { id, roomId, desc, status }
};

// Initialize Application
let appData = JSON.parse(localStorage.getItem('lumina_data'));
if (!appData) {
    appData = defaultData;
    saveData();
}

function saveData() {
    localStorage.setItem('lumina_data', JSON.stringify(appData));
    updateDashboard();
}

function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

// Navigation Logic
document.querySelectorAll('.nav-links li').forEach(item => {
    item.addEventListener('click', (e) => {
        // Handle Active Class
        document.querySelectorAll('.nav-links li').forEach(li => li.classList.remove('active'));
        e.currentTarget.classList.add('active');

        // Handle View Switching
        const targetView = e.currentTarget.getAttribute('data-target');
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active-view');
        });
        document.getElementById(targetView).classList.add('active-view');

        // Refresh Data for specific views
        if(targetView === 'students') renderStudents();
        if(targetView === 'rooms') renderRooms();
        if(targetView === 'fees') renderFees();
        if(targetView === 'maintenance') renderIssues();
    });
});

// Modal Logic
function openModal(modalId) {
    document.getElementById('modal-backdrop').classList.add('show');
    document.getElementById(modalId).classList.add('show');
}

function closeModal(modalId) {
    document.getElementById('modal-backdrop').classList.remove('show');
    document.getElementById(modalId).classList.remove('show');
}

document.querySelectorAll('.close-modal, .modal-backdrop').forEach(el => {
    el.addEventListener('click', () => {
        document.querySelectorAll('.modal').forEach(modal => modal.classList.remove('show'));
        document.getElementById('modal-backdrop').classList.remove('show');
    });
});

// Handlers for Add Buttons
document.getElementById('btn-add-student').addEventListener('click', () => openModal('modal-add-student'));
document.getElementById('btn-add-room').addEventListener('click', () => openModal('modal-add-room'));
document.getElementById('btn-add-issue').addEventListener('click', () => {
    populateRoomSelect('issue-room-select');
    openModal('modal-add-issue');
});

// Form Submissions
document.getElementById('form-add-student').addEventListener('submit', (e) => {
    e.preventDefault();
    const newStudent = {
        id: generateId(),
        name: document.getElementById('student-name').value,
        contact: document.getElementById('student-contact').value,
        roomId: null,
        feeDue: parseFloat(document.getElementById('student-fee').value),
        feePaid: 0
    };
    appData.students.push(newStudent);
    saveData();
    closeModal('modal-add-student');
    e.target.reset();
    renderStudents();
});

document.getElementById('form-add-room').addEventListener('submit', (e) => {
    e.preventDefault();
    const newRoom = {
        id: generateId(),
        number: document.getElementById('room-number').value,
        capacity: parseInt(document.getElementById('room-capacity').value),
        occupants: []
    };
    appData.rooms.push(newRoom);
    saveData();
    closeModal('modal-add-room');
    e.target.reset();
    renderRooms();
});

document.getElementById('form-add-issue').addEventListener('submit', (e) => {
    e.preventDefault();
    const newIssue = {
        id: generateId(),
        roomId: document.getElementById('issue-room-select').value,
        desc: document.getElementById('issue-desc').value,
        status: 'Open'
    };
    appData.issues.push(newIssue);
    saveData();
    closeModal('modal-add-issue');
    e.target.reset();
    renderIssues();
});

// Allocation Logic
window.promptAllocation = function(studentId) {
    document.getElementById('allocate-student-id').value = studentId;
    const select = document.getElementById('allocate-room-select');
    select.innerHTML = '<option value="">Select a room...</option>';
    
    appData.rooms.forEach(room => {
        if (room.occupants.length < room.capacity) {
            select.innerHTML += `<option value="${room.id}">Room ${room.number} (${room.occupants.length}/${room.capacity})</option>`;
        }
    });
    
    openModal('modal-allocate-room');
}

document.getElementById('form-allocate-room').addEventListener('submit', (e) => {
    e.preventDefault();
    const studentId = document.getElementById('allocate-student-id').value;
    const roomId = document.getElementById('allocate-room-select').value;
    
    if(!roomId) return;

    // Remove from previous room if exists
    const student = appData.students.find(s => s.id === studentId);
    if (student.roomId) {
        const oldRoom = appData.rooms.find(r => r.id === student.roomId);
        if(oldRoom) oldRoom.occupants = oldRoom.occupants.filter(id => id !== studentId);
    }

    // Add to new room
    const newRoom = appData.rooms.find(r => r.id === roomId);
    newRoom.occupants.push(studentId);
    student.roomId = roomId;

    saveData();
    closeModal('modal-allocate-room');
    renderStudents();
});

window.removeAllocation = function(studentId) {
    const student = appData.students.find(s => s.id === studentId);
    if (!student.roomId) return;
    
    const room = appData.rooms.find(r => r.id === student.roomId);
    if(room) {
        room.occupants = room.occupants.filter(id => id !== studentId);
    }
    student.roomId = null;
    
    saveData();
    renderStudents();
}


// Fee Payment
window.payFee = function(studentId) {
    const amount = prompt("Enter amount to pay:");
    if(amount && !isNaN(amount)) {
        const student = appData.students.find(s => s.id === studentId);
        student.feePaid += parseFloat(amount);
        saveData();
        renderFees();
    }
}

// Issue Resolution
window.resolveIssue = function(issueId) {
    const issue = appData.issues.find(i => i.id === issueId);
    if(issue) issue.status = 'Resolved';
    saveData();
    renderIssues();
}

window.deleteIssue = function(issueId) {
    appData.issues = appData.issues.filter(i => i.id !== issueId);
    saveData();
    renderIssues();
}


// Renderers
function updateDashboard() {
    document.getElementById('total-students').innerText = appData.students.length;
    
    const totalCapacity = appData.rooms.reduce((acc, r) => acc + r.capacity, 0);
    const totalOccupants = appData.rooms.reduce((acc, r) => acc + r.occupants.length, 0);
    document.getElementById('rooms-occupied').innerText = `${totalOccupants} / ${totalCapacity || 0}`;

    const totalDue = appData.students.reduce((acc, s) => acc + (s.feeDue - s.feePaid), 0);
    document.getElementById('pending-fees').innerText = `$${totalDue}`;

    const openIssues = appData.issues.filter(i => i.status === 'Open').length;
    document.getElementById('open-issues').innerText = openIssues;
}

function renderStudents() {
    const tbody = document.getElementById('student-table-body');
    tbody.innerHTML = '';
    
    appData.students.forEach(s => {
        let roomAssignment = '<span class="badge badge-warning">Unassigned</span>';
        let actionBtn = `<button class="btn icon-btn" title="Allocate Room" onclick="promptAllocation('${s.id}')"><i class="fa-solid fa-bed"></i></button>`;
        
        if (s.roomId) {
            const room = appData.rooms.find(r => r.id === s.roomId);
            roomAssignment = room ? `<span class="badge badge-info">Room ${room.number}</span>` : 'Unknown';
            actionBtn = `<button class="btn icon-btn" title="Remove Room" onclick="removeAllocation('${s.id}')"><i class="fa-solid fa-arrow-right-from-bracket"></i></button>
                         <button class="btn icon-btn" title="Change Room" onclick="promptAllocation('${s.id}')"><i class="fa-solid fa-repeat"></i></button>`;
        }

        tbody.innerHTML += `
            <tr>
                <td>#...${s.id.substr(s.id.length - 4)}</td>
                <td><strong>${s.name}</strong></td>
                <td>${s.contact}</td>
                <td>${roomAssignment}</td>
                <td>${actionBtn}</td>
            </tr>
        `;
    });
}

function renderRooms() {
    const grid = document.getElementById('rooms-grid');
    grid.innerHTML = '';
    
    appData.rooms.forEach(r => {
        let occupancyClass = 'empty';
        if (r.occupants.length === r.capacity) occupancyClass = 'full';
        else if (r.occupants.length > 0) occupancyClass = 'partial';

        let occupantNames = r.occupants.map(id => {
            const s = appData.students.find(st => st.id === id);
            return s ? s.name : 'Unknown';
        }).join(', ');
        
        if(occupantNames === '') occupantNames = 'Empty';

        grid.innerHTML += `
            <div class="room-card ${occupancyClass}">
                <div class="room-header">
                    <span class="room-number">Room ${r.number}</span>
                    <span class="badge ${occupancyClass === 'full' ? 'badge-danger' : occupancyClass === 'partial' ? 'badge-warning' : 'badge-success'}">${r.occupants.length}/${r.capacity}</span>
                </div>
                <div class="room-occupants">
                    <i class="fa-solid fa-users"></i> ${occupantNames}
                </div>
            </div>
        `;
    });
}

function renderFees() {
    const tbody = document.getElementById('fees-table-body');
    tbody.innerHTML = '';
    
    appData.students.forEach(s => {
        const balance = s.feeDue - s.feePaid;
        let statusBadge = balance <= 0 ? '<span class="badge badge-success">Paid</span>' : '<span class="badge badge-danger">Pending</span>';
        
        tbody.innerHTML += `
            <tr>
                <td><strong>${s.name}</strong></td>
                <td>$${s.feeDue}</td>
                <td>$${s.feePaid}</td>
                <td>${statusBadge}</td>
                <td>
                    ${balance > 0 ? `<button class="btn icon-btn" title="Pay Fee" onclick="payFee('${s.id}')"><i class="fa-solid fa-money-bill"></i></button>` : ''}
                </td>
            </tr>
        `;
    });
}

function renderIssues() {
    const list = document.getElementById('issues-list');
    list.innerHTML = '';
    
    if(appData.issues.length === 0) {
        list.innerHTML = '<p style="color: var(--text-muted);">No issues reported.</p>';
        return;
    }

    appData.issues.forEach(i => {
        const room = appData.rooms.find(r => r.id === i.roomId);
        const roomIdentifier = room ? `Room ${room.number}` : 'Unknown Room';
        const isResolved = i.status === 'Resolved';
        
        list.innerHTML += `
            <div class="issue-item" style="opacity: ${isResolved ? '0.6' : '1'}">
                <div class="issue-details">
                    <h4>${roomIdentifier}</h4>
                    <p>${i.desc}</p>
                    <span class="badge ${isResolved ? 'badge-success' : 'badge-warning'}" style="margin-top: 8px; display: inline-block;">${i.status}</span>
                </div>
                <div>
                     ${!isResolved ? `<button class="btn icon-btn" title="Mark Resolved" onclick="resolveIssue('${i.id}')"><i class="fa-solid fa-check"></i></button>` : ''}
                     <button class="btn icon-btn" title="Delete" onclick="deleteIssue('${i.id}')"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
        `;
    });
}

function populateRoomSelect(selectId) {
    const select = document.getElementById(selectId);
    select.innerHTML = '<option value="">Select a room...</option>';
    appData.rooms.forEach(room => {
        select.innerHTML += `<option value="${room.id}">Room ${room.number}</option>`;
    });
}


// Initial Render Call
document.querySelector('.nav-links li.active').click(); 
updateDashboard();
