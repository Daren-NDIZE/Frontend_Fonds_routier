import { useEffect, useRef, useState } from "react"
import SearchBar from "../../component/searchBar"
import Loader from "../../component/loader"
import { Fetch, fetchGet } from "../../config/FetchRequest"
import Notification from "../../component/notification"
import ModalBox from "../../component/modalBox"
import PageLoader from "../../component/pageLoader"
import { useNavigate } from "react-router-dom"


function Permission(){

    let [roles,setRoles]=useState([])
    let [permissions,setPermissions]=useState([])
    let [id,setId]=useState({})
    let [loader,setLoader]=useState(true)
    let [erreur,setErreur]=useState("")
    let [pageLoader,setPageLoader]=useState()
    let [check,setCheck]=useState(false)

    const navigate=useNavigate()

    let notification=useRef()
    let modalBox=useRef()
    let modal=useRef()


    useEffect(()=>{

        (async function (){

            try{
                let res = await fetchGet(`role/getAllRole`)
                if(res.ok){
                    let resData= await res.json()
                    resData=resData.filter(i=>i.roleName!=="ADMIN")
                    setRoles(resData)
                }

                let response = await fetchGet(`getAllPermission`)
                if(response.ok){
                    let data= await response.json()
                    setPermissions(data)
                }

            }catch(e){
                console.log(e)
            }finally{
                setLoader(false)
            }

        })()


    },[])

    const givePermission=async (e)=>{

        e.preventDefault()
        let form=e.target

        if(erreur.length!==0){
            setErreur("")
        }
    
        if(isNaN(form.permission.value) || isNaN(form.role.value))
        {
            setErreur("Veuillez remplir tous les champs")
            return;
        }
       
        let formData =new FormData(form);
        let data=Object.fromEntries(formData)

        modalBox.current.setModal(false)
        setPageLoader(true)

        try{
            let res= await Fetch("givePermission","PUT",data)

            if(res.ok){

                let resData= await res.json()
                
                if(resData.type==="succes"){

                    let response = await fetchGet(`role/getAllRole`)
                    if(response.ok){
                        let dataRes= await response.json()
                        dataRes=dataRes.filter(i=>i.roleName!=="ADMIN")
                        setRoles(dataRes)
                    }
                }

                window.scroll({top: 0, behavior:"smooth"})
                notification.current.setNotification(
                    {visible: true, type:resData.type,message:resData.message}
                )
            }

        }catch(e){
            console.log(e)
        }finally{
            setPageLoader(false)
        }

    }

    const removePer=async (id)=>{

        if(isNaN(id.rId) || isNaN(id.perId)){
            return;
        }

        setPageLoader(true)
        modal.current.setModal(false)

        try{
            let res= await Fetch(`removePermission/${id.rId}/${id.perId}`,"DELETE")

            if(res.ok){

                let resData= await res.json()
                
                if(resData.type==="succes"){

                    let response = await fetchGet(`role/getAllRole`)

                    if(response.ok){
                        let dataRes= await response.json()
                        dataRes=dataRes.filter(i=>i.roleName!=="ADMIN")
                        setRoles(dataRes)
                    }
                }

                window.scroll({top: 0, behavior:"smooth"})
                notification.current.setNotification(
                    {visible: true, type:resData.type,message:resData.message}
                )
            }

        }catch(e){
            console.log(e)
        }finally{
            setPageLoader(false)
        }

    }

    const openModal=(rId,perId)=>{

        setId({rId,perId})
        modal.current.setModal(true)
    }
    
    const checked=(e)=>{

        setCheck(e.target.checked)
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
                <div className="retour-container">
                    <button className="retour-btn" onClick={()=>navigate(-1)}>
                        <i className="fa-solid fa-arrow-left"></i>
                         Retour
                    </button>
                </div>
                <div className="box b-search">
                    <SearchBar/>
                </div>
            </div>

            <div className="box">
                <div id="pg-title" className="suivi-pg">
                    <div>
                        <h1>Liste des roles</h1>
                    </div>
                    <div className="check-update">
                        <label htmlFor="check">Modifier</label>
                        <input type="checkbox" id="check" onChange={checked}/>
                    </div>
                    <div className="n-projet" onClick={()=>modalBox.current.setModal(true)}>
                        <button>Nouveau</button>
                    </div>
                </div>
                <div className="tableBox">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>N°</th>
                                <th>Role</th>
                                <th className="min-w2">Permission</th>
                            </tr>
                        </thead>
                        <tbody>
                            {roles.map((i,j)=>
                            <tr key={j}>
                                <td>{j+1}</td>
                                <td>{i.roleName}</td>
                                <td>
                                    {i.permissions.map((k,l)=>
                                        <div key={l} className="per-line">{k.description} {check && <i className="fa-solid fa-trash-can" onClick={()=>openModal(i.id,k.id)}></i>}</div>
                                    )}
                                </td>
                                
                            </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <ModalBox ref={modalBox} >

                <form className="flex-form" onSubmit={givePermission} >
                    
                    <div>   
                        {erreur.length!==0 &&(
                            <p className="error-msg">{erreur}</p>
                        )}
                        <div className="form-line">
                            <label>Role <span>*</span></label>
                            <select name="role" required>
                                <option value="">- - - - - - - - - - - - - - - - -</option>
                                {roles.map((i,j)=>
                                    <option key={j} value={i.id}>{i.roleName}</option>                                  
                                )}
                            </select>
                        </div>
                        
                        <div className="form-line">
                            <label>Permission <span>*</span></label>
                            <select name="permission" required>
                                <option value="">- - - - - - - - - - - - - - - - -</option>
                                {permissions.map((i,j)=>
                                    <option key={j} value={i.id}>{i.description}</option>                                  
                                )}
                            </select>
                        </div>
                        <div className="form-line" style={{margin: "0"}}>
                            <button type="submit">Enregistrer</button>
                        </div>
                    </div>

                </form>

            </ModalBox>

            <ModalBox ref={modal}>
                <div className="pg-modal">
                    <p>Voulez vous vraiment retirer cette permission?</p>
                    <div className="mb-content">
                        <button className="s-btn" onClick={()=>removePer(id)}>OUI</button>
                        <button className="b-btn" onClick={()=>modal.current.setModal(false)}>NON</button>
                    </div>
                </div>
            </ModalBox>

            {pageLoader &&(
                <PageLoader/>
            )}
        </div>
    )
}


export default Permission;