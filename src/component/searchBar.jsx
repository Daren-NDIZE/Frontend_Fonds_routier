

function SearchBar(){

    return(
        <div className="searchbar">
            <input type="search" placeholder="rechercher. . . ." />
            <button>
                <i className="fa-solid fa-magnifying-glass"></i>
            </button>
        </div>
    )
}

export default SearchBar;