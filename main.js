const axios = require('axios');

const baseUrl = 'https://pokeapi.co/api/v2/pokemon/';
const searchInput = document.getElementById('in1');
const searchButton = document.querySelector('.buttonSearch');
const pokemonName = document.querySelector('.pokemonName');
const pokemonImg = document.querySelector('.pokemonImg');
const pokemonType = document.querySelector('.pokemonType');
const pokemonDescription = document.querySelector('.pokemonDescrition');
const pokemonAbilities = document.querySelector('.pokemonAbilities');
const containerInfo = document.querySelector('.containerInfo');
const containerError = document.querySelector('.containerError');
const containerEvolution = document.querySelector('.containerEvolution');
const buttonEvolution = document.querySelector('.buttonEvolution');

let pokemonData = {};


document.querySelector('.buttonSearch').addEventListener('click', function() {
    let pokemonName = document.getElementById('in1').value.toLowerCase();
    fetchPokemon(pokemonName);
});

async function fetchPokemon(pokemonName) {
    if (pokemonName!== '') {
        try {
            let response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
            pokemonData = response.data;
            displayPokemon(pokemonData);
        } 
        catch (error) {
            document.querySelector('.containerError').style.display = 'flex';
            document.querySelector('.containerInfo').style.display = 'none';
            showError();
        }
    }
};

function showPokemonInfo(pokemonData) {
    pokemonName.textContent = pokemonData.name;
    pokemonImg.src = pokemonData.sprites.front_default;
    pokemonType.textContent = pokemonData.types.map(type => type.type.name).join(', ');
    pokemonDescription.textContent = pokemonData.description;
    pokemonAbilities.textContent = pokemonData.abilities.map(ability => ability.ability.name).join(', ');
    containerInfo.style.display = 'flex';
    containerError.style.display = 'none';
    checkEvolution(pokemonData);
}
  

function displayPokemon(pokemon) {
    document.querySelector('.pokemonName').textContent = pokemon.name;
    document.querySelector('.pokemonImg').src = pokemon.sprites.front_default;
    document.querySelector('.pokemonType').textContent = pokemon.types.map(typeInfo => typeInfo.type.name).join(', ');
    document.querySelector('.pokemonAbilities').textContent = pokemon.abilities.map(abilityInfo => abilityInfo.ability.name).join(', ');
    
    fetchPokemonDescription(pokemon.species.url);
}

async function fetchPokemonDescription(url) {
    let response = await axios.get(url);
    let description = response.data.flavor_text_entries.find(entry => entry.language.name === 'en');
    document.querySelector('.pokemonDescrition').textContent = description ? description.flavor_text : 'No description available';
}