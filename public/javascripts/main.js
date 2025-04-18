// Define APIs
const dataPopUrl = 'https://countriesnow.space/api/v0.1/countries/population/cities';
const dataFlaUrl = 'https://countriesnow.space/api/v0.1/countries/info?returns=currency,flag,unicodeFlag,dialCode';
const dataPosUrl = 'https://countriesnow.space/api/v0.1/countries/positions';

//using trim method 
document.getElementById('searchBtn').addEventListener('click', async () => {
    const cityInput = document.getElementById('cityInput').value.trim();
    const cityInfoDiv = document.getElementById('cityInfoDiv');

    // Clear previous data
    cityInfoDiv.innerHTML = "";

    // Validate input
    if (!cityInput) {
        alert('Please enter a city name.');
        return
    }

    cityInfoDiv.innerHTML = "Loading...";

    // create an array to fetch
    const fetchRequests = [
        fetch(dataPopUrl).then(response => response.json()),
        fetch(dataFlaUrl).then(response => response.json()),
        fetch(dataPosUrl).then(response => response.json())
    ];
// promise all method
    try {
        const [data1, data2, data3] = await Promise.all(fetchRequests);

        //  JSON responses
        const cityData = data1.data.find(data => data.city.toLowerCase().startsWith(cityInput.toLowerCase()));
        if (!cityData) {
            cityInfoDiv.innerHTML = `<p style="color: red;">City not found.</p>`;
            return;
        }

// get the latest year's population count 
const latestPopulation = cityData.populationCounts?.length
    ? `Year ${cityData.populationCounts[cityData.populationCounts.length -1].year}: ${cityData.populationCounts[cityData.populationCounts.length -1].value}`
    :'N/A';
        // Display the city information in a table
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
        `;

// Display additional country information
        const countryData = data2.data.find(country => country.name.toLowerCase() === cityData.country.toLowerCase());
        if (countryData) {
            cityInfoDiv.innerHTML += `
                <h2>Country Information</h2>
                <p>Currency: ${countryData.currency}</p>
                <p>Flag: <img src="${countryData.flag}" alt="Flag of ${countryData.name}" style="width: 50px; height: auto;"/></p>
                <p>Unicode Flag: ${countryData.unicodeFlag}</p>
                <p>Dial Code: ${countryData.dialCode}</p>
            `;
        }
//handling error
    } catch (error) {
        console.error('Error:', error);
        cityInfoDiv.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
    }
});

let city = document.querySelectorAll('.city');
let cityInput= document.getElementById('cityInput');
for(let i =0;i<=city.length;i++){
    if(city[i])
    city[i].addEventListener('click', function() {
        console.log('yes', city[i].alt)
        cityInput.value = city[i].alt;
        searchBtn.click();
        scrollTo(0,0);
    })
}




