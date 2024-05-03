document.addEventListener('DOMContentLoaded', () => {
    const searchButton = document.querySelector('.buttonSearch');
    const input = document.getElementById('in1');
    const errorContainer = document.querySelector('.containerError');
    const infoContainer = document.querySelector('.containerInfo');
    const nameElement = document.querySelector('.pokemonName');
    const imgElement = document.querySelector('.pokemonImg');
    const typeElement = document.querySelector('.pokemonType');
    const descriptionElement = document.querySelector('.pokemonDescrition');
    const abilitiesElement = document.querySelector('.pokemonAbilities');
    const containerEvolution = document.querySelector('.containerEvolution');
    const buttonEvolution = document.querySelector('.buttonEvolution');
    let nextPokemon = '';
  
    searchButton.addEventListener('click', () => {
        const pokemonName = input.value.trim().toLowerCase();
      
        if (pokemonName === '') {
            showError('Ingrese el nombre de un Pokémon');
            return;
        }
  
      getPokemonData(pokemonName)
        .then((pokemonData) => {
            showPokemonInfo(pokemonData);
        })
        .catch((error) => {
            console.error("Vaya! algo salió mal. Es posible que el nombre de tu Pokémon esté mal escrito. Por favor revisa e intenta nuevamente.", error);
            showError('Vaya! algo salió mal. Es posible que el nombre de tu Pokémon esté mal escrito. Por favor revisa e intenta nuevamente.');
        });
    });
  
    function getPokemonData(name) {
        return axios.get(`https://pokeapi.co/api/v2/pokemon/${name}`)
        
        .then((response) => {
            const pokemonData = response.data;
            const speciesURL = pokemonData.species.url;
            return { ...pokemonData, speciesURL };
        })

        .catch((error) => {
            console.error("Pokémon no encontrado", error);
            throw new Error('Pokémon no encontrado');
        });
    }
  
    function getSpeciesData(speciesURL) {
        return axios.get(speciesURL)

        .then((response) => response.data)
        .catch((error) => {
            console.error("URL de la especie no encontrada", error);
            throw new Error('URL de la especie no encontrada');
        });
    }
  
    function getEvolutionChainData(evolutionChainURL) {
        return axios.get(evolutionChainURL)

        .then((response) => response.data)
        .catch((error) => {
            console.error("Información de la cadena de evolución no encontrada", error);
            throw new Error('Información de la cadena de evolución no encontrada');
        });
    }
  
    function showPokemonInfo(pokemonData) {
        nameElement.textContent = capitalizeFirstLetter(pokemonData.name);
        imgElement.src = pokemonData.sprites.front_default || '';
        typeElement.textContent = pokemonData.types.map(type => type.type.name).join(', ');
        abilitiesElement.textContent = pokemonData.abilities.map(ability => ability.ability.name).join(', ');
  
        const speciesURL = pokemonData.speciesURL;
  
        // Fetch species data to get description and evolution chain
        getSpeciesData(speciesURL)
        
        .then((speciesData) => {
            const flavorTextEntries = speciesData.flavor_text_entries.filter(entry => entry.language.name === 'es');
        
            if (flavorTextEntries.length > 0) {
                descriptionElement.textContent = flavorTextEntries[0].flavor_text;
            }

            if (speciesData.evolution_chain.url) {
                const evolutionChainURL = speciesData.evolution_chain.url;
                return getEvolutionChainData(evolutionChainURL);
            } 
            else {
                throw new Error('URL de la cadena de evolución no encontrada');
            }
        })

        .then((evolutionChainData) => {
            if (hasFurtherEvolution(evolutionChainData, pokemonData.species.name)) {
                containerEvolution.style.display = 'flex';
                nextPokemon = findNextEvolution(evolutionChainData.chain, pokemonData.species.name);
            } 
            else {
                containerEvolution.style.display = 'none';
            }
        })
        .catch((error) => {
            console.error("Descripción no disponible", error);
            descriptionElement.textContent = 'Descripción no disponible';
            containerEvolution.style.display = 'none';
        });
  
        infoContainer.style.display = 'flex';
        errorContainer.style.display = 'none';
    }
  
    function showError(message) {
        errorContainer.querySelector('p').textContent = message;
        errorContainer.style.display = 'flex';
        infoContainer.style.display = 'none';
    }
  
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
  
    function hasFurtherEvolution(evolutionChainData, speciesName) {
        function traverseChain(chain) {
            if (chain.species.name === speciesName) {
                return true;
            }
            if (chain.evolves_to && chain.evolves_to.length > 0) {
                for (let i = 0; i < chain.evolves_to.length; i++) {
                    if (traverseChain(chain.evolves_to[i])) {
                    return true;
                    }
                }
            }
            return false;
        }
      return traverseChain(evolutionChainData.chain);
    }

    function findNextEvolution(chain, currentSpeciesName) {
        function traverseChain(chain) {
            if (chain.species.name === currentSpeciesName) {
                if (chain.evolves_to.length > 0) {
                    return chain.evolves_to[0].species.name; // Assuming there's only one next evolution
                }
            } else {
                for (let i = 0; i < chain.evolves_to.length; i++) {
                    const nextEvolution = traverseChain(chain.evolves_to[i]);
                    if (nextEvolution) {
                        return nextEvolution;
                    }
                }
            }
            return null;
        }
    
        return traverseChain(chain);
    }

    buttonEvolution.addEventListener('click', () => {

        getPokemonData(nextPokemon)
        .then((pokemonData) => {
            showPokemonInfo(pokemonData);
        })
        .catch((error) => {
            console.error("Vaya! algo salió mal. Es posible que el nombre de tu Pokémon esté mal escrito. Por favor revisa e intenta nuevamente.", error);
            showError('Vaya! algo salió mal. Es posible que el nombre de tu Pokémon esté mal escrito. Por favor revisa e intenta nuevamente.');
        });
    });
});
  