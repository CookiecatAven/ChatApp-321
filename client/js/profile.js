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
