document.addEventListener('DOMContentLoaded', function () {
    const gallery = document.getElementById('gallery');
    const addCraftButton = document.getElementById('addCraftButton');
    const craftModal = document.getElementById('craftModal');
    const closeCraftModal = document.getElementsByClassName('close')[0]; 
    const addSupplyButton = document.getElementById('addSupply');
    const craftImageInput = document.getElementById('craftImage');
    const craftForm = document.getElementById('craftForm');
    const cancelCraftButton = document.getElementById('cancelCraft'); 
    const craftDetailModal = document.getElementById('craftDetailModal');
    const closeCraftDetailModal = document.getElementsByClassName('close')[1];
    const previewImage = document.getElementById('previewImage');
    let editingCraft = null; 

    // Function to add or update a craft thumbnail in the gallery
    function addOrUpdateCraftInGallery(craft) {
        let img = document.getElementById(`craft-${craft.id}`);
        if (!img) { 
            img = document.createElement('img');
            img.id = `craft-${craft.id}`;
            img.className = 'craft-image';
            img.addEventListener('click', () => showCraftDetails(craft));
            gallery.appendChild(img);
        }
        img.src = `/images/crafts/${craft.image}`;
        img.alt = craft.name;
    }

    // Show craft details in a modal
    function showCraftDetails(craft) {
        const craftDetailTitle = document.getElementById('craftDetailTitle');
        const craftDetailDescription = document.getElementById('craftDetailDescription');
        const craftDetailSupplies = document.getElementById('craftDetailSupplies');
        const editCraftButton = document.createElement('button');
        editCraftButton.innerText = 'Edit';
        const deleteCraftButton = document.createElement('button');
        deleteCraftButton.innerText = 'Delete';

        craftDetailTitle.textContent = craft.name;
        craftDetailDescription.textContent = craft.description;
        craftDetailSupplies.innerHTML = craft.supplies.map(supply => `<li>${supply}</li>`).join('');

        editCraftButton.addEventListener('click', () => {
            craftDetailModal.style.display = 'none';
            openCraftModal(true, craft);
        });
        deleteCraftButton.addEventListener('click', () => deleteCraft(craft.id));

        craftDetailModal.innerHTML = ''; // Clear the current modal content
        craftDetailModal.appendChild(craftDetailTitle);
        craftDetailModal.appendChild(craftDetailDescription);
        craftDetailModal.appendChild(craftDetailSupplies);
        craftDetailModal.appendChild(editCraftButton);
        craftDetailModal.appendChild(deleteCraftButton);

        craftDetailModal.style.display = 'block';
    }

    // Fetch and display crafts from the server
    function fetchAndDisplayCrafts() {
        fetch('/api/crafts')
            .then(response => response.json())
            .then(crafts => {
                gallery.innerHTML = ''; 
                crafts.forEach(addOrUpdateCraftInGallery);
            })
            .catch(error => console.error('Error fetching crafts:', error));
    }

    // Open the modal for adding or editing crafts
    function openCraftModal(editMode = false, craft = {}) {
        craftModal.style.display = 'block';
        craftForm.reset();
        previewImage.style.display = 'none';
        editingCraft = editMode ? craft : null; 

        if (editMode && craft) {
            document.getElementById('craftName').value = craft.name;
            document.getElementById('craftDescription').value = craft.description;
            // Populate other fields as needed
        }
    }

    addSupplyButton.addEventListener('click', () => {
        const newSupplyInput = document.createElement('input');
        newSupplyInput.type = 'text';
        newSupplyInput.name = 'supplies[]';
        document.getElementById('supplyInputs').appendChild(newSupplyInput);
    });

    craftImageInput.addEventListener('change', function () {
        if (this.files && this.files[0]) {
            const reader = new FileReader();
            reader.onload = e => {
                previewImage.src = e.target.result;
                previewImage.style.display = 'block';
            };
            reader.readAsDataURL(this.files[0]);
        }
    });

    craftForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const formData = new FormData(this);

        const method = editingCraft ? 'PUT' : 'POST';
        const endpoint = editingCraft ? `/api/crafts/${editingCraft.id}` : '/api/crafts';

        fetch(endpoint, {
            method: method,
            body: formData,
        })
        .then(response => response.json())
        .then(craft => {
            craftModal.style.display = 'none';
            addOrUpdateCraftInGallery(craft); 
        })
        .catch(error => console.error('Error:', error));
    });

    

    function deleteCraft(craftId) {
        if (confirm('Are you sure you want to delete this craft?')) {
            fetch(`/api/crafts/${craftId}`, {
                method: 'DELETE',
            })
            .then(() => {
                document.getElementById(`craft-${craftId}`).remove(); 
                craftDetailModal.style.display = 'none'; 
            })
            .catch(error => console.error('Error:', error));
        }
    }

    [closeCraftModal, cancelCraftButton, closeCraftDetailModal].forEach(element => {
        element.addEventListener('click', () => {
            craftModal.style.display = 'none';
            craftDetailModal.style.display = 'none';
        });
    });

    fetchAndDisplayCrafts(); 
});
