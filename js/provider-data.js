async function updateProviderData() {
    try {
        const response = await fetch('http://localhost:3000/api/provider-data');
        const data = await response.json();
        
        // Update prices and other data on the page
        data.forEach(provider => {
            // Find all elements with the data-provider and data-field attributes
            const elements = document.querySelectorAll(`[data-provider="${provider.provider}"]`);
            
            elements.forEach(element => {
                const field = element.getAttribute('data-field');
                if (field && provider[field]) {
                    // Update the content
                    element.textContent = provider[field];
                }
            });
        });
    } catch (error) {
        console.error('Error updating provider data:', error);
    }
}

// Update data when page loads
document.addEventListener('DOMContentLoaded', updateProviderData);

// Update data every 5 minutes
setInterval(updateProviderData, 5 * 60 * 1000);
