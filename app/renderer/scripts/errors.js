function showError(message) {
    // Create the error message element
    const errorElement = document.createElement('div');
    errorElement.textContent = message;
    errorElement.style.position = 'fixed';
    errorElement.style.top = '110px';
    errorElement.style.right = 'auto';
    errorElement.style.left = '-100%';
    errorElement.style.transform = 'translateY(-50%)';
    errorElement.style.backgroundColor = 'red';
    errorElement.style.color = 'white';
    errorElement.style.padding = '10px';
    errorElement.style.borderRadius = '5px';
    errorElement.style.transition = 'left 0.5s ease-in-out';

    // Append the error message to the body
    document.body.appendChild(errorElement);

    // Trigger the animation to slide in
    setTimeout(() => {
        errorElement.style.left = '10px';
    }, 100);

    // Remove the error message after a few seconds
    setTimeout(() => {
        errorElement.style.left = '-100%';
        setTimeout(() => {
            document.body.removeChild(errorElement);
        }, 500);
    }, 2500);
}

module.exports = {
    showError,
};