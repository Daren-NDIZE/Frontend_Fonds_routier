import { useEffect, useRef, useState } from "react"
import SearchBar from "../../component/searchBar"
import Loader from "../../component/loader"
import { Fetch, fetchGet } from "../../config/FetchRequest"
import Notification from "../../component/notification"
import ModalBox from "../../component/modalBox"
import PageLoader from "../../component/pageLoader"
import { useNavigate } from "react-router-dom"


function Roles(){

    let [roles,setRoles]=useState([])
    let [roleId,setRoleId]=useState()
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
                    setRoles(resData)
                }
            
            }catch(e){
                console.log(e)
            }finally{
                setLoader(false)
            }

        })()

    },[])

    const createRole=async (e)=>{

        e.preventDefault()
        let form=e.target

        if(erreur.length!==0){
            setErreur("")
        }
    
        if(form.roleName.value==="" || form.description.value==="")
        {
            setErreur("Veuillez remplir tous les champs")
            return;
        }
       
        let formData =new FormData(form);
        let data=Object.fromEntries(formData)

        modalBox.current.setModal(false)
        setPageLoader(true)

        try{
            let res= await Fetch("role/saveRole","POST",data)

            if(res.ok){

                let resData= await res.json()
                
                if(resData.type==="succes"){

                    let response = await fetchGet(`role/getAllRole`)
                    if(response.ok){
                        let dataRes= await response.json()
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

    const deleteRole=async (id)=>{

        setPageLoader(true)
        modal.current.setModal(false)

        try{
            let res= await Fetch(`role/deleteRole/${id}`,"DELETE")

            if(res.ok){

                let resData= await res.json()
                
                if(resData.type==="succes"){

                    setRoles(s=>s.filter(i=>i.id!==id))
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

    const openModal=(id)=>{

        setRoleId(id)
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
                        <button>Nouveau role</button>
                    </div>
                </div>
                <div className="tableBox">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>N°</th>
                                <th className="min-w2">intitulé</th>
                                <th>Description</th>
                                {check &&(
                                    <th></th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {roles.map((i,j)=>
                            <tr key={j}>
                                <td>{j+1}</td>
                                <td>{i.roleName}</td>
                                <td>{i.description}</td>
                                {check &&(
                                <td>
                                    <div className="t-action auto-w">
                                        <i className="fa-solid fa-trash-can" onClick={()=>openModal(i.id)}></i>
                                    </div>
                                </td>
                                )}
                            </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <ModalBox ref={modalBox} >

                <form className="flex-form" onSubmit={createRole} >
                    
                    <div>   
                        {erreur.length!==0 &&(
                            <p className="error-msg">{erreur}</p>
                        )}
                        <div className="form-line">
                            <label>intitulé <span>*</span></label>
                            <input type="text"  name="roleName" required/>
                        </div>
                        
                        <div className="form-line">
                            <label>Description <span>*</span></label>
                            <textarea name="description" required/>
                        </div>
                        <div className="form-line" style={{margin: "0"}}>
                            <button type="submit">Enregistrer</button>
                        </div>
                    </div>

                   
                </form>

            </ModalBox>

            <ModalBox ref={modal}>
                <div className="pg-modal">
                    <p>Voulez vous vraiment supprimer ce role?</p>
                    <div className="mb-content">
                        <button className="s-btn" onClick={()=>deleteRole(roleId)}>OUI</button>
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


export default Roles;