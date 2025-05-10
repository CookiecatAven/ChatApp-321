/**
 * Updates the UI to reflect the authentication state of the user.
 * Toggles visibility of elements based on whether the user is logged in.
 * Updates user avatar and name information in the UI if the user is authenticated.
 */
function updateUIForAuthenticatedUser() {
  const userLoggedIn = !!user;
  document.getElementById('user-info-container').classList.toggle('hidden', !userLoggedIn);
  document.getElementById('sign-in-button-background').classList.toggle('hidden', userLoggedIn);

  // Update user avatar and name
  document.getElementById('user-avatar').src = user?.picture ?? '';
  document.getElementById('user-name').textContent = user?.name ?? '';
}

function displayEditUserNameForm(showForm = true) {
  document.getElementById('user-name-input').value = user?.name ?? '';
  document.getElementById('user-info').classList.toggle('hidden', showForm);
  document.getElementById('user-info-form').classList.toggle('hidden', !showForm);
}

function handleUserNameFormSubmit(e) {
  e.preventDefault();
  const newName = document.getElementById('user-name-input').value;
  socket.send(JSON.stringify({
    type: 'update-name',
    data: {name: newName}
  }));
  e.target.remove();
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('edit-name-button').addEventListener('click', displayEditUserNameForm);
  document.getElementById('cancel-edit-name-button').addEventListener('click', () => displayEditUserNameForm(false));
  document.getElementById('user-info-form').addEventListener('submit', handleUserNameFormSubmit);
});