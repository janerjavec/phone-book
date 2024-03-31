"use strict";

let idCount = parseInt(localStorage.getItem("idCount")) || 1;

function domRemoveParticipant(event) {
    const row = event.target.parentElement;
    
    if (confirm("Are you sure you want to delete " + row.cells[1].textContent + "?")) {
        row.parentElement.deleteRow(row.rowIndex);
        updateLocalStorage();
    }
}

function domAddParticipant(participant) {
    const row = document.getElementById("participant-table").insertRow(-1); //dodamo vrstico
    
    const id1 = row.insertCell(0);
    id1.textContent = participant.id;
    id1.style.display = "none"; //skrijemo pogled id-ja
    
    row.insertCell(1).textContent = participant.first; //firstName
    row.insertCell(2).textContent = participant.last; //lastName
    row.insertCell(3).textContent = participant.role; //role
    
    row.addEventListener("dblclick", domRemoveParticipant);
}

function addParticipant(event) {
    // TODO: Get values
    const first = document.getElementById("first").value;
    const last = document.getElementById("last").value;
    const role = document.getElementById("role").value;
    
    // TODO: Set input fields to empty values
    document.getElementById("first").value = "";
    document.getElementById("last").value = "";

    if (first.trim() === "" || last.trim() === "") {
        alert("Please provide both first name and last name.");
        return;
    }
    
    // Create participant object
    const participant = {
        id: idCount,
        first: first,
        last: last,
        role: role
    };
    idCount++;

    // Add participant to the HTML
    domAddParticipant(participant);

    // Move cursor to the first name input field
    document.getElementById("first").focus();

    updateLocalStorage();
}

function updateLocalStorage() {
    const participants = [];
    document.querySelectorAll("#participant-table tr").forEach((row, index) => {
        if (index !== 0) {
            const participant = {
                id: parseInt(row.cells[0].textContent),
                first: row.cells[1].textContent,
                last: row.cells[2].textContent,
                role: row.cells[3].textContent
            };
            participants.push(participant);
        }
    });
    localStorage.setItem("participants", JSON.stringify(participants));
    
    //ce so vsi elementi zbrisani se id resetira nazaj na 1
    if (!document.getElementById("participant-table").querySelector("tr:nth-child(n+2)")) {
        idCount = 1;
    }
    localStorage.setItem("idCount", idCount);
}

document.addEventListener("DOMContentLoaded", () => {
    // This function is run after the page contents have been loaded
    // Put your initialization code here
    const saved = JSON.parse(localStorage.getItem("participants")) || [];
    saved.forEach(participant => {
        domAddParticipant(participant);
    });
    document.getElementById("addButton").addEventListener("click", addParticipant);
});


let sortByFirstNameAsc = true;

function sortTableByFirstName() {
    const table = document.getElementById("participant-table");
    const rows = Array.from(table.querySelectorAll("tr")).slice(1); // Exclude the header row

    rows.sort((a, b) => {
        const nameA = a.cells[1].textContent.toUpperCase();
        const nameB = b.cells[1].textContent.toUpperCase();
        if (sortByFirstNameAsc) {
            if (nameA < nameB) {
                return -1;
            }
            if (nameA > nameB) {
                return 1;
            }
            return 0;
        } else {
            if (nameA > nameB) {
                return -1;
            }
            if (nameA < nameB) {
                return 1;
            }
            return 0;
        }
    });

    // Remove existing rows
    while (table.rows.length > 1) {
        table.deleteRow(1);
    }

    // Append sorted rows
    rows.forEach(row => {
        table.appendChild(row);
    });

    // Toggle sorting order for the next click
    sortByFirstNameAsc = !sortByFirstNameAsc;

    // Update sort indicator arrow
    const sortIndicator = document.getElementById("sortIndicator");
    sortIndicator.textContent = sortByFirstNameAsc ? "↓" : "↑";
}