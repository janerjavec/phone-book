document.addEventListener('DOMContentLoaded', function() {
    window.addEventListener('resize', function() {
        const createContactBtn = document.getElementById('create-contact-btn');
        const sourcesBtn = document.getElementById('sources-link');
        if (window.innerWidth <= 992) {
            createContactBtn.textContent = '+';
            sourcesBtn.textContent = 'ⓘ';
            document.getElementById('search-bar').style.transition = "none";
            document.getElementById('search-bar').style.width = "100%";
        } else {
            createContactBtn.textContent = 'Add Contact';
            sourcesBtn.textContent = 'Sources';
            document.getElementById('search-bar').style.transition = "none";
            document.getElementById('search-bar').style.width = "calc(100% - 80px)";
        }
        setTimeout(function() {
        document.getElementById('search-bar').style.transition = 'width 0.1s ease';
        }, 10);
    });
    window.dispatchEvent(new Event('resize'));
});

    let addresses = [];

    // load from local storage
    window.onload = function() {
        const cancelBtn = document.getElementById('cancel-search-btn');
        cancelBtn.addEventListener('click', function() {
            cancelBtn.style.display = 'none';
            if (window.innerWidth >= 993) document.getElementById('search-bar').style.width = "calc(100% - 80px)";
            else document.getElementById('search-bar').style.width = "100%";
        });

        if (localStorage.getItem('addresses')) {
            addresses = JSON.parse(localStorage.getItem('addresses'));
            displayAddresses();
            updateSearchPlaceholder();
        }
        
    };

    function updateSearchPlaceholder() {
        const searchInput = document.getElementById('search-bar');
        searchInput.placeholder = `Search ${addresses.length} contacts`;
    }

    function displayAddresses() {
        // clear
        document.getElementById('contact-container').innerHTML = '';
        document.getElementById('right-container').innerHTML = '';
        // sort
        addresses.sort((a, b) => a.name.localeCompare(b.name));

        // letters
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

            const contactItem = document.createElement('div');
            contactItem.className = 'contact-item';
            contactItem.textContent = address.name;
            letterBlock.appendChild(contactItem);

            const details = document.createElement('div');
            details.className = 'contact-details';
            details.id = `details-${index}`;

            // check if contact has email info
            let emailContent = '';
            if (address.email.trim() !== '') {
                emailContent = `<p><strong>Email:</strong> ${address.email}</p>`;
            }

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
                allContactItems.forEach(item => item.classList.remove('selected-contact'));
                if (window.innerWidth <= 992) toggleDetails(details);
                if (!isSelected) {
                    contactItem.classList.add('selected-contact');
                    if (window.innerWidth >= 993) displayContactDetails(address);
                } else document.getElementById('right-container').innerHTML = '';
            };
            document.getElementById('contact-container').appendChild(contactItem);
        });
    }


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

    let contactIndex;

    function editContact(index) {
        contactIndex = index;
        const contact = addresses[index];
        document.getElementById('editNameInput').value = contact.name;
        document.getElementById('editPhoneInput').value = contact.phone;
        document.getElementById('editEmailInput').value = contact.email;
        document.getElementById('edit-contact-form').style.display = 'block';
    }
    function closeEditForm() {
        document.getElementById('edit-contact-form').style.display = 'none';
        // clear input fields
        document.getElementById('editNameInput').value = '';
        document.getElementById('editPhoneInput').value = '';
        document.getElementById('editEmailInput').value = '';
    }
    function updateContact() {
        const name = document.getElementById('editNameInput').value;
        const phone = document.getElementById('editPhoneInput').value;
        const email = document.getElementById('editEmailInput').value;

        if (name && phone) {
            if (phone.startsWith('0')) {
                document.getElementById('editPhoneError').style.display = 'none';
                const updatedAddress = { name, phone, email };
                addresses[contactIndex] = updatedAddress;
                saveAddressesToLocalStorage();
                displayAddresses();
                closeEditForm();
            } else {
                document.getElementById('editPhoneError').style.display = 'block';
            }
        } else {
            alert('Please fill in all fields.');
        }
    }

    function openForm() {
        document.getElementById('create-contact-form').style.display = 'block';
    }
    function closeForm() {
        document.getElementById('create-contact-form').style.display = 'none';
        clearInputFields(); // clear input when closing form
    }

    function clearInputFields() {
        document.getElementById('nameInput').value = '';
        document.getElementById('phoneInput').value = '';
        document.getElementById('emailInput').value = '';
    }

    function addAddress() {
        const name = document.getElementById('nameInput').value;
        const phone = document.getElementById('phoneInput').value;
        const email = document.getElementById('emailInput').value;

        // email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isEmailValid = email.trim() === '' || emailRegex.test(email);

        if (name && phone && isEmailValid) { // check if name, phone, and email format are valid
            if (phone.startsWith('0')) {
                document.getElementById('phoneError').style.display = 'none';
                const newAddress = { name, phone, email };
                addresses.push(newAddress);
                saveAddressesToLocalStorage();
                displayAddresses();
                closeForm();
            } else {
                document.getElementById('phoneError').style.display = 'block';
            }
        } else {
            if (!isEmailValid) alert('Please enter a valid email address.');
            else alert('Please fill in the name and phone number.');
        }
        updateSearchPlaceholder();
    }
    function saveAddressesToLocalStorage() {
        localStorage.setItem('addresses', JSON.stringify(addresses));
    }
    function formatPhoneNumber(input) {
        let cleaned = input.value.replace(/\D/g, '');
        if (cleaned.length > 9) cleaned = cleaned.slice(0, 9);
        const formatted = cleaned.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
        input.value = formatted;
        if (input.value.charAt(0) !== '0' && input.value !== '') document.getElementById('phoneError').textContent = 'Number must start with 0';
        else document.getElementById('phoneError').textContent = ''; // clear error message
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
        const matchingAddresses = addresses.filter(address => 
            address.name.toLowerCase().includes(searchValue) ||
            address.phone.toLowerCase().includes(searchValue) ||
            address.email.toLowerCase().includes(searchValue)
        );
        // clear previous content
        document.getElementById('contact-container').innerHTML = '';

        if (matchingAddresses.length > 0) {
            matchingAddresses.forEach(address => {
                const contactItem = document.createElement('div');
                contactItem.className = 'contact-item';
                contactItem.textContent = address.name;
                document.getElementById('contact-container').appendChild(contactItem);

                const details = document.createElement('div');
                details.className = 'contact-details';
                details.id = `details-${addresses.indexOf(address)}`;
                details.innerHTML = `
                    <p><strong>Phone:</strong> ${address.phone}</p>
                    <p><strong>Email:</strong> ${address.email}</p>
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
                    const phoneParts = address.phone.split(searchValue);
                    const formattedPhone = phoneParts.join(`<strong>${searchValue}</strong>`);
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

                contactItem.onclick = function() {
                    if (window.innerWidth >= 993) {
                        document.getElementById('right-container').innerHTML = '';
                        displayContactDetails(address);
                    }
                    else{
                        if (details.style.display === 'block') {
                            // if details visible, hide them and show phone,email
                            toggleDetails(details);
                            if (phoneHighlight) phoneHighlight.style.display = 'block';
                            if (emailHighlight) emailHighlight.style.display = 'block';
                        } else {
                            // if details hidden, show them and hide phone,email
                            toggleDetails(details);
                            if (phoneHighlight) phoneHighlight.style.display = 'none';
                            if (emailHighlight) emailHighlight.style.display = 'none';
                        }
                    }
                };
            });
        } else {
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
