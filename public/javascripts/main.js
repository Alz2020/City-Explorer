const dataPopUrl = 'https://countriesnow.space/api/v0.1/countries/population/cities';
const dataFlaUrl = 'https://countriesnow.space/api/v0.1/countries/info?returns=currency,flag,unicodeFlag,dialCode';
const dataPosUrl = 'https://countriesnow.space/api/v0.1/countries/positions';
document.getElementById('searchBtn').addEventListener('click', async () => {
    const cityInput = document.getElementById('cityInput').value.trim();
    const cityInfoDiv = document.getElementById('cityInfoDiv');
    cityInfoDiv.innerHTML = "";
    if (!cityInput) {
        alert('Please enter a city name.');
        return;
    }
    cityInfoDiv.innerHTML = "Loading...";
    try {
        const [data1, data2, data3] = await Promise.all([
            fetch(dataPopUrl).then(res => res.json()),
            fetch(dataFlaUrl).then(res => res.json()),
            fetch(dataPosUrl).then(res => res.json())
        ]);
        const cityData = data1.data.find(item => item.city.toLowerCase().startsWith(cityInput.toLowerCase()));
        if (!cityData) {
            cityInfoDiv.innerHTML = `<p style="color: red;">City not found.</p>`;
            return;
        }
        const latestPopulation = cityData.populationCounts?.length
            ? `Year ${cityData.populationCounts.at(-1).year}: ${cityData.populationCounts.at(-1).value}`
            : 'N/A';
        const countryData = data2.data.find(country => country.name.toLowerCase() === cityData.country.toLowerCase());
        cityInfoDiv.innerHTML = `
            <h2>City Information</h2>
            <table class="city-info-table">
                <thead>
                    <tr>
                        <th>City</th>
                        <th>Country</th>
                        <th>Latest Population</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>${cityData.city || 'N/A'}</td>
                        <td>${cityData.country || 'N/A'}</td>
                        <td>${latestPopulation}</td>
                    </tr>
                </tbody>
            </table>
            ${countryData ? `
                <h2>Country Information</h2>
                <p>Currency: ${countryData.currency}</p>
                <p>Flag: <img src="${countryData.flag}" alt="Flag of ${countryData.name}" style="width: 50px; height: auto;" /></p>
                <p>Unicode Flag: ${countryData.unicodeFlag}</p>
                <p>Dial Code: ${countryData.dialCode}</p>
            ` : ''}
        `;
    } catch (error) {
        console.error('Error:', error);
        cityInfoDiv.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
    }
});
async function handleCityAction(url, method, payload) {
    try {
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        alert(result.message || "Action completed.");
    } catch (error) {
        console.error(error);
        alert("Failed to perform action.");
    }
}
document.querySelectorAll('.city').forEach(cityEl => {
    cityEl.addEventListener('click', () => {
        document.getElementById('cityInput').value = cityEl.alt;
        document.getElementById('searchBtn').click();
        window.scrollTo(0, 0);
    });
});
