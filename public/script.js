function handleCredentialResponse(response) {    
    fetch('/auth/google', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({token: response.credential}),
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            document.getElementById('login-container').style.display = 'none';
            document.getElementById('welcome-container').style.display = 'block';
            document.getElementById('welcome-message').textContent = `Welcome ${data.name}! | Email: ${data.email}`;
        } else {
            console.error('Login failed:', data.message);
            alert('Login failed. Please try again.');
        }
    })
    .catch((error) => {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    });
}

function handleLogout() {
    fetch('/logout', { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                document.getElementById('login-container').style.display = 'block';
                document.getElementById('welcome-container').style.display = 'none';
                document.getElementById('welcome-message').textContent = '';
            } else {
                console.error('Logout failed:', data.message);
                alert('Logout failed. Please try again.');
            }
        })
        .catch((error) => {
            console.error('Logout error:', error);
            alert('An error occurred during logout. Please try again.');
        });
}

window.onload = function () {
    google.accounts.id.initialize({
        client_id: "564507615020-5a6gc9r1qn4sp1qjontrjh214list2bn.apps.googleusercontent.com",
        callback: handleCredentialResponse
    });
    
    google.accounts.id.renderButton(
        document.getElementById("g_id_signin"),
        { theme: "outline", size: "large" }
    );
    
    document.getElementById('logout-button').addEventListener('click', handleLogout);

    // Check if user is already logged in
    fetch('/user')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                document.getElementById('login-container').style.display = 'none';
                document.getElementById('welcome-container').style.display = 'block';
                
                const welcomeMessage = document.getElementById('welcome-message');
                welcomeMessage.textContent = `Welcome back ${data.name}! | Email: ${data.email}`;
            }                           
        })
        .catch(error => console.error('Error checking user status:', error));
};
