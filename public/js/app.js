// Fonction pour charger les utilisateurs
function loadUsers() {
  fetch('/users')
      .then(response => response.json())
      .then(users => {
          const userTable = document.getElementById('user-table');
          userTable.innerHTML = ''; // Effacer le tableau existant

          if (users.length === 0) {
              // Afficher un message si aucun utilisateur
              userTable.innerHTML = `
                  <tr>
                      <td colspan="5" class="text-center text-gray-500 p-4">
                          Aucun utilisateur n'est ajouté.
                      </td>
                  </tr>
              `;
          } else {
              users.forEach((user, index) => {
                  userTable.innerHTML += `
        <tr>
            <!-- ID Column -->
            <td class="border px-4 py-2">${index + 1}</td>

            <!-- Checkbox Column -->
            <td class="border px-4 py-2">
                <input type="checkbox" class="select-checkbox" onclick="handleCheckboxChange(this, ${index})" />
            </td>

            <!-- First Name Column -->
            <td class="border px-4 py-2 editable" data-field="firstName">${user.firstName}</td>

            <!-- Last Name Column -->
            <td class="border px-4 py-2 editable" data-field="lastName">${user.lastName}</td>

            <!-- Email Column -->
            <td class="border px-4 py-2 editable" data-field="email">${user.email}</td>

            <!-- Actions Column -->
            <td class="border px-4 py-2">
                <button class="bg-yellow-500 text-white p-1 rounded" onclick="editUser(${index})" disabled>Modifier</button>
                <button class="bg-red-500 text-white p-1 rounded" onclick="deleteUser(${index})">Supprimer</button>
            </td>
        </tr>
                  `;
              });
          }
      })
      .catch(error => {
          console.error('Erreur de chargement des utilisateurs :', error);
      });
}

document.addEventListener('DOMContentLoaded', loadUsers);

// Gérer les changements de sélection des cases à cocher
function handleCheckboxChange(checkbox, index) {
  // Désactiver toutes les autres cases à cocher
  const allCheckboxes = document.querySelectorAll('.select-checkbox');
  allCheckboxes.forEach((box, idx) => {
    if (idx !== index) {
      box.checked = false;
      box.disabled = checkbox.checked; // Désactiver les autres cases si celle-ci est cochée
    }
  });

  const row = checkbox.closest('tr');
  const isChecked = checkbox.checked;

  // Activer les champs de saisie si la case est cochée
  if (isChecked) {
    row.querySelectorAll('.editable').forEach(span => {
      const value = span.textContent;
      const field = span.getAttribute('data-field');
      span.innerHTML = `<input type="text" class="p-2 border rounded" value="${value}" data-field="${field}">`;
    });
    
    // Activer le bouton Modifier
    row.querySelector('button').disabled = false;
  } else {
    // Revenir aux spans normaux si on décoche
    row.querySelectorAll('.editable').forEach(span => {
      const input = span.querySelector('input');
      span.textContent = input.value;
    });
    
    // Désactiver le bouton Modifier
    row.querySelector('button').disabled = true;
  }
}

// Fonction pour modifier l'utilisateur sélectionné
function editUser(index) {
  const row = document.querySelectorAll('tbody tr')[index];
  const updatedUser = {};
  
  // Récupérer les nouvelles valeurs des champs
  row.querySelectorAll('.editable input').forEach(input => {
    const field = input.getAttribute('data-field');
    updatedUser[field] = input.value.trim();
  });

  // Envoyer la requête PUT pour modifier l'utilisateur
  fetch(`/update/${index}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedUser),
  })
  .then(response => {
      if (response.ok) {
        loadUsers(); // Recharger la liste des utilisateurs après modification
      } else {
        console.error('Erreur lors de la modification de l\'utilisateur');
      }
  })
  .catch(error => console.error('Erreur réseau :', error));
}

// Soumission du formulaire pour ajouter un utilisateur
document.getElementById('user-form').addEventListener('submit', function (e) {
  e.preventDefault();

  const firstName = document.getElementById('firstName').value.trim();
  const lastName = document.getElementById('lastName').value.trim();
  const email = document.getElementById('email').value.trim();
  
  if (!firstName || !lastName || !email) {
      alert("Veuillez remplir tous les champs.");
      return;
  }

  const user = { firstName, lastName, email };

  fetch('/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
  })
  .then(response => {
      if (response.ok) {
          loadUsers();
          document.getElementById('user-form').reset();
      } else {
          console.error('Erreur lors de l\'ajout de l\'utilisateur');
      }
  })
  .catch(error => console.error('Erreur réseau :', error));
});

// Fonction pour supprimer l'utilisateur
function deleteUser(index) {
  if (confirm("Voulez-vous vraiment supprimer cet utilisateur ?")) {
    fetch(`/delete/${index}`, { method: 'DELETE' })
      .then(response => {
        if (response.ok) {
          loadUsers(); // Recharger la liste des utilisateurs après suppression
        } else {
          console.error('Erreur lors de la suppression de l\'utilisateur');
        }
      })
      .catch(error => console.error('Erreur réseau :', error));
  }
}
