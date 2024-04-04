document.addEventListener('DOMContentLoaded', function() { // loads html content before running script
    window.addEventListener('resize', function() {
        const createContactBtn = document.getElementById('create-contact-btn');
        const sourcesBtn = document.getElementById('sources-link');
        if (window.innerWidth <= 992) { // mobile view
            createContactBtn.textContent = '+';
            sourcesBtn.textContent = 'ⓘ';
            document.getElementById('search-bar').style.transition = "none";
            document.getElementById('search-bar').style.width = "100%";
        } else { // desktop view
            createContactBtn.textContent = 'Add Contact';
            sourcesBtn.textContent = 'Sources';
            document.getElementById('search-bar').style.transition = "none";
            document.getElementById('search-bar').style.width = "calc(100% - 80px)";
        }
        setTimeout(function() { // reset transition
            document.getElementById('search-bar').style.transition = 'width 0.1s ease';
        }, 10);
    });
    window.dispatchEvent(new Event('resize'));
});

let addresses = [];

window.onload = function() {
    const cancelBtn = document.getElementById('cancel-search-btn');
    cancelBtn.addEventListener('click', function() {
        cancelBtn.style.display = 'none';
        if (window.innerWidth >= 993) document.getElementById('search-bar').style.width = "calc(100% - 80px)";
        else document.getElementById('search-bar').style.width = "100%";
    });
    // local storage
    if (localStorage.getItem('addresses')) {
        addresses = JSON.parse(localStorage.getItem('addresses'));
        displayAddresses();
        updateSearchPlaceholder();
    }
};

function saveAddressesToLocalStorage() {
    localStorage.setItem('addresses', JSON.stringify(addresses));
}

// displays number of contacts in search placeholder
function updateSearchPlaceholder() {
    const searchBar = document.getElementById('search-bar');
    searchBar.placeholder = `Search ${addresses.length} contacts`;
}

function displayAddresses() {
    // clear before
    document.getElementById('contact-container').innerHTML = '';
    document.getElementById('right-container').innerHTML = '';
    // sort
    addresses.sort((a, b) => a.name.localeCompare(b.name));
    // letter blocks
    let currentLetter = null;
    let letterBlock = null;
    addresses.forEach((address, index) => {
        const firstLetter = address.name.charAt(0).toUpperCase();
        if (firstLetter !== currentLetter) {
            currentLetter = firstLetter;
            letterBlock = document.createElement('div');
            letterBlock.innerHTML = `<div class="letter">${currentLetter}</div>`;
            document.getElementById('contact-container').appendChild(letterBlock);
        }
        // contact item shows only address name
        const contactItem = document.createElement('div');
        contactItem.className = 'contact-item';
        contactItem.textContent = address.name;
        letterBlock.appendChild(contactItem);
        // details
        const details = document.createElement('div');
        details.className = 'contact-details';
        details.id = `details-${index}`; // id for individual contact
        // check if contact has email info
        let emailContent = '';
        if (address.email.trim() !== '') {
            emailContent = `<p><strong>Email:</strong> ${address.email}</p>`;
        }
        // create details
        details.innerHTML = `
            <p><strong>Phone:</strong> ${address.phone}</p>
            ${emailContent}
            <div class="edit-remove-contact">
                <button onclick="editContact(${addresses.indexOf(address)})">Edit</button>
                <button onclick="removeContact(${addresses.indexOf(address)})">Remove</button>
            </div>
        `;
        contactItem.appendChild(details);

        contactItem.onclick = function() {
            const isSelected = contactItem.classList.contains('selected-contact');
            const allContactItems = document.querySelectorAll('.contact-item');
            allContactItems.forEach(item => item.classList.remove('selected-contact')); // resets select
            if (window.innerWidth <= 992) toggleDetails(details); // mobile
            if (!isSelected) {
                contactItem.classList.add('selected-contact'); // selected css
                if (window.innerWidth >= 993) displayContactDetails(address); // displays content
            } else document.getElementById('right-container').innerHTML = ''; // if none is selected, clear the right side
        };
    });
}

// display contact details for desktop version
function displayContactDetails(contact) {
    let details = `<h2>${contact.name}</h2>`;
    // phone
    details += `<p><strong>Phone:</strong> ${contact.phone}</p>`;
    // if contact has email display it
    if (contact.email && contact.email.trim() !== '') details += `<p><strong>Email:</strong> ${contact.email}</p>`;
    // edit, remove button
    details += `
        <div class="edit-remove-contact">
            <button onclick="editContact(${addresses.indexOf(contact)})">Edit</button>
            <button onclick="removeContact(${addresses.indexOf(contact)})">Remove</button>
        </div>
    `;
    // show details on right container
    document.getElementById('right-container').innerHTML = details;
}

function addAddress() {
    const name = document.getElementById('nameInput').value;
    const phone = document.getElementById('phoneInput').value;
    const email = document.getElementById('emailInput').value;

    // email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmailValid = email.trim() === '' || emailRegex.test(email);
    
    // phone format validation
    const phoneRegex = /^0[0-9]{2} [0-9]{3} [0-9]{3}$/;
    const isPhoneValid = phone.trim() === '' || phoneRegex.test(phone);

    const emailError = document.getElementById('emailError');
    if (!isEmailValid) emailError.textContent = 'Please enter a valid email address.';
    else emailError.textContent = '';

    const phoneError = document.getElementById('phoneError');
    if (!isPhoneValid) phoneError.textContent = 'Please enter a valid phone number (0XX XXX XXX).';
    else phoneError.textContent = '';

    if (name && isPhoneValid && isEmailValid) { // check if name, phone, email format are valid
        if (phone.startsWith('0')) {
            phoneError.textContent = '';
            const newAddress = { name, phone, email };
            addresses.push(newAddress); // adds to addresses array
            saveAddressesToLocalStorage();
            displayAddresses();
            closeForm();
        }
    }
    updateSearchPlaceholder();
}

function formatPhoneNumber(input) {
    let cleaned = input.value.replace(/\D/g, '');
    if (cleaned.length > 9) cleaned = cleaned.slice(0, 9);
    const formatted = cleaned.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
    input.value = formatted;
}

let contactIndex;

// function opens the edit contact form in html and auto fills data
function editContact(index) {
    contactIndex = index;
    const contact = addresses[index];
    // fill input fields with addresses[index]'s data
    document.getElementById('editNameInput').value = contact.name;
    document.getElementById('editPhoneInput').value = contact.phone;
    document.getElementById('editEmailInput').value = contact.email;
    document.getElementById('edit-contact-form').style.display = 'block'; // show form
}
function closeEditForm() {
    document.getElementById('edit-contact-form').style.display = 'none'; // hide form
    // clear input fields after closing
    document.getElementById('editNameInput').value = '';
    document.getElementById('editPhoneInput').value = '';
    document.getElementById('editEmailInput').value = '';
}

function updateContact() {
    const name = document.getElementById('editNameInput').value;
    const phone = document.getElementById('editPhoneInput').value;
    const email = document.getElementById('editEmailInput').value;

    // email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmailValid = email.trim() === '' || emailRegex.test(email);
    
    // phone format validation
    const phoneRegex = /^0[0-9]{2} [0-9]{3} [0-9]{3}$/;
    const isPhoneValid = phone.trim() === '' || phoneRegex.test(phone);

    const emailError = document.getElementById('editEmailError');
    if (!isEmailValid) emailError.textContent = 'Please enter a valid email address.';
    else emailError.textContent = '';

    // Display phone number error message
    const phoneError = document.getElementById('editPhoneError');
    if (!isPhoneValid) phoneError.textContent = 'Please enter a valid phone number (0XX XXX XXX).';
    else phoneError.textContent = '';

    if (name && isPhoneValid && isEmailValid) { // check if name, phone, email format are valid
        if (phone.startsWith('0')) {
            phoneError.textContent = '';
            const newAddress = { name, phone, email };
            const updatedAddress = { name, phone, email }; // array with new data
            addresses[contactIndex] = updatedAddress;
            saveAddressesToLocalStorage();
            displayAddresses();
            closeEditForm();
        }
    }
}

function openForm() {
    document.getElementById('create-contact-form').style.display = 'block';
}
function closeForm() {
    document.getElementById('create-contact-form').style.display = 'none';
    // clear input when closing form
    document.getElementById('nameInput').value = '';
    document.getElementById('phoneInput').value = '';
    document.getElementById('emailInput').value = '';
}

function searchContacts() {
    const searchValue = document.getElementById('search-bar').value.toLowerCase();
    const cancelBtn = document.getElementById('cancel-search-btn');
    // show/hide cancel button based on input
    if (searchValue.trim() !== '') {
        cancelBtn.style.display = 'block';
        // if desktop, else mobile
        if (window.innerWidth >= 993) document.getElementById('search-bar').style.width = "calc(100% - 140px)";
        else document.getElementById('search-bar').style.width = "calc(100% - 60px)";
    } else {
        cancelBtn.style.display = 'none';
        // if desktop else mobile
        if (window.innerWidth >= 993) document.getElementById('search-bar').style.width = "calc(100% - 80px)";
        else document.getElementById('search-bar').style.width = "100%";
        cancelSearch();
        return;
    }
    // new array stores only matching addresses
    const matchingAddresses = addresses.filter(address => 
        address.name.toLowerCase().includes(searchValue) ||
        address.phone.toLowerCase().includes(searchValue) ||
        address.email.toLowerCase().includes(searchValue)
    );
    // clear all content when starting search
    document.getElementById('contact-container').innerHTML = '';

    // displays only matching addresses in HTML
    if (matchingAddresses.length > 0) {
        matchingAddresses.forEach(address => {
            const contactItem = document.createElement('div');
            contactItem.className = 'contact-item';
            contactItem.textContent = address.name;
            document.getElementById('contact-container').appendChild(contactItem);

            let emailContent = '';
            if (address.email.trim() !== '') {
                emailContent = `<p><strong>Email:</strong> ${address.email}</p>`;
            }

            const details = document.createElement('div');
            details.className = 'contact-details';
            details.id = `details-${addresses.indexOf(address)}`; // selected contact
            details.innerHTML = `
                <p><strong>Phone:</strong> ${address.phone}</p>
                ${emailContent}
                <div class="remove-contact">
                    <button onclick="editContact(${addresses.indexOf(address)})">Edit</button>
                    <button onclick="removeContact(${addresses.indexOf(address)})">Remove</button>
                </div>
            `;
            contactItem.appendChild(details);

            let phoneHighlight;
            let emailHighlight;
            // highlight matching phone
            if (searchValue && address.phone.toLowerCase().includes(searchValue)) {
                const phoneParts = address.phone.split(searchValue); // 012 345 678 ; "345" - 012, 678
                const formattedPhone = phoneParts.join(`<strong>${searchValue}</strong>`); // 012<strong>345</strong>678
                phoneHighlight = document.createElement('div');
                phoneHighlight.innerHTML = formattedPhone;
                phoneHighlight.style.fontWeight = 'normal';
                phoneHighlight.style.fontSize = '14px';
                contactItem.appendChild(phoneHighlight);
            }

            // highlight matching email
            if (searchValue && address.email.toLowerCase().includes(searchValue)) {
                const emailParts = address.email.split(searchValue);
                const formattedEmail = emailParts.join(`<strong>${searchValue}</strong>`);
                emailHighlight = document.createElement('div');
                emailHighlight.innerHTML = formattedEmail;
                emailHighlight.style.fontWeight = 'normal';
                emailHighlight.style.fontSize = '14px';
                contactItem.appendChild(emailHighlight);
            }
            let isOpened = false; // for mobile
            contactItem.onclick = function() {
                // desktop
                if (window.innerWidth >= 993) {
                    const isSelected = contactItem.classList.contains('selected-contact');
                    const allContactItems = document.querySelectorAll('.contact-item');
                    allContactItems.forEach(item => item.classList.remove('selected-contact')); // resets select
                    if (!isSelected) {
                        contactItem.classList.add('selected-contact'); // selected css
                        if (window.innerWidth >= 993) displayContactDetails(address); // displays content
                    } else document.getElementById('right-container').innerHTML = ''; // if none is selected, clear the right side
                }
                // mobile
                else{
                    if (isOpened) {
                        // if details visible, hide them and show phone,email
                        toggleDetails(details);
                        isOpened=false;
                        console.log("Closed");
                        setTimeout(() => {
                            if (phoneHighlight) phoneHighlight.style.display = 'block';
                            if (emailHighlight) emailHighlight.style.display = 'block';
                        }, 100);
                    } else {
                        // if details hidden, show them and hide phone,email
                        toggleDetails(details);
                        isOpened=true;
                        console.log("Opened");
                        if (phoneHighlight) phoneHighlight.style.display = 'none';
                        if (emailHighlight) emailHighlight.style.display = 'none';
                    }
                }
            };
        });
    } else {
        // if no matching addresses
        document.getElementById('contact-container').innerHTML = '<p>No matching contacts found.</p>';
    }
}

function toggleDetails(details) {
    // if details are already visible, hide them else show details
    if (details.parentElement.classList.contains('open')) details.parentElement.classList.remove('open');
    else details.parentElement.classList.add('open');
}
function removeContact(index) {
    addresses.splice(index, 1);
    localStorage.setItem('addresses', JSON.stringify(addresses));
    displayAddresses();
    updateSearchPlaceholder();
}
function cancelSearch() {
    document.getElementById('search-bar').value = '';
    displayAddresses();
}
