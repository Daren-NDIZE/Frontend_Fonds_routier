import { useEffect, useRef, useState } from "react"
import SearchBar from "../../component/searchBar"
import Loader from "../../component/loader"
import { Fetch } from "../../config/FetchRequest"
import PageLoader from "../../component/pageLoader"
import Notification from "../../component/notification"


function Action(){

    let [actions,setActions]=useState([])
    let [periode,setPeriode]=useState("")
    let [loader,setLoader]=useState(true)
    let [pageLoader,setPageLoader]=useState(false)


    
    let notification=useRef()
    let data=useRef()




    useEffect(()=>{

        (async function (){

            try{
                let res= await Fetch("action/getActionByPeriode","POST",{periode:"TODAY"})
                if(res.ok){
    
                    let resData= await res.json()
                    
                    setActions(resData)
                    data.current=resData
                }
    
            }catch(e){
                console.log(e)
            }finally{
                setLoader(false)
            }

        })()

    },[])

    const filter=async (e)=>{

        e.preventDefault()
        let form=e.target

        // if(form.nom.value==="" || form.prenom.value==="" || form.email.value==="" || form.telephone.value===""
        // || form.username.value==="" || form.roleName.value==="")
        // {
        //     setErreur("Veuillez remplir tous les champs")
        //     return;
        // }
       
        let formData =new FormData(form);
        let data=Object.fromEntries(formData)
        setPageLoader(true)

        try{
            let res= await Fetch("action/getActionByPeriode","POST",data)
            if(res.ok){

                let resData= await res.json()
                
                if(resData.type){

                    window.scroll({top: 0, behavior:"smooth"})
                    notification.current.setNotification({visible: true, type:resData.type,message:resData.message})
                }else{
                    setActions(resData)
                    data.current=resData
                }

                
            }

        }catch(e){
            console.log(e)
        }finally{
            setPageLoader(false)
        }

    }


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
            
            <Notification ref={notification} />

            <div className="flex">
                
                <div className="box a-filter">
                    <form className="s-filter" onSubmit={filter}>
                        <div>
                            <div className="form-line">
                                <label>Période</label>
                                <select name="periode" onChange={change} required>
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
                                    <input type="date"  name="firstDate" max={new Date().toISOString().split("T")[0]} required />
                                </div>
                                <div className="form-line">
                                    <label>À</label>
                                    <input type="date"  name="secondDate" max={new Date().toISOString().split("T")[0]} required/>
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
                    <SearchBar data={data.current} onSetData={setActions} keys={["utilisateur"]}/>
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
                                <th>Date</th>
                                <th>Utilisateur</th>
                                <th>Role</th>
                                <th>Actions éffectuées</th>
                            </tr>
                        </thead>
                        <tbody>
                            {actions.map((i,j)=>
                            <tr key={j}>
                                <td>{j+1}</td>
                                <td>{new Date(i.date).toLocaleDateString()}</td>
                                <td>{i.utilisateur}</td>
                                <td>{i.role}</td>
                                <td>{i.description.toUpperCase()}</td>

                            </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {pageLoader &&(
                <PageLoader/>
            )}
        </div>
    )
}


export default Action;