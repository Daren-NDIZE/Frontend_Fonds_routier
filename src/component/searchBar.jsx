import { useRef } from "react";


function SearchBar({data,keys, onSetData}){

    let target=useRef(null)

    const change=(e)=>{
        let value=e.target.value

        if(value===""){
            onSetData(data)
        }
    }

    const search=(e)=>{

        let newData=[]
        let value=target.current.value

        if(!value){
            return
        }

        data.forEach(i => {

            for(let j of keys){

                if(i[j]===null){
                    continue
                }
                let string=(i[j].toString()).toLowerCase()

                if(string.indexOf(value.toLowerCase())!==-1){
                    newData.push(i)
                    break;
                }
                
            }
        });

        onSetData(newData)
    }

    if(!data){

        return(
            <div className="searchbar">
                <input type="search" placeholder="rechercher. . . ." ref={target}  />
                <button >
                    <i className="fa-solid fa-magnifying-glass"></i>
                </button>
            </div>
        )
    }
    return(
        <div className="searchbar">
            <input type="search" placeholder="rechercher. . . ." ref={target} onChange={change} />
            <button onClick={search}>
                <i className="fa-solid fa-magnifying-glass"></i>
            </button>
        </div>
    )
}

export default SearchBar;