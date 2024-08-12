import { useEffect, useRef, useState } from "react"
import SearchBar from "../../component/searchBar"
import Loader from "../../component/loader"
import { fetchGet } from "../../config/FetchRequest"
import { useNavigate } from "react-router-dom"


function Action(){

    let [actions,setActions]=useState([])
    let [periode,setPeriode]=useState("")
    let [loader,setLoader]=useState(true)

    const navigate=useNavigate()

    
    let modal=useRef()


    useEffect(()=>{

        (async function (){

            try{
                let res = await fetchGet(`role/getAllRole`)
                if(res.ok){
                    
                }
            
            }catch(e){
                console.log(e)
            }finally{
                setLoader(false)
            }

        })()

    },[])


    const change=(e)=>{

       setPeriode(e.target.value)
    }

    

    if(loader){
        return(
            <Loader/>
        )
    }

    return(
        <div className="container">

            <div className="flex">
                
                <div className="box a-filter">
                    <form className="s-filter">
                        <div>
                            <div className="form-line">
                                <label>Période</label>
                                <select name="ordonnateur" onChange={change}>
                                    <option value="TODAY">Aujourd'hui</option>
                                    <option value="WEEK">Cette semaine</option>
                                    <option value="MONTH">Ce mois</option>
                                    <option value="PERIODE">Séléctionner la période</option>
                                </select>
                            </div>
                            {periode==="PERIODE"?
                            <>
                                <div className="form-line">
                                    <label>De</label>
                                    <input type="date"  name="annee" max={new Date().toISOString().split("T")[0]} required />
                                </div>
                                <div className="form-line">
                                    <label>À</label>
                                    <input type="date"  name="annee" max={new Date().toISOString().split("T")[0]} required/>
                                </div>
                            </> 
                        
                            :
                            <>
                                <div className="form-line">
                                    <label>De</label>
                                    <input type="date" disabled/>
                                </div>
                                <div className="form-line">
                                    <label>À</label>
                                    <input type="date"  disabled/>
                                </div>
                            </>   
                            }
                        </div>
                        <div className="form-line">
                            <button>Valider</button>
                        </div>
                    </form>
                </div>   

                <div className="box b-search">
                    <SearchBar/>
                </div>
            </div>

            <div className="box">
                <div id="pg-title" className="suivi-pg">
                    <div>
                        <h1>Actions éffectuées</h1>
                    </div>
                </div>
                <div className="tableBox">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>N°</th>
                                <th>Utilisateur</th>
                                <th>Date</th>
                                <th>Heure</th>
                                <th>Action éffectuée</th>
                            </tr>
                        </thead>
                        <tbody>
                            {actions.map((i,j)=>
                            <tr key={j}>
                                <td>{j+1}</td>
                                <td>{i.roleName}</td>
                                <td>{i.description}</td>
                            </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    )
}


export default Action;